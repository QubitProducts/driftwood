var expect = require('../../test/expect')
var sinon = require('sinon')
var _ = require('slapdash')
var consoleUtils = require('../../test/consoleUtils')
var createConsoleLogger = require('../createConsoleLogger')
var LEVELS = require('../levels')

describe('createConsoleLogger', function () {
  var logger
  var consoleStub

  afterEach(consoleUtils.reset)

  it('should return a function', function () {
    expect(createConsoleLogger()).to.be.a('function')
  })

  describe('when console only supports console.log', function () {
    beforeEach(function () {
      consoleStub = {
        log: sinon.stub()
      }
      consoleUtils.set(consoleStub)
      logger = createConsoleLogger()
    })

    describe('and I log a warning', function () {
      beforeEach(function () {
        logger('testing', 'warn', 'Some warning')
      })

      it('should log a message including a level', function () {
        expect(consoleStub.log).was.calledWith(sinon.match(/WARN/))
      })
    })
  })

  describe('when console supports grouping', function () {
    beforeEach(function () {
      consoleStub = _.reduce(LEVELS, function (console, level) {
        console[level] = sinon.stub()
        return console
      }, {})

      _.extend(consoleStub, {
        groupCollapsed: sinon.stub(),
        groupEnd: sinon.stub(),
        log: sinon.stub()
      })

      consoleUtils.set(consoleStub)
      logger = createConsoleLogger()
    })

    describe('when logging with metadata', function () {
      beforeEach(function () {
        logger('testing', 'warn', 'some warning', {
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
        logger('testing', 'warn', 'test', {
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
        logger('testing', 'warn', 'no metadata here')
      })

      it('calls the specific level', function () {
        expect(consoleStub.warn).was.calledWith(sinon.match(/no metadata here/))
      })
    })
  })
})
