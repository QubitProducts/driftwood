var _ = require('slapdash')
var LEVELS = require('./levels')

var levelColors = {
  trace: '#6C7A89',
  debug: '#87D37C',
  info: '#446CB3',
  warn: '#E87E04',
  error: '#F22613'
}

/**
 * Generate the hex for a readable color against a white background
 **/
function randomReadableColor () {
  var h = Math.floor(Math.random() * 360)
  var s = Math.floor(Math.random() * 100) + '%'
  var l = Math.floor(Math.random() * 66) + '%'

  return [ 'hsl(', h, ',', s, ',', l, ')' ].join('')
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

module.exports = createConsoleLogger
