module.exports = function(grunt) {

	var DEBUG = !!grunt.option("debug");

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			test: {
				files: [
					//{expand:true, flatten:false, src: [ 'lib/js/noinfopath/*.*'], dest: 'build/'},
					{
						expand: true,
						flatten: true,
						src: ['dist/*.js'],
						dest: '../noinfopath-test-server-node/no/lib/js/noinfopath/'
					},
				]
			}
		},
		concat: {
			noinfopath: {
				src: [
					'src/globals.js',
					'src/login.js',
					'src/directives.js',
					'src/security.js',
					'src/Auth0.js'
				],
				dest: 'dist/noinfopath-user.js'
			},
			readme: {
				src: ['docs/noinfopath-user.md'],
				dest: 'readme.md'
			}

		},
		karma: {
			unit: {
				configFile: "karma.conf.js"
			},
			continuous: {
				configFile: 'karma.conf.js',
				singleRun: false,
				browsers: ['Chrome']
			}
		},
		bumpup: {
			file: 'package.json'
		},
		version: {
			options: {
				prefix: '@version\\s*'
			},
			defaults: {
				src: ['src/globals.js']
			}
		},
		nodocs: {
			"internal": {
				options: {
					src: 'dist/noinfopath-user.js',
					dest: 'docs/noinfopath-user.md',
					start: ['/*', '/**']
				}
			},
			"public": {
				options: {
					src: 'dist/noinfopath-user.js',
					dest: 'docs/noinfopath-user.md',
					start: ['/*']
				}
			}
		},
		watch: {
			dev: {
				files: ['src/*.js', 'test/*.spec.js'],
				tasks: ['compile']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-version');
	grunt.loadNpmTasks('grunt-nodocs');

	//Default task(s).
	grunt.registerTask('release', ['bumpup', 'version', 'concat:noinfopath', 'nodocs:internal']);
	grunt.registerTask('build', ['karma:continuous', 'bumpup', 'version', 'concat:noinfopath', 'nodocs:internal']);
	grunt.registerTask('buildy', ['bumpup', 'version', 'concat:noinfopath', 'nodocs:internal']);
	grunt.registerTask('compile', ['concat:noinfopath', 'nodocs:internal', 'concat:readme']);
	grunt.registerTask('notest', ['concat:noinfopath', 'copy:test']);
	grunt.registerTask('document', ['concat:noinfopath', 'nodocs:internal', 'concat:readme']);
	grunt.registerTask('unit', ['karma:continuous']);
	grunt.registerTask('test', ['karma:unit']);
};
