var _ = require('slapdash')

var STORAGE_NAMESPACE = 'qubit_logger'
var TEST_KEY = '__dwTest__'

var memoryStorage = ''

function hasLocalStorage () {
  try {
    window.localStorage.setItem(TEST_KEY, 1)
    window.localStorage.removeItem(TEST_KEY)
    return true
  } catch (e) {
    return false
  }
}

function set (value, opts) {
  opts = _.assign({
    persist: false
  }, opts)

  if (opts.persist && hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_NAMESPACE, value)
  } else {
    memoryStorage = value
  }
}

function get () {
  if (memoryStorage || !hasLocalStorage()) {
    return memoryStorage
  } else if (hasLocalStorage()) {
    return window.localStorage.getItem(STORAGE_NAMESPACE) || ''
  }
}

function reset () {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_NAMESPACE)
  }
  memoryStorage = ''
}

module.exports = {
  set: set,
  get: get,
  reset: reset
}
