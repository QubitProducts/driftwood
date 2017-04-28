var expect = require('../expect')
var sinon = require('sinon')
var _ = require('slapdash')
var LEVELS = require('../../src/levels')
var browserLogger = require('../../src/logger/browser')

describe('browserLogger', function () {
  var consoleStub, log, reset
  var now = new Date()

  afterEach(function () {
    if (reset) {
      reset()
      reset = null
    }
  })

  function stubConsole (stub) {
    consoleStub = stub
    reset = browserLogger.__stubConsole__(consoleStub)
    log = browserLogger()
  }

  describe('when console only supports console.log', function () {
    beforeEach(function () {
      stubConsole({ log: sinon.stub() })
    })

    describe('and I log a warning', function () {
      beforeEach(function () {
        log('testing', 'warn', now, { message: 'Some warning' })
      })

      it('should log a message including a level', function () {
        expect(consoleStub.log).was.calledWith(sinon.match(/WARN/))
      })
    })
  })

  describe('when console supports grouping', function () {
    beforeEach(function () {
      var stub = _.reduce(LEVELS.NAMES, function (console, level) {
        console[level] = sinon.stub()
        return console
      }, {})

      _.assign(stub, {
        groupCollapsed: sinon.stub(),
        groupEnd: sinon.stub(),
        log: sinon.stub()
      })

      stubConsole(stub)
    })

    describe('when logging with metadata', function () {
      beforeEach(function () {
        log('testing', 'warn', now, {
          message: 'some warning foo',
          metadata: {
            number: 42,
            text: 'some text'
          }
        })
      })

      it('starts a collapsed group to contain the metadata', function () {
        expect(consoleStub.groupCollapsed).was.called()
        expect(consoleStub.groupCollapsed).was.calledWith(sinon.match(/some warning foo/))
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

    describe('when logging with an error', function () {
      var error

      beforeEach(function () {
        error = new Error('foo')
        log('testing', 'warn', now, {
          message: 'some warning foo',
          error: error
        })
      })

      it('should log the message', function () {
        expect(consoleStub.warn).was.calledWith(sinon.match(/some warning foo/))
      })

      describe('when console supports levels', function () {
        it('should log the error', function () {
          expect(consoleStub.error).was.calledWith(error)
        })
      })

      describe('when console doesn\'t support levels', function () {
        beforeEach(function () {
          stubConsole({ log: sinon.stub() })
          log('testing', 'warn', now, {
            message: 'some warning foo',
            error: error
          })
        })

        it('should log the error', function () {
          expect(consoleStub.log).was.calledWith(error)
        })
      })
    })

    describe('when logging with metadata that contains a length property', function () {
      /**
       * if we use _.each with an object that has a `length` property underscore
       * will treat it as a string and invoke us for keys 0..length.
       **/
      beforeEach(function () {
        log('testing', 'warn', now, {
          message: 'test',
          metadata: {
            hello: 'world',
            length: 10
          }
        })
      })

      it('console.log\'s the keys of the object', function () {
        expect(consoleStub.log).was.calledWith('hello', 'world')
        expect(consoleStub.log).was.calledWith('length', 10)
      })
    })

    describe('when logging with no metadata', function () {
      beforeEach(function () {
        log('testing', 'warn', now, { message: 'no metadata here' })
      })

      it('calls the specific level', function () {
        expect(consoleStub.warn).was.calledWith(sinon.match(/no metadata here/))
      })
    })
  })
})
