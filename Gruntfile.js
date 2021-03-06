/*jshint node:true*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['lib/*.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.main %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'lib/<%= pkg.main %>.js',
        dest: 'dist/<%= pkg.main %>.min.js'
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('closure', 'using brew closure-compiler', function() {
    var exec = require('child_process').exec;
    var cb = this.async();
    exec("(echo /*EventList `git tag`*/ ; closure-compiler --js lib/eventlist.js --create_source_map dist/eventlist.map --source_map_format=V3) > dist/eventlist.min.js", {cwd: './'}, function(err, stdout, stderr) {
      console.log(stdout);
      cb();
    });
  });


  // Default task(s).
  grunt.registerTask('build', ['jshint', 'closure']);
  grunt.registerTask('default', 'jshint');

};
