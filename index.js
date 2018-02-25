// export default
function workly(url) {
  let worker = new Worker(url);
  let wp = new WorklyProxy(worker);
  return proxy(wp);
}

class WorklyProxy {
  constructor(worker) {
    this.w = worker;
    this.uid = `${Date.now()}-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
    this.c = 0; // counter
    this.cbs = {} // callbacks
    worker.addEventListener('message', event => {
      let id = event.data && event.data.id;
      let cb = id && this.cbs[id];
      if (cb) {
        delete this.cbs[id];
        if (event.data.error) {
          cb[1](event.data.error);
        } else {
          cb[0](event.data.value);
        }
      }
    });
  }
  remote(request) {
    const args = request.args || [];
    const id = `${this.uid}-${++this.c}`;
    return new Promise((resolve, reject) => {
      this.cbs[id] = [resolve, reject];
      const msg = Object.assign({}, request, { id, args });
      this.w.postMessage(msg);
    });
  }
}

function proxy(worker, path) {
  path = path || [];
  return new Proxy(function () { }, {
    get(target, prop, receiver) {
      if (prop === 'then') {
        const p = worker.remote({ type: 'GET', path });
        return Promise.resolve(p).then.bind(p);
      }
      return proxy(worker, path.concat(prop));
    },
    set(target, prop, value, receiver) {
      return worker.remote({ type: 'SET', path: path.concat(prop), value });
    },
    apply(target, thisArg, args) {
      return worker.remote({ type: 'APPLY', path, args });
    }
  });
}