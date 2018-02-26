const obj = {
  count: 1,
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

function fadd(a, b) {
  return a + b;
}

var _target = obj;

self.addEventListener('message', async event => {
  let data = event.data;
  data.path = data.path || [];
  const reduce = list => list.reduce((o, prop) => (o ? o[prop] : o), _target);
  let id = data && data.id;
  if (id && data.type) {
    let msg = { id };
    let ref = reduce(data.path);
    switch (data.type) {
      case "GET":
        msg.value = ref;
        break;
      case "APPLY":
        try {
          let fnThis = reduce(data.path.slice(0, -1));
          msg.value = await ref.apply(fnThis, data.args || []);
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