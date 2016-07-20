var _ = require('slapdash')
var createConsoleLogger = require('./createConsoleLogger')
var patterns = require('./patterns')
var LEVELS = require('./levels')

function noop () { }

function compositeLogger (name, loggers) {
  return function (name, level, message, metadata) {
    var date_now = new Date()
    _.each(loggers, function (logger) {
      try {
        logger(name, level, message, metadata, date_now, "")
      } catch (e) { }
    })
  }
}

function createLoggers (name, additionalLoggers) {
  var loggers = []

  var consoleLogger = createConsoleLogger()
  if (consoleLogger) {
    loggers.push(consoleLogger)
  }

  return loggers.concat(additionalLoggers)
}

function createLoggerAPI (name, logger, additionalLoggers) {
  function createSubLogger (subName) {
    return createLogger(name + ':' + subName, additionalLoggers)
  }

  var isEnabled = patterns.match(name)
  var minLevelIndex = _.indexOf(LEVELS, patterns.getLevel(name))

  _.each(LEVELS, function (level, levelIndex) {
    if (isEnabled && levelIndex >= minLevelIndex) {
      createSubLogger[level] = function (message, metadata) {
        logger(name, level, message, metadata)
      }
    } else {
      createSubLogger[level] = noop
    }
  })

  return createSubLogger
}

function createLogger (name, additionalLoggers) {
  if (!name) {
    throw new Error('name required')
  }

  var logger = compositeLogger(name, createLoggers(name, additionalLoggers))
  return createLoggerAPI(name, logger, additionalLoggers)
}

function enable (flags) {
  patterns.set(flags || { '*': null })
}

function disable () {
  patterns.set({})
}

createLogger.LEVELS = LEVELS
createLogger.enable = enable
createLogger.disable = disable

module.exports = createLogger
