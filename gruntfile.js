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
                    'src/directives.js'
		        ],
		        dest: 'dist/noinfopath-user.js'
		    }
	 	},
        karma: {
          unit: {
            configFile: "karma.conf.js"
          },
          continuous: {
            configFile: 'karma.conf.js',
            singleRun: true,
            browsers: ['PhantomJS']
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
    				start: ['/*','/**']
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
            files: ['src/*.js', 'test/*.spec.js'],
            tasks: ['notest']
        },
        readme: {
            src: ['docs/noinfopath-user.md'],
	    	dest: 'readme.md'
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
    grunt.registerTask('build', ['karma:continuous', 'bumpup', 'version', 'concat:noinfopath', 'nodocs:internal']);
	grunt.registerTask('notest', [ 'concat:noinfopath', 'copy:test']);
    grunt.registerTask('document', ['concat:noinfopath','nodocs:internal']);
    grunt.registerTask('unit', ['karma:continuous']);
};
