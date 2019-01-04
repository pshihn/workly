importScripts('https://cdn.jsdelivr.net/npm/moment@2.20.1/moment.min.js', '../dist/workly.js');

class FriendlyTime {
  constructor(name) {
    this.name = name;
    this._count = 0;
  }
  get count() {
    return this._count;
  }
  displayValue(value) {
    this._count++;
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
}

workly.expose(FriendlyTime);