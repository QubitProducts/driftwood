var webpack = require('./webpack.config.test')

module.exports = function (config) {
  process.env.NODE_ENV = 'test'
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'test/common/**/*.js',
      'test/browser/**/*.js'
    ],
    preprocessors: {
      'test/common/**/*.js': ['webpack', 'sourcemap'],
      'test/browser/**/*.js': ['webpack', 'sourcemap']
    },
    webpack: webpack,
    webpackMiddleware: {
      stats: 'errors-only'
    },
    reporters: ['spec'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
    colors: true,
    port: 9876,
    logLevel: config.LOG_INFO
  })
}
