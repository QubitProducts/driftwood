var _ = require('slapdash')

var LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error' ]
var levelColors = {
  trace: '#6C7A89',
  debug: '#87D37C',
  info: '#446CB3',
  warn: '#E87E04',
  error: '#F22613'
}
var STORAGE_NAMESPACE = 'qubit_logger'

var console = getConsole()

/**
 * Generate the hex for a readable color against a white background
 **/
function randomReadableColor () {
  var h = Math.floor(Math.random() * 360)
  var s = Math.floor(Math.random() * 100) + '%'
  var l = Math.floor(Math.random() * 66) + '%'

  return [ 'hsl(', h, ',', s, ',', l, ')' ].join('')
}

function isBrowser () {
  return typeof window !== 'undefined'
}

function isNode () {
  return typeof global !== 'undefined'
}

function getConsole () {
  return (isBrowser() && window.console) ||
    (isNode() && global.console)
}

/**
 * Check to see if the logger name matches the patterns in local storage
 * Patterns can use '*' for wildcard matching and are comma separated
 */
function shouldConsoleLog (name) {
  if (isBrowser()) {
    try {
      var localStorage = window.localStorage
      var rawPatterns = localStorage.getItem(STORAGE_NAMESPACE) || ''
      var patterns = rawPatterns.split(',')

      return _.find(patterns, function (pattern) {
        var regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
        return regex.test(name)
      })
    } catch (err) {
      // intentionally swallow error
      return false
    }
  }

  // if we're not in a browser we can log quite happily for the time being
  return true
}

function consoleSupportsAllLevels () {
  return !_.find(LEVELS, function (level) {
    return !console[level]
  })
}

function consoleSupportsGrouping () {
  return console.groupCollapsed && console.groupEnd
}

/**
 * Practically is there a good chance it supports CSS?
 **/
function consoleIsFancy () {
  return console.timeline && console.table
}

function createConsoleLogger () {
  var allLevels = consoleSupportsAllLevels()
  var grouping = consoleSupportsGrouping()
  var isFancy = consoleIsFancy()
  var color = randomReadableColor()

  return function log (name, level, message, metadata) {
    if (grouping && hasMetadata()) {
      if (isFancy) {
        console.groupCollapsed.apply(console, formatFancyMessage())
      } else {
        console.groupCollapsed(formatMessage())
      }

      _.objectEach(metadata, function (value, key) {
        console.log(key, value)
      })

      console.groupEnd()
    } else if (allLevels) {
      if (isFancy) {
        console[level].apply(console, formatFancyMessage())
      } else {
        console[level](formatMessage())
      }
    } else {
      // just use console.log
      console.log(formatMessage())
    }

    function hasMetadata () {
      return metadata && _.keys(metadata).length > 0
    }

    function formatMessage () {
      return level.toUpperCase() + ' [' + name + ']: ' + message
    }

    function formatFancyMessage () {
      return [
        '%c' + level.toUpperCase() + '%c %c[' + name + ']%c: ' + message,
        'font-weight:bold;color:' + levelColors[level] + ';',
        '',
        'font-weight:bold;color:' + color + ';',
        ''
      ]
    }
  }
}

function compositeLogger (loggers) {
  return function (name, level, message, metadata) {
    _.each(loggers, function (logger) {
      logger(name, level, message, metadata)
    })
  }
}

function createLoggers (name, additionalLoggers) {
  var loggers = []

  if (shouldConsoleLog(name) && console) {
    loggers.push(createConsoleLogger(color))
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

  var logger = compositeLogger(createLoggers(name, additionalLoggers))
  return createLoggerAPI(name, logger, additionalLoggers)
}

createLogger.LEVELS = LEVELS

// Export functions for manually setting console object for testing
createLogger._setConsole = function _setConsole (value) {
  console = value
}

createLogger._resetConsole = function _resetConsole () {
  console = getConsole()
}

module.exports = createLogger
