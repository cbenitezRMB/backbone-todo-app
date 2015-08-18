module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	var hostPort = 9000;
	// Project configuration.
	grunt.initConfig({
		watch: {
			scripts: {
				files: ['js/scripts.js'],
				options: {
					livereload: true
				}
			}
		},
		express: {
			all: {
				options: {
					port: hostPort,
					hostname: 'localhost',
					bases: ['.'],
					livereload: true
				}
			}
		},
		open: {
			dev:{
				path: 'http://localhost:'+hostPort
			}
		},
		uglify: {
			dist: {
				files: {
					'dist/scripts.js': ['js/scripts.js']
				}
			}
		}
	});
	// grunt.registerTask('server', ['express','open','watch']);
	grunt.registerTask('server', ['express','open', 'watch' ,'express-keepalive']);
};
