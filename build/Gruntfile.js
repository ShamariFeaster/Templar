module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'target/<%= pkg.name %>-<%= pkg.version %>.concat.js',
        dest: 'target/<%= pkg.name %>-<%= pkg.version %>.concat.min.js'
      }
    },
    concat : {
      files: {
        dest : 'target/<%= pkg.name %>-<%= pkg.version %>.concat.js',
        src  : ['../TemplarJS/*.js','../TemplarJS/Classes/*.js']
      }
    },
    clean : ['target/*']
  });
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['clean', 'concat','uglify']);
  
};