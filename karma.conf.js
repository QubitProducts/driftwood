module.exports = function (config) {
  process.env.NODE_ENV = 'test'

  config.set({
    basePath: '',
    frameworks: ['mocha', 'browserify'],
    browserify: {
      debug: true,
      transform: []
    },
    files: [
      'src/**/*.js'
    ],
    preprocessors: {
      'src/**/*.js': ['browserify']
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
