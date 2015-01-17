// Karma configuration
// Generated on Sat Jan 17 2015 12:13:06 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      //libs
      'src/lib/jquery/dist/jquery.js',
      'src/lib/bootstrap/dist/js/bootstrap.js',
      'src/lib/angular/angular.js',
      'src/lib/angular-animate/angular-animate.js',
      'src/lib/angular-bootstrap/ui-bootstrap-tpls.js',
      'src/lib/angular-aria/angular-aria.js',
      'src/lib/angular-cookies/angular-cookies.js',
      'src/lib/angular-material/angular-material.js',
      'src/lib/angular-resource/angular-resource.js',
      'src/lib/angular-route/angular-route.js',
      'src/lib/angular-sanitize/angular-sanitize.js',
      'src/lib/angular-translate/angular-translate.js',
      'src/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
      'src/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'src/lib/angular-mocks/angular-mocks.js',

      //Confman files
      'src/js/app.js',
      'src/js/controller/*.js',
      'src/js/directive/*.js',
      'src/js/filter/*.js',
      'src/js/service/*.js',
      'src/js/util/*.js',

      //Unit Test
      'test/unit/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
