var _ = require('slapdash')
var JSON = require('json-bourne')
var storage = require('./storage')
var LEVELS = require('./levels')

function get () {
  try {
    var payload = storage.get()
    return payload && JSON.parse(payload) || {}
  } catch (e) {
    return {}
  }
}

function set (patterns, opts) {
  try {
    var payload = JSON.stringify(patterns)
    storage.set(payload, opts)
  } catch (e) { }
}

function match (name, flags) {
  var patterns = _.keys(flags)
  return !!_.find(patterns, function (pattern) {
    return test(pattern, name)
  })
}

function getLevel (name, flags) {
  for (var pattern in flags) {
    if (test(pattern, name)) return flags[pattern] || LEVELS.DEFAULT
  }
  return LEVELS.DEFAULT
}

function test (pattern, name) {
  var regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  return regex.test(name)
}

module.exports = {
  get: get,
  set: set,
  match: match,
  getLevel: getLevel
}
