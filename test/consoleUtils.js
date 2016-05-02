var originalConsole = console

function set (newConsole) {
  window.console = newConsole
}

function reset () {
  window.console = originalConsole
}

module.exports = {
  set: set,
  reset: reset
}
