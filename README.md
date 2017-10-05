# logger [ ![Codeship Status for qubitdigital/logger](https://codeship.com/projects/1504d8b0-d965-0133-7924-56bde683aa9e/status?branch=master)](https://codeship.com/projects/143490)

A namespaced stylish logger for the browser and node.

![](https://cloud.githubusercontent.com/assets/621323/18617528/83dc16fa-7dc9-11e6-825f-dfbb4d2fa891.png)


### Example

```js
var driftwood = require('driftwood')

var log = driftwood('a-module')

log.trace('It supports node and the browser!')
log.debug('You can', { also: 'send some arbitrary metadata!' })

var subLog = log('a-sub-module')

subLog.info('You can create loggers off loggers')
subLog.warn('So that your logs remain under the same top namespace')
subLog.error('Isn\'t this cool?')
```

Enabling log output globally:

```js
driftwood.enable() // defaults to { '*': 'info' }
driftwood.enable({
  'foo': 'info',
  'bar:*': 'debug'
}, { persist: true }) // pass `persist: true` when in the browser to keep logging enabled across pages
```

Enabling log output for specific loggers or subloggers:

```js
var log = driftwood('a-module')
var subLog = log('a-sub-module')
log.enable() // enables log and subLog

var log = driftwood('a-module')
var subLog = log('a-sub-module')
subLog.enable() // enables just subLog

log.disable() // disables log and sublog
```


### API

### `driftwood.enable(config, options)`

Enables all loggers globally using the optional log level config. The config is a map of name patterns to log level, defaulting to `{ '*': 'info' }`. See below for more pattern examples. You can also pass an options object to the enable function. Currently it only supports the `persist` option, which lets keep logging enabled across page views (defaults to false, only supports the browser).

### `driftwood.disable()`

Disables all loggers globally and clears the global log config.

### `driftwood(name, [additionalLoggers])`

Creates a new named log instance, optionally supplying additional loggers (e.g. sentry or devtools). `additionalLoggers` should be an array of functions accepting 4 arguments:

```js
function (name, level, now, { message, error, metadata }) { ... }
```

### `log(name)`

Creates a sub logger that inherits the namespace of its parent.

```js
var log = driftwood('foo') // namespace will be foo
var subLog = log('bar') // namespace will be foo:bar
```

### `log.enable(config)`

Enables a specific logger with a config object (see driftwood.enable). This will be applied to the logger and all of it's descendants.

### `log.disable(config)`

Disables a specific logger and all of it's descendants.

### `log.{LEVEL}(message, [message], [metadata/Error])`

Logs a message at a level, optionally with a metadata object or error instance. Available levels:

- `trace`
- `debug`
- `info`
- `warn`
- `error`

The last argument of the log call can be an object or an instance of `Error`, which Driftwood will attempt to present in a more readable fashion. All preceding arguments will be concatenated together into a string.


### Enabling logging

By default the logger will not output anything. You need to enable it first, as specified above. Below are some examples of log configs you can pass (you can use `*` as a wildcard:

- `{ '*': null }` - will log everything at the default level (`info`)
- `{ 'foo': 'trace' }` - will log anything from the logger with the name `foo` at the `trace` level
- `{ 'foo': 'trace', 'bar*': 'warn' }` - will log `foo` at `trace` and `bar*` at `warn`
- `{ 'foo*': 'error', '*': 'info' }` - will only log up to error from `foo*` and up to info from everything else

When running in the browser, you can pass a `persist` flag to persist the log configuration into `localStorage`:

```js
driftwood.enable({ '*': 'info' }, { persist: true })
```

### Best practices

Create a main `logger.js` file in your module/app:

```js
// logger.js
var driftwood = require('driftwood')
module.exports = driftwood('my-app')
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

### Want to work on this for your day job?

This project was created by the Engineering team at [Qubit](http://www.qubit.com). As we use open source libraries, we make our projects public where possible.

We’re currently looking to grow our team, so if you’re a JavaScript engineer and keen on ES2016 React+Redux applications and Node micro services, why not get in touch? Work with like minded engineers in an environment that has fantastic perks, including an annual ski trip, yoga, a competitive foosball league, and copious amounts of yogurt.

Find more details on our [Engineering site](https://eng.qubit.com). Don’t have an up to date CV? Just link us your Github profile! Better yet, send us a pull request that improves this project.
