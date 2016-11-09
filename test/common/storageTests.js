var storage = require('../../src/storage')
var expect = require('../expect')
var isBrowser = require('../consoleUtils').isBrowser

describe('storage', function () {
  afterEach(storage.reset)

  if (isBrowser()) {
    describe('when setting with persistence in the browser', function () {
      beforeEach(function () {
        storage.set('hello', { persist: true })
      })

      it('should persist to localStorage', function () {
        expect(window.localStorage.getItem('qubit_logger')).to.equal('hello')
      })

      describe('and then retrieving', function () {
        it('should return the value', function () {
          expect(storage.get()).to.equal('hello')
        })

        describe('and then resetting', function () {
          beforeEach(storage.reset)

          it('should remove from localStorage', function () {
            expect(window.localStorage.getItem('qubit_logger')).to.equal(null)
          })

          it('should should no longer return the value', function () {
            expect(storage.get()).to.equal('')
          })
        })
      })
    })
  }

  describe('when setting by default', function () {
    beforeEach(function () {
      storage.set('hello')
    })

    if (isBrowser()) {
      describe('in the browser', function () {
        it('should not persist to localStorage', function () {
          expect(window.localStorage.getItem('qubit_logger')).to.equal(null)
        })
      })
    }

    describe('and then retrieving', function () {
      it('should return the value', function () {
        expect(storage.get()).to.equal('hello')
      })
    })
  })
})
