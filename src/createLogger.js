var _ = require('slapdash')
var createConsoleLogger = require('./createConsoleLogger')
var patterns = require('./patterns')
var LEVELS = require('./levels')

function compositeLogger (name, loggers) {
  var minLevelIndex = _.indexOf(LEVELS, patterns.getLevel(name))

  return function (name, level, message, metadata) {
    if (_.indexOf(LEVELS, level) >= minLevelIndex) {
      _.each(loggers, function (logger) {
        logger(name, level, message, metadata)
      })
    }
  }
}

function createLoggers (name, additionalLoggers) {
  var loggers = []

  if (patterns.match(name) && console) {
    loggers.push(createConsoleLogger())
  }

  return loggers.concat(additionalLoggers)
}

function createLoggerAPI (name, logger, additionalLoggers) {
  function createSubLogger (subName) {
    return createLogger(name + ':' + subName, additionalLoggers)
  }

  _.each(LEVELS, function (level) {
    createSubLogger[level] = function (message, metadata) {
      try {
        logger(name, level, message, metadata)
      } catch (err) {
        // intentionally throw away
      }
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

window.__qubit = window.__qubit || {}
window.__qubit.logger = window.__qubit.logger || {
  enable: enable,
  disable: disable,
  LEVELS: LEVELS
}

module.exports = createLogger
