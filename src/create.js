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

      if (interceptors) { // TODO: remove
        console.log('[a]', interceptors)
        console.log('[b]', extraInterceptors)
        console.log('[c]', interceptors || [])
        console.log('[d]', extraInterceptors || [])
        console.log('[e]', (interceptors || []).concat(extraInterceptors || []))
        console.log('[f]', [0].concat([1, 2, 3]))
      }

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
        console.log('--', interceptors)
        for (var i = 0; i < interceptors.length; i++) {
          console.log('--', i, args)
          args = interceptors[i](args.slice()) || args
        }
        console.log('--', i, args)
      }
      return args
    }

    function createAPI () {
      _.each(LEVELS.NAMES, function addLevelLogger (logLevel) {
        var index = LEVELS.INDEX[logLevel]
        log[logLevel] = state.enabled
          ? function levelLogger () {
            if (index >= LEVELS.INDEX[state.level]) {
              try {
                var args = [].slice.apply(arguments)
                args = intercept(args)
                var components = argsToComponents(args)
                logger(name, logLevel, new Date(), components)
              } catch (e) { }
            }
          }
          : noop
      })
    }
  }
}
