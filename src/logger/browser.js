var _ = require('slapdash')
var LEVELS = require('../levels')
var rightPad = require('../utils/rightPad')
var console = window.console

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
  return !_.find(LEVELS.NAMES, function (level) {
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
  return console.timeline && console.table && !window.__karma__
}

module.exports = function browserLogger () {
  if (!console) {
    return function noop () { }
  }

  var allLevels = consoleSupportsAllLevels()
  var grouping = consoleSupportsGrouping()
  var isFancy = consoleIsFancy()
  var color = randomReadableColor()

  return function log (name, level, now, components) {
    if (grouping && components.metadata) {
      if (isFancy) {
        console.groupCollapsed.apply(console, formatFancyMessage())
      } else {
        console.groupCollapsed(formatMessage())
      }

      _.objectEach(components.metadata, function (value, key) {
        console.log(key, value)
      })

      console.groupEnd()
    } else if (components.message) {
      if (allLevels) {
        if (isFancy) {
          console[level].apply(console, formatFancyMessage())
        } else {
          console[level](formatMessage())
        }
      } else {
        // just use console.log
        console.log(formatMessage())
      }
    }

    if (components.error) {
      if (allLevels) {
        console.error(components.error)
      } else {
        console.log(components.error)
      }
    }

    function formatMessage () {
      return rightPad(level.toUpperCase(), 5) + ' [' + name + ']: ' + components.message
    }

    function formatFancyMessage () {
      return [
        '%c' + rightPad(level.toUpperCase(), 5) + '%c %c[' + name + ']%c: ' + components.message,
        'font-weight:bold;color:' + levelColors[level] + ';',
        '',
        'font-weight:bold;color:' + color + ';',
        ''
      ]
    }
  }
}

// Rewire doesn't work in IE8 and inject-loader doesn't work in node, so we have
// to expose our own stubbing method
module.exports.__stubConsole__ = function (stub) {
  var oldConsole = console
  console = stub // eslint-disable-line
  return function reset () {
    console = oldConsole // eslint-disable-line
  }
}
