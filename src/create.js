var _ = require('slapdash')
var patterns = require('./patterns')
var LEVELS = require('./levels')
var argsToComponents = require('./utils/argsToComponents')

function noop () { }

module.exports = function create (consoleLogger) {
  function enable (flags, opts) {
    patterns.set(flags || { '*': null }, opts)
  }

  function disable () {
    // It is very unlikely you would want to disable one and not the other,
    // so we disable both memory and localStorage to fit convention.
    patterns.set({})
    patterns.set({}, { persist: true })
  }

  function createAPI (name, logger, additionalLoggers) {
    var isEnabled = patterns.match(name)
    var minLevelIndex = _.indexOf(LEVELS, patterns.getLevel(name))

    function createSubLogger (subName) {
      return createLogger(name + ':' + subName, additionalLoggers)
    }

    _.each(LEVELS, function (level, levelIndex) {
      if (isEnabled && levelIndex >= minLevelIndex) {
        createSubLogger[level] = function subLogger () {
          var args = [].slice.apply(arguments)
          var now = new Date()
          logger(name, level, now, argsToComponents(args))
        }
      } else {
        createSubLogger[level] = noop
      }
    })

    return createSubLogger
  }

  function createLogger (name, additionalLoggers) {
    if (!name) throw new Error('name required')
    var loggers = consoleLogger ? [consoleLogger()] : []
    loggers = loggers.concat(additionalLoggers)
    return createAPI(name, compositeLogger, additionalLoggers)

    function compositeLogger (name, level, now, args) {
      _.each(loggers, function (logger) {
        try {
          logger(name, level, now, args)
        } catch (e) { }
      })
    }
  }

  createLogger.LEVELS = LEVELS
  createLogger.enable = enable
  createLogger.disable = disable

  return createLogger
}
