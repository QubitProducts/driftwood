module.exports = function createCompositeLogger (primaryLogger, additionalLoggers) {
  var loggers = [primaryLogger].concat(additionalLoggers)
  return function compositeLogger (name, level, date, components) {
    for (var i = 0; i < loggers.length; i++) loggers[i](name, level, date, components)
  }
}
