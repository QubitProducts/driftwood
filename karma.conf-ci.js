module.exports = function (config) {
  process.env.NODE_ENV = 'test'

  // verify we have saucelabs access details
  if (!process.env.BROWSER_STACK_USERNAME || !process.env.BROWSER_STACK_ACCESS_KEY) {
    console.error('BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY environment variables need to be set')
    return process.exit(1)
  }

  var customLaunchers = {
    bs_chrome: {
      base: 'BrowserStack',
      browser: 'chrome',
      os: 'OS X',
      os_version: 'Yosemite'
    },
    bs_ie_8: {
      base: 'BrowserStack',
      browser: 'ie',
      version: '8.0',
      os: 'Windows',
      os_version: 'XP'
    }
  }

  config.set({
    browserStack: {
      username: process.env.BROWSER_STACK_USERNAME,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
      project: 'visitor-engine-browser'
    },
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
    reporters: ['progress', 'junit', 'saucelabs'],
    singleRun: true,
    colors: true,
    port: 9876,
    logLevel: config.LOG_INFO,
    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers,
    junitReporter: {
      outputDir: 'reports',
      useBrowserName: true,
      outputFile: undefined,
      suite: ''
    }
  })
}
