# logger

A namespaced stylish client-side logger. Most of the code was taken from D Piddy's `visitor-engine-utils` logger.


### Example

```js
var createLogger = require('@qubit/logger')

var log = createLogger('mymodule-main')

log.trace('It supports node and the browser!')
log.debug('You can', { also: 'send some arbitrary metadata!' })

var subModuleLog = log('a-sub-module')

subModuleLog.info('You can create loggers off loggers')
subModuleLog.warn('So that your logs remain under the same top namespace')
subModuleLog.error('Isn\t this cool?')
```


### API

#### `createLogger(name, [additionalLoggers])`

Create a new named log instance, optionally supplying additional loggers (e.g. sentry or devtools). `additonalLoggers` should be an array of functions accepting 4 arguments:

```js
function (name, level, message, metadata) { ... }
```

### `log.{LEVEL}(message, metadata)`

Log a message at a level, optionally with a metadata object. Available levels:

- `trace`
- `debug`
- `info`
- `warn`
- `error`

### `log(name)`

Create a sub logger. This new logger will inherit the namespace of its parent.

```js
var parentLog = createLogger('foo') // namespace will be foo
var childLog = createLogger('bar') // namespace will be foo:bar
```


### Best practices

Create a main `logger.js` file in your module/app:

```js
// logger.js
var createLogger = require('@qubit/logger')
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
