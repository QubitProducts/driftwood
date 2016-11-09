var Chalk = require('chalk').constructor
var _ = require('slapdash')
var util = require('util')
var rightPad = require('../utils/rightPad')
var argsToComponents = require('../utils/argsToComponents')
var console = global.console

var chalk = new Chalk({
  enabled: process.env.NODE_ENV === 'test' ? false : undefined
})

var levelColors = {
  trace: 'gray',
  debug: 'green',
  info: 'blue',
  warn: 'yellow',
  error: 'red'
}

module.exports = function nodeLogger () {
  return function log (name, level, args) {
    var components = argsToComponents(args)

    if (!console) {
      return null
    }

    if (components.message) {
      console.log(formatMessage())
    }

    if (components.metadata) {
      console.log(util.inspect(components.metadata, { depth: null }))
    }

    if (components.error) {
      console.error(components.error)
    }

    function formatMessage () {
      var formattedName = _.reduce(name.split(':'), function (memo, value, index) {
        if (index !== 0) {
          return memo + chalk.gray(':') + chalk.magenta(value)
        }

        return memo + chalk.magenta(value)
      }, '')

      return [
        chalk.gray((new Date()).toJSON()),
        chalk.bold[levelColors[level]](rightPad(level.toUpperCase(), 5)),
        chalk.gray('[') + formattedName + chalk.gray(']'),
        chalk.white(components.message)
      ].join(' ')
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
