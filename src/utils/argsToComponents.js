/*
  Last arg can be an error or an object. All other
  args will be joined into a string, delimited by
  a space.
*/
module.exports = function argsToComponents (args) {
  var lastArg = args[args.length - 1]

  var isError = lastArg instanceof Error
  var isMetadata = !isError && lastArg && typeof lastArg === 'object'

  var messageParts = (isError || isMetadata) ? args.slice(0, -1) : args
  var message = messageParts.join(' ')

  // Handle log.debug({ foo: 'bar' })
  if (isMetadata && !message) {
    message = 'metadata:'
  }

  return {
    error: isError && lastArg,
    metadata: isMetadata && lastArg,
    message: message
  }
}
