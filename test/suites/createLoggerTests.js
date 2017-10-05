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
          create(log())()
        }).to.throwException()
      })
    })

    describe('when logging is not enabled', function () {
      beforeEach(function () {
        consoleStub = {
          log: sinon.stub()
        }
        stubConsole(consoleStub)
        createLogger = create(log())
        logger = createLogger('testing')
        logger.disable()
      })

      it('should not call console.log', function () {
        logger.info('This should not be logged')
        expect(consoleStub.log).was.notCalled()
      })
    })

    describe('when logging is enabled', function () {
      describe('if console does not exist', function () {
        it('should not attempt to console log', function () {
          stubConsole(null)
          createLogger = create(log())
          logger = createLogger('testing')
          logger.enable()
          expect(function () {
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
          createLogger = create(log())
          parentLogger = createLogger('foo')
          childLogger = parentLogger('bar')
          parentLogger.enable()
        })

        it('should create a child logger', function () {
          parentLogger.info('boz')
          expect(consoleStub.log).was.calledWith(sinon.match(/\[foo]/))
          consoleStub.log.reset()
          childLogger.info('baz')
          expect(consoleStub.log).was.calledWith(sinon.match(/\[foo:bar]/))
        })
      })

      describe('global disable', function () {
        var logger1
        var logger2

        beforeEach(function () {
          consoleStub = { log: sinon.stub() }
          stubConsole(consoleStub)
          createLogger = create(log())
          logger1 = createLogger('foo')
          logger2 = createLogger('bar')
          logger1.enable()
          logger2.enable()
          createLogger.disable()
        })

        it('should not log', function () {
          logger1.info('boz')
          expect(consoleStub.log).was.notCalled()
          consoleStub.log.reset()
          logger2.info('baz')
          expect(consoleStub.log).was.notCalled()
        })
      })

      describe('global enable', function () {
        var logger1
        var logger2

        beforeEach(function () {
          consoleStub = { log: sinon.stub() }
          stubConsole(consoleStub)
          createLogger = create(log())
          logger1 = createLogger('foo')
          logger2 = createLogger('bar')
          logger1.disable()
          logger2.disable()
          createLogger.enable()
        })

        it('should log', function () {
          logger1.info('boz')
          expect(consoleStub.log).was.calledWith(sinon.match(/\[foo]/))
          consoleStub.log.reset()
          logger2.info('baz')
          expect(consoleStub.log).was.calledWith(sinon.match(/\[bar]/))
        })
      })

      describe('global destroy', function () {
        var logger1
        var logger2

        beforeEach(function () {
          consoleStub = { log: sinon.stub() }
          stubConsole(consoleStub)
          createLogger = create(log())
          logger1 = createLogger('foo')
          logger2 = createLogger('bar')
          createLogger.destroy()
          createLogger.enable()
          logger1.enable()
          logger2.enable()
        })

        it('should not log', function () {
          logger1.info('boz')
          expect(consoleStub.log).was.notCalled()
          consoleStub.log.reset()
          logger2.info('baz')
          expect(consoleStub.log).was.notCalled()
        })
      })

      describe('when additional loggers are provided', function () {
        var additionalLogger

        beforeEach(function () {
          stubConsole(consoleStub)
          createLogger = create(log())
          additionalLogger = sinon.stub()
          logger = createLogger('testing', [additionalLogger])
          logger.enable({ '*': 'trace' })
        })

        _.each(LEVELS.NAMES, function (level) {
          describe('and logging "' + level + '" message', function () {
            beforeEach(function () {
              logger[level]('message')
            })

            it('should have logged message at that level', function () {
              expect(additionalLogger).was.calledWith('testing', level, sinon.match.date, { message: 'message' })
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

        describe('and when logger function is invoked with more additional loggers', function () {
          var childLogger
          var extraAdditionalLogger
          beforeEach(function () {
            extraAdditionalLogger = sinon.stub()
            childLogger = logger('again', [extraAdditionalLogger])
            childLogger.enable({ '*': 'trace' })
          })

          _.each(LEVELS.NAMES, function (level) {
            describe('and logging "' + level + '" message', function () {
              it('should have logged message at that level to the right additional loggers', function () {
                logger[level]('message')
                expect(additionalLogger).was.calledWith('testing', level, sinon.match.date, { message: 'message' })
                expect(extraAdditionalLogger).was.notCalled()
                additionalLogger.reset()
                extraAdditionalLogger.reset()
                childLogger[level]('second message')
                expect(additionalLogger).was.calledWith('testing:again', level, sinon.match.date, { message: 'second message' })
                expect(extraAdditionalLogger).was.calledWith('testing:again', level, sinon.match.date, { message: 'second message' })
              })
            })
          })
        })
      })

      describe('when interceptors are provided', function () {
        var toThrow
        function returnUndefined (name, level, date, components) {
          if (toThrow) throw toThrow
        }
        function prependImportantReturnString (name, level, date, components) {
          if (toThrow) throw toThrow
          return 'important ' + components.message
        }
        function prependImportantReturnComponentsObject (name, level, date, components) {
          if (toThrow) throw toThrow
          return {
            message: 'important ' + components.message,
            metadata: { importance: 'high' }
          }
        }
        function prependImportantReturnArgumentsArray (name, level, date, components) {
          if (toThrow) throw toThrow
          return ['(' + name + ')', 'error', date, {
            message: 'important ' + components.message,
            metadata: { importance: 'high' }
          }]
        }

        beforeEach(function () {
          stubConsole(consoleStub)
          consoleStub.log.reset()
          createLogger = create(log())
        })

        describe('that return undefined', function () {
          beforeEach(function () {
            logger = createLogger('testing', null, [returnUndefined])
            logger.enable({ '*': 'trace' })
          })

          _.each(LEVELS.NAMES, function (level) {
            describe('and logging "' + level + '" message', function () {
              it('should have logged message at that level', function () {
                logger[level]('message')
                expect(consoleStub.log).was.calledWith(sinon.match(/message$/))
              })
            })
          })

          describe('but interceptor throws an error', function () {
            beforeEach(function () { toThrow = new Error('BAH - Humbug!') })
            afterEach(function () { toThrow = false })

            it('should throw an exception when logging', function () {
              expect(function () {
                logger.info('hi test')
              }).to.throwError(function (err) {
                expect(err.message).to.equal('BAH - Humbug!')
              })
            })
          })

          describe('and when logger function is invoked with additional interceptors', function () {
            function upperCased (name, level, date, components) {
              return components.message.toUpperCase()
            }

            var childLogger
            beforeEach(function () {
              childLogger = logger('bar', null, [upperCased])
            })

            it('should apply only top level interceptors to top level logs', function () {
              logger.info('message')
              expect(consoleStub.log).was.calledWith(sinon.match(/message$/))
            })

            it('should apply top and lower level interceptors to lower level logs', function () {
              childLogger.info('message')
              expect(consoleStub.log).was.calledWith(sinon.match(/MESSAGE$/))
            })
          })
        })

        _.each([
          { returns: 'a string', fn: prependImportantReturnString },
          { returns: 'a components object', fn: prependImportantReturnComponentsObject },
          { returns: 'an arguments array', fn: prependImportantReturnArgumentsArray }
        ], function (interceptor) {
          describe('that return ' + interceptor.returns, function () {
            beforeEach(function () {
              logger = createLogger('testing', null, [interceptor.fn])
              logger.enable({ '*': 'trace' })
            })

            _.each(LEVELS.NAMES, function (level) {
              describe('and logging "' + level + '" message', function () {
                it('should have logged message at that level', function () {
                  logger[level]('message')
                  expect(consoleStub.log).was.calledWith(sinon.match(/important message$/))
                })
              })
            })

            describe('but interceptor throws an error', function () {
              beforeEach(function () { toThrow = new Error('BAH - Humbug!') })
              afterEach(function () { toThrow = false })

              it('should throw an exception when logging', function () {
                expect(function () {
                  logger.info('hi test')
                }).to.throwError(function (err) {
                  expect(err.message).to.equal('BAH - Humbug!')
                })
              })
            })

            describe('and when logger function is invoked with additional interceptors', function () {
              function upperCased (name, level, date, components) {
                return components.message.toUpperCase()
              }

              var childLogger
              beforeEach(function () {
                childLogger = logger('bar', null, [upperCased])
              })

              it('should apply only top level interceptors to top level logs', function () {
                logger.info('message')
                expect(consoleStub.log).was.calledWith(sinon.match(/important message$/))
              })

              it('should apply top and lower level interceptors to lower level logs', function () {
                childLogger.info('message')
                expect(consoleStub.log).was.calledWith(sinon.match(/IMPORTANT MESSAGE$/))
              })
            })
          })
        })

        describe('that return a components object with metadata', function () {
          var additionalLogger
          beforeEach(function () {
            additionalLogger = sinon.stub()
            logger = createLogger('testing', [additionalLogger], [prependImportantReturnComponentsObject])
            logger.enable({ '*': 'trace' })
          })

          _.each(LEVELS.NAMES, function (level) {
            describe('and logging "' + level + '" message', function () {
              beforeEach(function () {
                logger[level]('message')
              })

              it('should have logged message at that level with the additional metadata', function () {
                expect(additionalLogger).was.calledWith('testing', level, sinon.match.date, {
                  message: 'important message',
                  metadata: { importance: 'high' }
                })
              })
            })
          })
        })

        describe('that return an arguments array with a modified name, the \'error\' log level and metadata', function () {
          var additionalLogger
          beforeEach(function () {
            additionalLogger = sinon.stub()
            logger = createLogger('testing', [additionalLogger], [prependImportantReturnArgumentsArray])
            logger.enable({ '*': 'trace' })
          })

          _.each(LEVELS.NAMES, function (level) {
            describe('and logging "' + level + '" message', function () {
              beforeEach(function () {
                logger[level]('message')
              })

              it('should have logged message at \'error\' level with the modified name and additional metadata', function () {
                expect(additionalLogger).was.calledWith('(testing)', 'error', sinon.match.date, {
                  message: 'important message',
                  metadata: { importance: 'high' }
                })
              })
            })
          })
        })
      })
    })
  })
}
