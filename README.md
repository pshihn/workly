# Workly    🏋️‍♀️→ 😄 

* A really simple way to move a stand-alone <b>function/class to a worker thread</b>.
* Or, **expose an object or function in a worker** to the main thread.
* All calls are made asynchronous. Works great with async/await.
* Only 1kB gzipped.

## Install

Download the latest from [dist folder](https://github.com/pshihn/workly/tree/master/dist)

or from npm:
```
npm install --save workly
```

## Usage

Moving a function to a worker is really simple.
```js
function busyAdd(a, b) {
  let st = Date.now();
  while (true) {
    if ((Date.now() - st) > 2000) break;
  }
  return a + b;
}

(async () => {
  let workerAdd = workly.proxy(busyAdd);
  console.log(await workerAdd(23, 16)); // 39
  // the busyAdd is executed in a worker so
  // the UI does not get blocked
})();
```

Or, in fact a Class

```js
class Adder {
  constructor() {
    this.count = 0;
  }
  add(a, b) {
    this.count++;
    return a + b;
  }
}

(async () => {
  let WAdder = workly.proxy(Adder);
  let a = await new WAdder(); // instance created/running in worker
  console.log(await a.count); // 0
  console.log(await a.add(23, 16)); // 39
  console.log(await a.count); // 1
})();
```

### Custom workers
The above examples only work when the class/function is not dependent on the containing scope, i.e. other libraries or global objects. But, you can create a custom worker.js file and move the code in there. In the worker, you can expose your object/function/class using <i>workly.expose</i> method.

In this example, the function depends on moment.js

<b>worker.js</b>
```js
importScripts('https://cdn.jsdelivr.net/npm/moment@2.20.1/moment.min.js', '../dist/workly.js');
function friendlyTime(value) {
  return moment(value).calendar(null, {
    sameDay: function (now) {
      if (now - this < 1000 * 60) {
        return "[Just now]";
      } else if (now - this < 1000 * 60 * 60) {
        return "[" + Math.round((now - this) / (1000 * 60)) + " mins ago]";
      } else {
        return '[Today at] LT'
      }
    }
  });
}
workly.expose(friendlyTime);
```
<b>main.js</b>
```js
(async () => {
  let w = workly.proxy("./worker.js");
  let now = Date.now();
  console.log(now);
  console.log(await w(now));
  console.log(await w(now - (24 * 60 * 60 * 1000)));
  console.log(await w(now - (4 * 24 * 60 * 60 * 1000)));
})();
```

### Caveats
* If you're not using a custom worker, the function/class being pushed to the worker cannot depend on the containing scope.
* Since workers do not have access to DOM, DOM manipulation is not supported. 
* Objects passed into functions are not passed by reference, so if the function in the worker updates the passed in object, it will not affect the object in the main scope. 

### Examples
See the [examples folder](https://github.com/pshihn/workly/tree/master/examples)

### License
[MIT License](https://github.com/pshihn/workly/blob/master/LICENSE) (c) [Preet Shihn](https://twitter.com/preetster)

### You may also be interested in
[windtalk](https://github.com/pshihn/windtalk) - Simplest way to communicate between windows or iframes. Work with objects/functions defined in another window or iframe.

