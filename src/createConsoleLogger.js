var _ = require('slapdash')
var LEVELS = require('./levels')
var isBrowser = require('./isBrowser')

var levelColors = {
  trace: '#6C7A89',
  debug: '#87D37C',
  info: '#446CB3',
  warn: '#E87E04',
  error: '#F22613'
}
var console = getConsole()

function getConsole () {
  if (isBrowser()) {
    return window.console
  }
  return global.console
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
  return console.timeline && console.table && !window.__karma__
}

function createConsoleLogger () {
  if (!console) {
    return null
  }

  var allLevels = consoleSupportsAllLevels()
  var grouping = consoleSupportsGrouping()
  var isFancy = consoleIsFancy()
  var color = randomReadableColor()

  return function log (name, level, message, metadata, date, formatting) {
    //  This is what'll get called everytime we want to send a message.
    //
    //  name(str)      : The name of the logger
    //  level(str)     : one of 'trace', 'debug', 'info', 'warn', 'error'
    //  message(str)   : What message do we want to log
    //  metadata(obj)  : Any metadata we'd also like to output
    //
    //  {
    //    "some_val" : x,
    //    "foo"      : "bar"
    //  }
    //
    //  date(date)     : the current date
    //  formatting(str): a formatting string, of the form:
    //  "KEY1 KEY2 KEY3"
    //
    //  Where key can be any from the formattingMapping object.
    
    // These are the valid mappings for formatting the output.
    formattingMapping = {
      "NAME"    : name,
      "LEVEL"   : level.toUpperCase(),
      "MESSAGE" : message,
      "DATE"    : date
    }

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

    function getFormatting () {
      // Here we're gonna check if we've got a formatting string
      // If we havent, we'll use the default
      if (formatting) {
        return formatting
      } else {
	// If this logger didnt get a formatting string, use this default.
	// some_date - [MYLOGGER_INFO]: SOME_MESSAGE
        return "DATE - [NAME] LEVEL : MESSAGE"
      }
    }

    function formatMessage () {
      // Lets loop over all the items in the formattingMapping object,
      // and put them into the output
      // http://stackoverflow.com/a/921808
      
      msg = getFormatting()
      for (var key in formattingMapping) {
        // Skip loop if the property is from prototype
	if (!formattingMapping.hasOwnProperty(key)) continue;

        var obj = formattingMapping[key];
	msg = msg.replace(key, obj)
      }
     console.log(msg)
     return msg
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

module.exports._setConsole = function set (newConsole) {
  console = newConsole
}
module.exports._resetConsole = function reset () {
  console = getConsole()
}
