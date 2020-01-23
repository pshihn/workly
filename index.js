export function proxy(obj) {
  let url, ourl;
  if (typeof obj === 'function') {
    const tos = Function.prototype.toString;
    url = ourl = URL.createObjectURL(new Blob([`${tos.call(randomInt)}\n(${tos.call(expose)})(${tos.call(obj)})`]));
  } else if (typeof obj === 'string') {
    url = obj;
    if (obj.indexOf('blob:') === 0) ourl = url;
  }
  if (url) {
    let wrkr = new Worker(url);
    if (ourl) wrkr.oURL = ourl;
    return _proxy(new WorklyProxy(wrkr));
  }
  throw "Workly only supports functions, classes, urls";
}

export function link(worker) {
  return _proxy(new WorklyProxy(worker));
}

function _proxy(worker, path) {
  path = path || [];
  return new Proxy(function () { }, {
    get(_, prop, receiver) {
      if (prop === 'then') {
        if (path.length === 0) {
          return { then: () => receiver };
        }
        const p = worker.remote({ type: 'GET', path });
        return p.then.bind(p);
      }
      return _proxy(worker, path.concat(prop));
    },
    set(_, prop, value) {
      return worker.remote({ type: 'SET', path: path.concat(prop), value });
    },
    apply(_, thisArg, args) {
      return worker.remote({ type: 'APPLY', path, args });
    },
    construct(_, args) {
      return worker.remote({ type: 'CONSTRUCT', args });
    }
  });
}

class WorklyProxy {
  constructor(worker, targetId) {
    this.w = worker;
    this.uid = targetId || `${Date.now()}-${randomInt()}`;
    this.c = 0; // counter
    this.cbs = {} // callbacks
    worker.addEventListener('message', event => {
      if (this.w.oURL) {
        try { URL.revokeObjectURL(this.w.oURL); } catch (err) { } finally { delete this.w.oURL; }
      }
      let id = event.data && event.data.id;
      let cb = id && this.cbs[id];
      if (cb) {
        delete this.cbs[id];
        if (event.data.error) {
          cb[1](new Error(event.data.error));
        } else {
          cb[0](event.data.targetId ? _proxy(new WorklyProxy(worker, event.data.targetId)) : event.data.value);
        }
      }
    });
  }
  remote(request) {
    const args = request.args || [],
      id = `${this.uid}-${++this.c}`;
    return new Promise((resolve, reject) => {
      this.cbs[id] = [resolve, reject];
      this.w.postMessage(Object.assign({}, request, { id, args, target: this.uid }));
    });
  }
}

function randomInt() { return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER); }
export function expose(target) {
  const _target = target, _tmap = {};
  const expObj = obj => {
    const tid = `${Date.now()}-${randomInt()}`;
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
            msg.error = err.toString();
          }
          break;
        case "CONSTRUCT":
          try {
            msg.value = new ref(...data.args);
            msg.targetId = expObj(msg.value);
          } catch (err) {
            msg.error = err.toString();
          }
          break;
      }
      self.postMessage(msg);
    }
  });
}