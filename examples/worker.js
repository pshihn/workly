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