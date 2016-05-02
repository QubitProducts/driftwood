var createConsoleLogger = require('../src/createConsoleLogger')

function set (newConsole) {
  createConsoleLogger._setConsole(newConsole)
}

function reset () {
  createConsoleLogger._resetConsole()
}

module.exports = {
  set: set,
  reset: reset
}
