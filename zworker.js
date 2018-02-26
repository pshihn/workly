const obj = {
  count: 1,
  stored: 0,
  increment() {
    this.count++;
  },
  add(a, b) {
    return a + b;
  },
  delayedAdd(a, b) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ result: a + b });
      }, 2000);
    });
  }
};

class Adder {
  constructor() {
    this.addCount = 0;
    this.subCount = 0;
  }
  add(a, b) {
    return a + b;
  }
  sub(a, b) {
    return a - b;
  }
}

function fAdd(a, b) {
  return a + b;
}

function fDelayedAdd(a, b) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ result: a + b });
    }, 2000);
  });
}

var _target = fDelayedAdd;

self.addEventListener('message', async event => {
  let data = event.data;
  data.path = data.path || [];
  const reduce = list => list.reduce((o, prop) => (o ? o[prop] : o), _target);
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
      default:
        console.log("message received", data);
        break;
    }
    self.postMessage(msg);
  }
});

console.log("Worker loaded", _target);