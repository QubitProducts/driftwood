var _ = require('slapdash')

var DEFAULT_LEVEL = 'info'
var STORAGE_NAMESPACE = 'qubit_logger'

function get () {
  try {
    var payload = window.localStorage.getItem(STORAGE_NAMESPACE) || ''
    return JSON.parse(payload) || {}
  } catch (e) {
    return {}
  }
}

function set (patterns) {
  try {
    var payload = JSON.stringify(patterns)
    window.localStorage.setItem(STORAGE_NAMESPACE, payload)
  } catch (e) { }
}

function match (name) {
  var patterns = _.keys(get())

  return !!_.find(patterns, function (pattern) {
    return test(pattern, name)
  })
}

function getLevel (name) {
  var patterns = get()

  var pattern = _.find(_.keys(patterns), function (pattern) {
    return test(pattern, name)
  })

  return patterns[pattern] || DEFAULT_LEVEL
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
