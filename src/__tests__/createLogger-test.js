var expect = require('../../test/expect')
var sinon = require('sinon')
var _ = require('slapdash')
var createLogger = require('../createLogger')
var LEVELS = require('../levels')
var consoleUtils = require('../../test/consoleUtils')
var isBrowser = require('../isBrowser')

describe('createLogger', function () {
  var consoleStub
  var logger

  afterEach(createLogger.disable)
  afterEach(consoleUtils.reset)

  if (isBrowser()) {
    it('should expose the enable/disable api on the window in the browser', function () {
      expect(window.__qubit).to.be.an('object')
      expect(window.__qubit.logger).to.be.an('object')
      expect(window.__qubit.logger.enable).to.equal(createLogger.enable)
      expect(window.__qubit.logger.disable).to.equal(createLogger.disable)
    })
  } else {
    it('should not try and expose the enable/disable api in node', function () {
      expect(typeof window).to.equal('undefined')
    })
  }

  describe('with no name', function () {
    it('throws exception', function () {
      expect(function () {
        createLogger()
      }).to.throwException()
    })
  })

  describe('when logging is not enabled', function () {
    beforeEach('make sure flag is not set', createLogger.disable)

    beforeEach(function () {
      consoleStub = {
        log: sinon.stub()
      }
      consoleUtils.set(consoleStub)
      logger = createLogger('testing')
    })

    it('should not call console.log', function () {
      logger.info('This should not be logged')
      expect(consoleStub.log).was.notCalled()
    })
  })

  describe('when logging is enabled', function () {
    beforeEach(function () {
      createLogger.enable()
    })

    describe('if console does not exist', function () {
      it('should not attempt to console log', function () {
        consoleUtils.set(null)

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
        consoleUtils.set(consoleStub)
        parentLogger = createLogger('foo')
        childLogger = parentLogger('bar')
      })

      it('should create a child logger', function () {
        parentLogger.info('boz')
        expect(consoleStub.log).was.calledWith(sinon.match(/\[foo\]/))
        consoleStub.log.reset()
        childLogger.info('baz')
        expect(consoleStub.log).was.calledWith(sinon.match(/\[foo:bar\]/))
      })
    })

    describe('when additional loggers are provided', function () {
      var additionalLogger

      beforeEach(function () {
        consoleUtils.set(null)
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
            expect(additionalLogger).was.calledWith('testing', level, 'message')
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
