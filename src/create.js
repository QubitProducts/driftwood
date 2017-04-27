var patterns = require('./patterns')
var LEVELS = require('./levels')
var argsToComponents = require('./utils/argsToComponents')
var createCompositeLogger = require('./utils/createCompositeLogger')
function noop () {}

module.exports = function createDriftwood (primaryLogger) {
  var loggers = []

  driftwood.enable = function enableAll (flags, options) {
    if (flags) patterns.set(flags, options)
    for (var i = 0; i < loggers.length; i++) loggers[i].enable(flags)
  }

  driftwood.disable = function disableAll () {
    patterns.set({})
    patterns.set({}, { persist: true })
    for (var i = 0; i < loggers.length; i++) loggers[i].disable()
  }

  return driftwood

  function driftwood (name, additionalLoggers) {
    if (!name) throw new Error('name required')
    var state = { enabled: false, children: [], level: patterns.getLevel(name, patterns.get()) }
    var logger = additionalLoggers
      ? createCompositeLogger(primaryLogger, additionalLoggers)
      : primaryLogger

    var log = function createLogger (logName) {
      var log = driftwood(name + ':' + logName, additionalLoggers)
      if (state.enabled) log.enable()
      state.children.push(log)
      return log
    }

    log.enable = function enableLog (flags) {
      state.enabled = true
      if (flags) state.level = patterns.getLevel(name, flags)
      createLogLevelLoggers()
      for (var i = 0; i < state.children.length; i++) state.children[i].enable(flags)
    }

    log.disable = function disableLog () {
      state.enabled = false
      createLogLevelLoggers()
      for (var i = 0; i < state.children.length; i++) state.children[i].disable()
    }

    createLogLevelLoggers()

    loggers.push(log)

    return log

    function createLogLevelLoggers () {
      for (var i = 0; i < LEVELS.NAMES.length; i++) {
        var logLevel = LEVELS.NAMES[i]
        log[logLevel] = state.enabled ? createLogLevelLogger(logLevel) : noop
      }
    }

    function createLogLevelLogger (logLevel) {
      var logLevelIndex = LEVELS.INDEX[logLevel]
      return function log () {
        if (!state.enabled || logLevelIndex < LEVELS.INDEX[state.level]) return
        try {
          logger(name, logLevel, new Date(), argsToComponents(arguments))
        } catch (e) { }
      }
    }
  }
}
