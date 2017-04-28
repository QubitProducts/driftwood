module.exports = {
  DEFAULT: 'info',
  NAMES: ['trace', 'debug', 'info', 'warn', 'error'],
  INDEX: {}
}

for (var i = 0; i < module.exports.NAMES.length; i++) {
  module.exports.INDEX[module.exports.NAMES[i]] = i
}
