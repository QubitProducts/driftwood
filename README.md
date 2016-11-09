# logger [ ![Codeship Status for qubitdigital/logger](https://codeship.com/projects/1504d8b0-d965-0133-7924-56bde683aa9e/status?branch=master)](https://codeship.com/projects/143490)

A namespaced stylish logger for the browser and node.

![](https://cloud.githubusercontent.com/assets/621323/18617528/83dc16fa-7dc9-11e6-825f-dfbb4d2fa891.png)


### Example

```js
var createLogger = require('driftwood')

var log = createLogger('mymodule-main')

log.trace('It supports node and the browser!')
log.debug('You can', { also: 'send some arbitrary metadata!' })

var subModuleLog = log('a-sub-module')

subModuleLog.info('You can create loggers off loggers')
subModuleLog.warn('So that your logs remain under the same top namespace')
subModuleLog.error('Isn\'t this cool?')
```

Enabling log output:

```js
createLogger.enable() // defaults to { '*': 'info' }
window.__qubit.logger.enable({ // it is also available on the window
  'foo': 'info',
  'bar:*': 'debug'
})
```


### API

#### `createLogger(name, [additionalLoggers])`

Create a new named log instance, optionally supplying additional loggers (e.g. sentry or devtools). `additonalLoggers` should be an array of functions accepting 4 arguments:

```js
function (name, level, message, metadata) { ... }
```

### `log.{LEVEL}(message, [message], [metadata/Error])`

Log a message at a level, optionally with a metadata object or error instance. Available levels:

- `trace`
- `debug`
- `info`
- `warn`
- `error`

The last argument of the log call can be an object or an instance of `Error`, which Driftwood will attempt to present in a more readable fashion. All preceding arguments will be concatenated together into a string. 

### `log(name)`

Create a sub logger. This new logger will inherit the namespace of its parent.

```js
var parentLog = createLogger('foo') // namespace will be foo
var childLog = createLogger('bar') // namespace will be foo:bar
```

### `createLogger.enable(config)`

Enable logging using the optional log level config. The config is a map of name patterns to log level, defaulting to `{ '*': 'info' }`. See below for more pattern examples. This method is also available on the window at `window.__qubit.logger.enable()`.

### `createLogger.disable()`

Clears the log config, disabling logging. Also available at `window.__qubit.logger.disable()`.


### Enabling logging

By default the logger will not output anything. You need to enable it first, as specified above. Below are some examples of log configs you can pass (you can use `*` as a wildcard:

- `{ '*': null }` - will log everything at the default level (`info`)
- `{ 'foo': 'trace' }` - will log anything from the logger with the name `foo` at the `trace` level
- `{ 'foo': 'trace', 'bar*': 'warn' }` - will log `foo` at `trace` and `bar*` at `warn`
- `{ 'foo*': 'error', '*': 'info' }` - will only log up to error from `foo*` and up to info from everything else

When running in the browser, you can pass a `persist` flag to persist the log configuration into `localStorage`:

```js
createLogger.enable({ '*': 'info' }, { persist: true })
```

When running in node, it is kept in memory. Therefore if you want log output in node you need to enable it _before_ creating your log instance.


### Best practices

Create a main `logger.js` file in your module/app:

```js
// logger.js
var createLogger = require('driftwood')
module.exports = createLogger('my-app')
```

In the main part of your app, use the main logger:

```js
// index.js
var log = require('./logger')
log.debug('We are in the entry of the app!')
```

In each of your submodules, create a sub logger:

```js
// subModuleA.js
var log = require('./logger')('sub-module-a')
log.debug('We are in a submodule of the app!')
```

When running in node and you want log out, enable logging _before_ creating your loggers:

```js
createLogger.enable()
var log = createLogger('my-app')
```


### Want to work on this for your day job?

This project was created by the Engineering team at [Qubit](http://www.qubit.com). As we use open source libraries, we make our projects public where possible.

We’re currently looking to grow our team, so if you’re a JavaScript engineer and keen on ES2016 React+Redux applications and Node micro services, why not get in touch? Work with like minded engineers in an environment that has fantastic perks, including an annual ski trip, yoga, a competitive foosball league, and copious amounts of yogurt.

Find more details on our [Engineering site](https://eng.qubit.com). Don’t have an up to date CV? Just link us your Github profile! Better yet, send us a pull request that improves this project.
