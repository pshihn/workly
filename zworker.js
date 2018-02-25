const obj = {
  count: 0,
  increment() {
    this.count++;
  },
  add(a, b) {
    return a + b;
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

self.addEventListener('message', event => {
  let data = event.data;
  let id = data && data.id;
  if (id && data.type) {
    let msg = { id };
    switch (data.type) {
      case "GET":
        msg.value = (data.path || []).reduce((o, prop) => (o ? o[prop] : o), _target);
        break;
      default:
        console.log("message received", data);
        break;
    }
    self.postMessage(msg);
  }
});

console.log("Worker loaded", _target);