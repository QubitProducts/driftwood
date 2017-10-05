var webpack = require('./webpack.config.test')

module.exports = function (config) {
  process.env.NODE_ENV = 'test'

  // choose from: https://saucelabs.com/platforms/
  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    sl_safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },
    sl_ie: {
      base: 'SauceLabs',
      browserName: 'internet explorer'
    },
    sl_ie_8: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '8'
    },
    sl_ie_9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9'
    },
    sl_ie_10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10'
    }
  }

  // filter browsers for easy cli testing against sauce on particular platforms
  if (process.env.BROWSERS) {
    var browsers = process.env.BROWSERS.split(',')

    customLaunchers = Object.keys(customLaunchers).reduce(function (filteredLaunchers, launcher) {
      if (browsers.indexOf(launcher) >= 0) {
        filteredLaunchers[launcher] = customLaunchers[launcher]
      }
      return filteredLaunchers
    }, {})

    if (Object.keys(customLaunchers).length === 0) {
      console.error('You have excluded all launchers with browser filter [%s]', process.env.BROWSERS)
      return process.exit(1)
    }
  }

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
    singleRun: false,
    colors: true,
    logLevel: config.LOG_INFO,
    sauceLabs: {
      testName: 'driftwood'
    },
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    reporters: ['spec', 'saucelabs']
  })
}
