/*
  Last arg can be an error or an object. All other
  args will be joined into a string, delimited by
  a space.
*/
module.exports = function argsToComponents (args) {
  args = [].slice.apply(args)
  var lastArg = args[args.length - 1]

  var isError = lastArg instanceof Error || isErrorLike(lastArg)
  var isMetadata = !isError && lastArg && typeof lastArg === 'object'

  var messageParts = isError || isMetadata ? args.slice(0, -1) : args
  var message = messageParts.join(' ')

  // Handle log.debug({ foo: 'bar' })
  if (isMetadata && !message) {
    message = 'metadata:'
  }

  // Handle log.debug(new Error())
  if (isError && !message) {
    message = lastArg.message
  }

  var components = {
    message: message
  }

  if (isError && lastArg) components.error = lastArg
  if (isMetadata && lastArg) components.metadata = lastArg

  return components
}

// In some environments, errors doesn't properly inherit from `Error`
function isErrorLike (thing) {
  return thing && !!thing.stack && !!thing.message
}
