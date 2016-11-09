function noop () {}

function isBrowser () {
  return typeof window !== 'undefined'
}

function noopAll (log) {
  var levels = ['log', 'warn', 'trace', 'error', 'debug', 'info']
  var restore = []
  levels.forEach(function noopLevel (level) {
    var original = log[level] || noop
    log[level] = noop
    restore.push(function () {
      log[level] = original
    })
  })
  return function restoreAll () {
    while (restore.length) restore.pop()()
  }
}

module.exports = {
  isBrowser: isBrowser,
  noop: noopAll
}
