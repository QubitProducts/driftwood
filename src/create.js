var _ = require('slapdash')
var patterns = require('./patterns')
var LEVELS = require('./levels')
var argsToComponents = require('./utils/argsToComponents')
var compose = require('./utils/compose')
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

  function driftwood (name, additionalLoggers, interceptors) {
    if (!name) throw new Error('name required')
    var config = patterns.get()
    var state = {
      enabled: globalState.enabled || patterns.match(name, config),
      level: patterns.getLevel(name, config),
      children: []
    }
    var logger = additionalLoggers && additionalLoggers.length > 0
      ? compose(primaryLogger, additionalLoggers)
      : primaryLogger

    var log = function createLogger (logName, extraAdditionalLoggers, extraInterceptors) {
      if (log.enable === noop) throw new Error(name + ' was destroyed')
      var childLog = driftwood(
        name + ':' + logName,
        (additionalLoggers || []).concat(extraAdditionalLoggers || []),
        (interceptors || []).concat(extraInterceptors || [])
      )
      if (state.enabled) childLog.enable()
      state.children.push(childLog)
      return childLog
    }

    log.enable = function enableLog (flags) {
      state.enabled = true
      if (flags) state.level = patterns.getLevel(name, flags)
      createAPI()
      _.invoke(state.children, 'enable', flags)
    }

    log.disable = function disableLog () {
      state.enabled = false
      createAPI()
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

    createAPI()
    globalState.loggers.push(log)
    return log

    function intercept (args) {
      if (interceptors && interceptors.length > 0) {
        for (var i = 0; i < interceptors.length; i++) {
          var result = interceptors[i].apply(undefined, args)
          if (_.isArray(result) && result.length === 4) {
            args = result
          } else if (_.isObject(result)) {
            args[3] = result
          } else if (typeof result === 'string') {
            args[3].message = result
          }
        }
      }
      return args
    }

    function createAPI () {
      _.each(LEVELS.NAMES, function addLevelLogger (logLevel) {
        var index = LEVELS.INDEX[logLevel]
        log[logLevel] = state.enabled
          ? function levelLogger () {
            if (index >= LEVELS.INDEX[state.level]) {
              var args = [name, logLevel, new Date(), argsToComponents(arguments)]
              args = intercept(args)
              try {
                logger.apply(undefined, args)
              } catch (e) { }
            }
          }
          : noop
      })
    }
  }
}
