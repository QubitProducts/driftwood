var _ = require('slapdash')
var patterns = require('./patterns')
var LEVELS = require('./levels')
var argsToComponents = require('./utils/argsToComponents')
var createCompositeLogger = require('./utils/createCompositeLogger')
function noop () {}

module.exports = function createDriftwood (primaryLogger) {
  var globalState = { loggers: [], enabled: false }

  driftwood.enable = function enableAll (flags, options) {
    globalState.enabled = true
    if (flags) patterns.set(flags, options)
    _.invoke(globalState.loggers, 'enable', flags)
  }

  driftwood.disable = function disableAll () {
    globalState.enabled = false
    patterns.set({})
    patterns.set({}, { persist: true })
    _.invoke(globalState.loggers, 'disable')
  }

  driftwood.destroy = function destroyAll () {
    while (globalState.loggers.length) globalState.loggers.pop().destroy()
  }

  return driftwood

  function driftwood (name, additionalLoggers) {
    if (!name) throw new Error('name required')
    var state = { enabled: globalState.enabled, children: [], level: patterns.getLevel(name, patterns.get()) }
    var logger = additionalLoggers
      ? createCompositeLogger(primaryLogger, additionalLoggers)
      : primaryLogger

    var log = function createLogger (logName) {
      if (log.enable === noop) throw new Error(name + ' was destroyed')
      var childLog = driftwood(name + ':' + logName, additionalLoggers)
      if (state.enabled) childLog.enable()
      state.children.push(childLog)
      return childLog
    }

    log.enable = function enableLog (flags) {
      state.enabled = true
      if (flags) state.level = patterns.getLevel(name, flags)
      createLogLevelLoggers()
      _.invoke(state.children, 'enable', flags)
    }

    log.disable = function disableLog () {
      state.enabled = false
      createLogLevelLoggers()
      _.invoke(state.children, 'disable')
    }

    log.destroy = function destroyLog () {
      log.enable = noop
      log.disable()
      globalState.loggers = _.filter(globalState.loggers, function (logger) {
        return logger !== log
      })
      while (state.children.length) state.children.pop().destroy()
    }

    createLogLevelLoggers()
    globalState.loggers.push(log)
    return log

    function createLogLevelLoggers () {
      _.each(LEVELS.NAMES, function (logLevel) {
        log[logLevel] = state.enabled ? createLogLevelLogger(logLevel) : noop
      })
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
