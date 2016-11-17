var expect = require('../expect')
var argsToComponents = require('../../src/utils/argsToComponents')

describe('argsToComponents', function () {
  it('should extract the message', function () {
    expect(argsToComponents(['foo'])).to.eql({
      message: 'foo'
    })
  })

  it('should extract errors', function () {
    var err = new Error('Wat')
    expect(argsToComponents([err])).to.eql({
      error: err,
      message: 'Wat'
    })
  })

  it('should extract metadata', function () {
    var meta = { foo: 'bar' }
    expect(argsToComponents([meta])).to.eql({
      message: 'metadata:',
      metadata: meta
    })
  })

  it('should concat sequential string args with spaces', function () {
    expect(argsToComponents(['foo', 'bar'])).to.eql({
      message: 'foo bar'
    })
  })
})
