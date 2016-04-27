/*global require */
/*jslint node: true */
"use strict";

var config = require("./gulp/config.js"),
    util = require("./gulp/util.js");

// Sets where the js av css files will end up (default is "dist")
//config.compileToFolder = "dist";

// This is used in /UI/gulp/tasks/preloadBrowser.js (default is "http://localhost/")
config.developerRoot = "http://defaultweb.local:666/";

util.init();

/*
    Checkout /UI/gulp/tasks/examples.js for instructions how to gulp with an almost empty glupfile.
*/