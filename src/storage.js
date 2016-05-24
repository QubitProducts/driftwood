var _ = require('slapdash')
var STORAGE_NAMESPACE = 'qubit_logger'
var TEST_KEY = '__dwTest__'

var memoryStorage = ''
var localStorage = _.get(window, 'localStorage')

function hasLocalStorage () {
  try {
    localStorage.setItem(TEST_KEY, 1)
    localStorage.removeItem(TEST_KEY)
    return true
  } catch (e) {
    return false
  }
}

function set (value) {
  if (hasLocalStorage()) {
    localStorage.setItem(STORAGE_NAMESPACE, value)
  } else {
    memoryStorage = value
  }
}

function get () {
  if (hasLocalStorage()) {
    return localStorage.getItem(STORAGE_NAMESPACE) || ''
  } else {
    return memoryStorage
  }
}

function reset () {
  if (hasLocalStorage()) {
    localStorage.removeItem(STORAGE_NAMESPACE)
  } else {
    memoryStorage = ''
  }
}

module.exports = {
  set: set,
  get: get,
  reset: reset
}
