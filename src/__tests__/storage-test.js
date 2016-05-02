var isBrowser = require('../isBrowser')
var storage = require('../storage')
var expect = require('../../test/expect')

describe('storage', function () {
  afterEach(storage.reset)

  describe('when setting', function () {
    beforeEach(function () {
      storage.set('hello')
    })

    if (isBrowser()) {
      describe('in the browser', function () {
        it('should persist to localStorage', function () {
          expect(window.localStorage.getItem('qubit_logger')).to.equal('hello')
        })
      })
    }

    describe('and then retrieving', function () {
      it('should return the value', function () {
        expect(storage.get()).to.equal('hello')
      })

      describe('and then resetting', function () {
        beforeEach(storage.reset)

        if (isBrowser()) {
          describe('when in the browser', function () {
            it('should remove from localStorage', function () {
              expect(window.localStorage.getItem('qubit_logger')).to.equal(null)
            })
          })
        }

        it('should should no longer return the value', function () {
          expect(storage.get()).to.equal('')
        })
      })
    })
  })
})
