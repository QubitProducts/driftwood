window.log = require('../src/logger/browser')()
window.createLogger = require('../src/create')(window.log)
window.consoleUtils = require('./consoleUtils')
