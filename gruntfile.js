module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
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
					port: 9000,
					hostname: 'localhost',
					bases: ['.'],
					livereload: true
				}
			}
		}
	});
	grunt.registerTask('server', ['express','watch']);
};