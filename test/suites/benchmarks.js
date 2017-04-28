/* global createLogger, consoleUtils */

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
    this.logger = createLogger('foo')
    createLogger.disable()
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
    this.restore = consoleUtils.noop(window.console)
    createLogger.enable({ '*': 'trace' })
    this.logger = createLogger('foo')
    this.logger.enable({ '*': 'trace' })
  },
  teardown: function () {
    this.logger.disable()
    this.restore()
  }
})
