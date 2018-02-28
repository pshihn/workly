// export default
function workly(obj) {
  let url;
  if (typeof obj === 'function') {
    const tos = Function.prototype.toString;
    let script = `(${tos.call(worklyExport)})(${tos.call(obj)})`;
    url = URL.createObjectURL(new Blob([script]));
  } else if (typeof obj === 'string') {
    url = obj;
  }
  if (url) {
    let wrkr = new Worker(url);
    return proxy(new WorklyProxy(wrkr));
  } else {
    throw "Workly only supports functions, classes, urls";
  }
}

function proxy(worker, path) {
  path = path || [];
  return new Proxy(function () { }, {
    get(target, prop, receiver) {
      if (prop === 'then') {
        if (path.length === 0) {
          return { then: () => receiver };
        }
        const p = worker.remote({ type: 'GET', path });
        return p.then.bind(p);
      }
      return proxy(worker, path.concat(prop));
    },
    set(target, prop, value, receiver) {
      return worker.remote({ type: 'SET', path: path.concat(prop), value });
    },
    apply(target, thisArg, args) {
      return worker.remote({ type: 'APPLY', path, args });
    },
    construct(target, args, newTarget) {
      return worker.remote({ type: 'CONSTRUCT', args });
    }
  });
}

class WorklyProxy {
  constructor(worker, targetId) {
    this.w = worker;
    this.uid = targetId || `${Date.now()}-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
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
          cb[0](event.data.targetId ? proxy(new WorklyProxy(worker, event.data.targetId)) : event.data.value);
        }
      }
    });
  }
  remote(request) {
    const args = request.args || [];
    const id = `${this.uid}-${++this.c}`;
    return new Promise((resolve, reject) => {
      this.cbs[id] = [resolve, reject];
      const msg = Object.assign({}, request, { id, args, target: this.uid });
      this.w.postMessage(msg);
    });
  }
}

function worklyExport(target) {
  const _target = target, _tmap = {};
  const expObj = obj => {
    const tid = `${Date.now()}-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
    _tmap[tid] = obj;
    return tid;
  };
  self.addEventListener('message', async event => {
    let data = event.data || {}
    data.path = data.path || [];
    let msgTarget = (data.target && _tmap[data.target]) || _target;
    const reduce = list => list.reduce((o, prop) => (o ? o[prop] : o), msgTarget);
    const id = data && data.id;
    if (id && data.type) {
      const msg = { id },
        ref = reduce(data.path),
        refParent = reduce(data.path.slice(0, -1));
      switch (data.type) {
        case "GET":
          msg.value = ref;
          break;
        case "SET":
          let prop = data.path.length && data.path[data.path.length - 1];
          if (prop) {
            refParent[prop] = data.value;
          }
          msg.value = prop ? true : false;
          break;
        case "APPLY":
          try {
            msg.value = await ref.apply(refParent, data.args || []);
          } catch (err) {
            // TODO: serialize error
            msg.error = err;
          }
          break;
        case "CONSTRUCT":
          try {
            msg.value = new ref(...data.args);
            msg.targetId = expObj(msg.value);
          } catch (err) {
            // TODO: serialize error
            msg.error = err;
          }
          break;
        default:
          console.log("message received", data);
          break;
      }
      self.postMessage(msg);
    }
  });
}