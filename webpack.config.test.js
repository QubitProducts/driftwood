var RewirePlugin = require('rewire-webpack')

module.exports = {
  plugins: [new RewirePlugin()],
  devtool: 'inline-source-map',
  resolve: {
    alias: { sinon: 'sinon/pkg/sinon' }
  },
  module: {
    loaders: [{
      test: /sinon.*\.js$/,
      loader: 'imports?define=>false,require=>false'
    }],
    noParse: [/sinon/]
  }
}
