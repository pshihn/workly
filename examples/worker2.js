importScripts('../dist/workly.js');

var obj = {
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

workly.expose(obj);