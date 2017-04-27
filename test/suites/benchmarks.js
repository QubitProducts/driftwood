/* global createLogger, consoleUtils */
var restore

suite('creating the logger', function () {
  benchmark('basic', function () {
    createLogger('foo')
  })

  benchmark('with additional logger', function () {
    createLogger('foo', function () {})
  })
})

suite('logging when disabled', function () {
  benchmark('basic', function () {
    this.logger.debug('Hello dave')
  })

  benchmark('fancy', function () {
    this.logger.debug('Hello dave', { foo: 'bar', baz: 'boz' })
  })
}, {
  setup: function () {
    createLogger.disable()
    this.logger = createLogger('foo')
  }
})

suite('logging when enabled', function () {
  benchmark('basic', function () {
    this.logger.debug('Hello dave')
  })

  benchmark('fancy', function () {
    this.logger.debug('Hello dave')
  })
}, {
  setup: function () {
    restore = consoleUtils.noop(window.console)
    createLogger.enable({ '*': 'trace' })
    this.logger = createLogger('foo')
  },
  teardown: function () {
    createLogger.disable()
    restore()
  }
})
