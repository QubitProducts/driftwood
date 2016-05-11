var createConsoleLogger = require('../src/createConsoleLogger')

function set (newConsole) {
  createConsoleLogger._setConsole(newConsole)
}

function reset () {
  createConsoleLogger._resetConsole()
}

function noop () {
  set({
    log: noop,
    warn: noop,
    trace: noop,
    error: noop,
    debug: noop,
    info: noop
  })
}

module.exports = {
  set: set,
  reset: reset,
  noop: noop
}
