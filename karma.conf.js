// Karma configuration

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: './',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],


		// list of files / patterns to load in the browser
		files: [
			'node_modules/es5-shim/es5-shim.js',
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/angular/angular.js',
			'node_modules/angular-mocks/angular-mocks.js',
			'node_modules/noinfopath/dist/noinfopath.js',
			'node_modules/noinfopath-helpers/src/*.js',
			'node_modules/noinfopath-data/dist/noinfopath-dexie.js',
			'node_modules/noinfopath-data/dist/noinfopath-data.js',
			'node_modules/noinfopath-data/node_modules/noinfopath-logger/dist/noinfopath-logger.js',
			'node_modules/ui-router/angular-ui-router.js',
			'bower_components/angular-base64/angular-base64.js',
			'bower_components/angular-http-auth/src/http-auth-interceptor.js',
			'bower_components/ng-lodash/build/ng-lodash.js',
			'test/mock/configuration.mock.js',
			'test/mock/nologinservice.mock.js',
			'test/mock/manifest.mock.js',
			'test/*.spec.js',
			'src/globals.js',
			'src/login.js',
			'src/offline.js'
		],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		// preprocessors: {
		//     'src/*.js': 'coverage'
		// },

		coverageReporter: {
		    type: 'cobertura',
		    dir: 'coverage/'
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['verbose','coverage'],
		// reporters: ['verbose'],


		// web server port
		port: 8378,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false
	});
};
