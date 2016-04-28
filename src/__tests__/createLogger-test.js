var expect = require('../../test/expect')
var sinon = require('sinon')
var _ = require('slapdash')
var createLogger = require('../createLogger')

describe('createLogger', function () {
  describe('with no name', function () {
    it('throws exception', function () {
      expect(function () {
        createLogger()
      }).to.throwException()
    })
  })

  describe('when additional loggers are provided', function () {
    var additionalLogger
    var logger

    beforeEach(function () {
      additionalLogger = sinon.stub()

      logger = createLogger('testing', [additionalLogger])
    })

    _.each(createLogger.LEVELS, function (level) {
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

  describe('when logging is not set in localStorage', function () {
    var consoleStub
    var logger

    beforeEach('make sure flag is not set', function () {
      window.localStorage.removeItem('qubit_logger')
    })

    beforeEach(function () {
      consoleStub = {
        log: sinon.stub()
      }
      createLogger._setConsole(consoleStub)
      logger = createLogger('testing')
    })

    afterEach(createLogger._resetConsole)

    it('should not call console.log', function () {
      logger.info('This should not be logged')
      expect(consoleStub.log).was.notCalled()
    })
  })

  describe('when logging flag is set in localStorage', function () {
    beforeEach(function () {
      window.localStorage.setItem('qubit_logger', '*')
    })

    afterEach(function () {
      window.localStorage.removeItem('qubit_logger')
    })

    describe('when logger function is invoked', function () {
      var parentLogger
      var childLogger
      var consoleStub

      beforeEach(function () {
        consoleStub = {
          log: sinon.stub()
        }
        createLogger._setConsole(consoleStub)
        parentLogger = createLogger('foo')
        childLogger = parentLogger('bar')
      })

      afterEach(createLogger._resetConsole)

      it('should create a child logger', function () {
        parentLogger.debug('boz')
        expect(consoleStub.log).was.calledWith(sinon.match(/\[foo\]/))
        consoleStub.log.reset()
        childLogger.debug('baz')
        expect(consoleStub.log).was.calledWith(sinon.match(/\[foo:bar\]/))
      })
    })

    describe('when console only supports console.log', function () {
      var consoleStub
      var logger

      beforeEach(function () {
        consoleStub = {
          log: sinon.stub()
        }
        createLogger._setConsole(consoleStub)
        logger = createLogger('testing')
      })

      afterEach(createLogger._resetConsole)

      describe('and I log a warning', function () {
        beforeEach(function () {
          logger.warn('Some warning')
        })

        it('should log a message including a level', function () {
          expect(consoleStub.log).was.calledWith(sinon.match(/WARN/))
        })
      })
    })

    describe('when console supports grouping', function () {
      var consoleStub
      var logger

      beforeEach(function () {
        consoleStub = _.reduce(createLogger.LEVELS, function (console, level) {
          console[level] = sinon.stub()
          return console
        }, {})

        _.extend(consoleStub, {
          groupCollapsed: sinon.stub(),
          groupEnd: sinon.stub(),
          log: sinon.stub()
        })

        createLogger._setConsole(consoleStub)
        logger = createLogger('testing')
      })

      afterEach(createLogger._resetConsole)

      describe('when logging with metadata', function () {
        beforeEach(function () {
          logger.warn('some warning', {
            number: 42,
            text: 'some text'
          })
        })

        it('starts a collapsed group to contain the metadata', function () {
          expect(consoleStub.groupCollapsed).was.calledWith(sinon.match(/some warning/))
        })

        it('name contains level', function () {
          expect(consoleStub.groupCollapsed).was.calledWith(sinon.match(/WARN/))
        })

        it('ends a group', function () {
          expect(consoleStub.groupEnd).was.called()
        })

        it('console.log\'s the metadata', function () {
          expect(consoleStub.log).was.calledWith('number', 42)
          expect(consoleStub.log).was.calledWith('text', 'some text')
        })
      })

      describe('when logging with metadata that contains a length property', function () {
        /**
         * if we use _.each with an object that has a `length` property underscore
         * will treat it as a string and invoke us for keys 0..length.
         **/
        beforeEach(function () {
          logger.warn('test', {
            hello: 'world',
            length: 10
          })
        })

        it('console.log\'s the keys of the object', function () {
          expect(consoleStub.log).was.calledWith('hello', 'world')
          expect(consoleStub.log).was.calledWith('length', 10)
        })
      })

      describe('when logging with no metadata', function () {
        beforeEach(function () {
          logger.warn('no metadata here')
        })

        it('calls the specific level', function () {
          expect(consoleStub.warn).was.calledWith(sinon.match(/no metadata here/))
        })
      })
    })
  })

  describe('when logging flag contains multiple patterns', function () {
    var consoleStub

    beforeEach(function () {
      consoleStub = {
        log: sinon.stub()
      }
      createLogger._setConsole(consoleStub)
      window.localStorage.setItem('qubit_logger', 'foo:*,bar')
    })

    afterEach(function () {
      window.localStorage.removeItem('qubit_logger')
      createLogger._resetConsole()
    })

    it('should support exact matching', function () {
      createLogger('bar').debug('foo')
      createLogger('barz').debug('foo')
      expect(consoleStub.log).was.calledOnce()
    })

    it('should support wildcard matching', function () {
      createLogger('foo:').debug('foo')
      createLogger('foo:bar').debug('foo')
      expect(consoleStub.log).was.calledTwice()
    })
  })
})
