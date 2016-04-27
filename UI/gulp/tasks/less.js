/*global require */
/*jslint node: true */
"use strict";

var gulp = require("gulp"),
    config = require("../config.js"),
    plugins = require("gulp-load-plugins")(),
    lessPluginGlob = require("less-plugin-glob"),

    lazypipe = require("lazypipe"),

    settings = {
        dest: config.compileToFolder + "/css",
        src: ["less/styles.less"],
        options: {
            plugins: [lessPluginGlob]
        },
        comments: {
            all: true
        },

        pleeease: {
            browsers: ["last 4 versions"],
            minifier: false,
            pseudoElements: true,
            cascade: false,
            filters: {
                oldIE: false
            }
        }
    },

    // There just must be a better way to get jsbeautifier + jslint to handle this better... 
    mainLessPipe = lazypipe().pipe(plugins.less, settings.options).pipe(plugins.shorthand).pipe(plugins.pleeease, settings.pleeease).pipe(plugins.stripCssComments, settings.comments).pipe(plugins.removeEmptyLines),

    less = {
        tasks: {
            "less:prod": function () {
                return gulp.src(settings.src)
                    .pipe(mainLessPipe())
                    .pipe(plugins.cssnano())
                    .pipe(gulp.dest(settings.dest));
            },
            "less:dev": function () {
                return gulp.src(settings.src)
                    .pipe(plugins.plumber())
                    .pipe(plugins.sourcemaps.init())
                    .pipe(mainLessPipe())
                    .pipe(plugins.sourcemaps.write("."))
                    .pipe(gulp.dest(settings.dest));
            },
            "less:dev:all": ["less:dev"],

            // All "default" tasks will be added to the main default task
            "default": ["less:dev:all"]
        },

        // watch object {"watch-this-(dir|glob|file)": "do-this-task (Array)"}
        watch: {
            "less/**": ["less:dev"]
        }
    };

module.exports = less;