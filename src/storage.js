var STORAGE_NAMESPACE = 'qubit_logger'

var memoryStorage = ''

function hasLocalStorage () {
  return typeof window !== 'undefined' && window.localStorage
}

function set (value) {
  if (hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_NAMESPACE, value)
  } else {
    memoryStorage = value
  }
}

function get () {
  if (hasLocalStorage()) {
    return window.localStorage.getItem(STORAGE_NAMESPACE) || ''
  } else {
    return memoryStorage
  }
}

function reset () {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_NAMESPACE)
  } else {
    memoryStorage = ''
  }
}

module.exports = {
  set: set,
  get: get,
  reset: reset
}
