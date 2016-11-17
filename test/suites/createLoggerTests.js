var _ = require('slapdash')
var sinon = require('sinon')
var expect = require('../expect')
var create = require('../../src/create')
var LEVELS = require('../../src/levels')

module.exports = function suite (type, log) {
  describe('createLogger (' + type + ')', function () {
    var createLogger, logger, consoleStub, reset

    afterEach(function () {
      if (reset) {
        reset()
        reset = null
      }
    })

    function stubConsole (stub) {
      reset = log.__stubConsole__(stub)
    }

    describe('with no name', function () {
      it('throws exception', function () {
        expect(function () {
          create(log)()
        }).to.throwException()
      })
    })

    describe('when logging is not enabled', function () {
      beforeEach(function () {
        consoleStub = {
          log: sinon.stub()
        }
        stubConsole(consoleStub)
        createLogger = create(log)
        createLogger.disable()
        logger = createLogger('testing')
      })

      it('should not call console.log', function () {
        logger.info('This should not be logged')
        expect(consoleStub.log).was.notCalled()
      })
    })

    describe('when logging is enabled', function () {
      beforeEach(function () {
        createLogger = create(log)
        createLogger.enable()
      })

      describe('if console does not exist', function () {
        it('should not attempt to console log', function () {
          stubConsole(null)
          createLogger = create(log)

          expect(function () {
            logger = createLogger('testing')
            logger.info('foo')
          }).to.not.throwError()
        })
      })

      describe('when logger function is invoked', function () {
        var parentLogger
        var childLogger

        beforeEach(function () {
          consoleStub = {
            log: sinon.stub()
          }
          stubConsole(consoleStub)
          createLogger = create(log)
          parentLogger = createLogger('foo')
          childLogger = parentLogger('bar')
        })

        it('should create a child logger', function () {
          parentLogger.info('boz')
          expect(consoleStub.log).was.calledWith(sinon.match(/\[foo]/))
          consoleStub.log.reset()
          childLogger.info('baz')
          expect(consoleStub.log).was.calledWith(sinon.match(/\[foo:bar]/))
        })
      })

      describe('when additional loggers are provided', function () {
        var additionalLogger

        beforeEach(function () {
          stubConsole(consoleStub)
          createLogger = create(log)
          additionalLogger = sinon.stub()
          createLogger.enable({ '*': 'trace' })
          logger = createLogger('testing', [additionalLogger])
        })

        _.each(LEVELS, function (level) {
          describe('and logging "' + level + '" message', function () {
            beforeEach(function () {
              logger[level]('message')
            })

            it('should have logged message at that level', function () {
              expect(additionalLogger).was.calledWith('testing', level, { message: 'message' })
            })
          })
        })

        describe('but additional logger throws an error', function () {
          beforeEach(function () {
            additionalLogger.throws(new Error('BAH - I\'m bust!'))
          })

          it('shouldn\'t throw an exception when logging', function () {
            logger.info('hi test')
          })
        })
      })
    })
  })
}
