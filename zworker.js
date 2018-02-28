importScripts('onworker.js');

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

class Adder {
  constructor() {
    this.addCount = -1;
    this.subCount = -1;
  }

  get subc() {
    return this.subCount;
  }

  add(a, b) {
    return a + b;
  }

  sub(a, b) {
    return a - b;
  }

  delay() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  delayedAdd(a, b) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ result: a + b });
      }, 2000);
    });
  }

  async delayedSub(a, b) {
    await this.delay();
    return a - b;
  }
}

var _target = Adder;
worklyExport(_target);