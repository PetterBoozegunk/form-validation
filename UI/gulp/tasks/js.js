/*global require */
/*jslint node: true, stupid: true */
"use strict";

var gulp = require("gulp"),
    config = require("../config.js"),
    plugins = require("gulp-load-plugins")(),

    settings = {
        dest: config.compileToFolder + "/js",
        fileName: "scripts.js",

        concatSrc: ["js/lib/*.js", "js/*.js"],
        checkSrc: ["*.js", "js/*.js", "gulp/**"],

        prettify: [{
            files: ["js/*.js"],
            dest: "js"
        }, {
            files: ["gulp/*.js"],
            dest: "gulp"
        }, {
            files: ["gulp/tasks/*.js"],
            dest: "gulp/tasks"
        }, {
            files: ["./*.js", "./*.json"],
            dest: "."
        }],

        jsLint: {
            jslint_happy: true
        },
        uglify: {
            compress: {
                drop_debugger: true,
                drop_console: true
            }
        }
    },

    js = {
        checkSrc: settings.checkSrc,
        prettify: function (src, dest) {
            return gulp.src(src)
                .pipe(plugins.plumber())
                .pipe(plugins.jsPrettify(settings.jsLint))
                .pipe(gulp.dest(dest));
        },
        tasks: {
            "platoReport": function () {
                gulp.start(plugins.shell.task(["node gulp/plato.js simple"]));
            },
            "prettify": function () {
                var prettifyArray = settings.prettify;

                prettifyArray.forEach(function (prettifyObj) {
                    js.prettify(prettifyObj.files, prettifyObj.dest);
                });
            },
            "before:jslint": ["prettify"],
            "jslint": function () {
                return gulp.src(settings.checkSrc)
                    .pipe(plugins.plumber())
                    .pipe(plugins.jslint());
            },
            "js:prod": function () {
                return gulp.src(settings.concatSrc)
                    .pipe(plugins.concat(settings.fileName))
                    .pipe(plugins.stripDebug())
                    .pipe(plugins.uglify(settings.uglify))
                    .pipe(gulp.dest(settings.dest));
            },
            "js:dev": function () {
                return gulp.src(settings.concatSrc)
                    .pipe(plugins.plumber())
                    .pipe(plugins.sourcemaps.init())
                    .pipe(plugins.concat(settings.fileName))
                    .pipe(plugins.sourcemaps.write("."))
                    .pipe(gulp.dest(settings.dest));
            },
            "js:dev:all": ["js:dev"],

            "js:all": ["jslint", "platoReport", "js:dev:all"],

            // All "default" tasks will be added to the main default task
            "default": ["js:dev:all"]
        },

        // watch object {"watch-this-(dir|glob|file)": "do-this-task (Array)"}
        watch: {
            "js/**": ["js:dev:all"]
        }
    };

module.exports = js;