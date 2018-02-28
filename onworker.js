function worklyExport(target) {
  var _target = target;
  var _tmap = {};
  let _exportObject = obj => {
    const tid = `${Date.now()}-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
    _tmap[tid] = obj;
    return tid;
  };
  self.addEventListener('message', async event => {
    let data = event.data;
    data.path = data.path || [];
    let msgTarget = (data.target && _tmap[data.target]) || _target;
    const reduce = list => list.reduce((o, prop) => (o ? o[prop] : o), msgTarget);
    let id = data && data.id;
    if (id && data.type) {
      let msg = { id };
      const ref = reduce(data.path);
      const refParent = reduce(data.path.slice(0, -1));
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
            msg.error = err;
          }
          break;
        case "CONSTRUCT":
          try {
            msg.value = new ref(...data.args);
            msg.targetId = _exportObject(msg.value);
          } catch (err) {
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