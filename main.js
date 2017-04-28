var logger

if (typeof global !== 'undefined' && global.console) {
  logger = require('./src/logger/node')
}

module.exports = require('./src/create')(logger && logger())
