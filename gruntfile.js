module.exports = function (grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        tsConfig: grunt.file.readJSON('tsconfig.json'),

        ts: {
            default: {
                src: "<%= tsConfig.files %>",
                options: "<%= tsConfig.compilerOptions %>",
            }
        },

        watch: {
            default: {
                files: ['*'],
                tasks: ['ts', 'execute'],
                options: {
                    spawn: false
                }
            }
        },

        execute: {
            target: {
                src: ['index.js']
            }
        }
    });


    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-execute');

    grunt.registerTask("default", ['ts', 'execute', 'watch']);

};