module.exports = function (config) {
  process.env.NODE_ENV = 'test'

  config.set({
    basePath: '',
    frameworks: ['benchmark', 'browserify'],
    browserify: {
      debug: true,
      transform: []
    },
    files: [
      'test/windowExpose.js',
      'test/benchmarks.js'
    ],
    preprocessors: {
      'test/windowExpose.js': ['browserify']
    },
    reporters: ['benchmark'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
    colors: true,
    port: 9876,
    logLevel: config.LOG_INFO
  })
}
