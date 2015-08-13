module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-open');
	var hostPort = 9000;
	// Project configuration.
	grunt.initConfig({
		watch: {
			scripts: {
				files: ['js/*.js'],
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
		}
	});
	grunt.registerTask('server', ['express','open','watch']);
};
