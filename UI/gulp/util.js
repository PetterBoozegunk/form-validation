/*global require */
/*jslint node: true, stupid: true */
"use strict";

var gulp = require("gulp"),

    config = require("./config.js"),
    fs = require("fs"),

    util = {
        returnArray: function (checkArray) {
            var returnArray = (checkArray instanceof Array) ? checkArray : [];

            return returnArray;
        },
        forEach: function (func, that, obj) {
            Object.keys(obj).forEach(function (key) {
                func.call(that, obj[key], key, obj);
            });
        },
        instanceOfArray: [{
            name: "date",
            instof: Date
        }, {
            name: "array",
            instof: Array
        }, {
            name: "regexp",
            instof: RegExp
        }],
        checkType: function (item, instofObj, objectType) {
            if (item instanceof instofObj.instof) {
                objectType = instofObj.name;
            }

            return objectType;
        },
        getObjectType: function (item) {
            var instanceOfArray = util.instanceOfArray,
                objectType;

            instanceOfArray.forEach(function (instofObj) {
                objectType = util.checkType(item, instofObj, objectType);
            });

            return objectType;
        },
        getTrueType: function (item) {
            var objectType = util.getObjectType(item);

            return objectType || typeof item;
        },
        setGulpTask: function (watchOrTask, name, funcArrayObj) {
            var itemType = util.getTrueType(funcArrayObj);

            if (itemType === "object") {
                gulp[watchOrTask](name, funcArrayObj.beforetask, funcArrayObj.task);
            } else {
                gulp[watchOrTask](name, funcArrayObj);
            }
        },
        setGulp: function (type, obj) {
            util.forEach(function (funcArrayObj, name) {
                // "funcArrayObj" === "function OR Array Or Object"
                util.setGulpTask(type, name, funcArrayObj);
            }, this, obj);
        },

        addDefaultTask: function (fileName) {
            var tasks = require("./tasks/" + fileName).tasks,
                currentDefaultTask = util.returnArray(tasks["default"]),
                defaultTask = util.returnArray(config.tasks["default"]);

            defaultTask = defaultTask.concat(currentDefaultTask);

            config.tasks["default"] = defaultTask;
        },

        addTaskType: function (type, name, typeObj) {
            var nameList = name.replace(/\s/g, "").split(",");

            nameList.forEach(function (item) {
                config[type][item] = typeObj[name];
            });
        },
        addTaskTypes: function (type, fileName) {
            // type is 'tasks' or 'watch'
            var typeObj = require("./tasks/" + fileName)[type] || {};

            Object.keys(typeObj).forEach(function (name) {
                if (name !== "default") {
                    util.addTaskType(type, name, typeObj);
                }
            });
        },

        setConfigBeforeTask: function (tasksObj, eqTaskName, taskName) {
            if (!config.beforetasks[eqTaskName]) {
                config.beforetasks[eqTaskName] = [];
            }

            config.beforetasks[eqTaskName] = config.beforetasks[eqTaskName].concat(tasksObj[taskName]);

            delete tasksObj[taskName];
        },
        checkBeforetask: function (taskName) {
            var tasksObj = this,
                isBeforeTask = /^before\:/.test(taskName),
                eqTaskName = taskName.replace(/^before\:/, "");

            if (isBeforeTask) {
                util.setConfigBeforeTask(tasksObj, eqTaskName, taskName);
            }
        },
        addBeforeTasksToConfig: function (fileName) {
            var tasksObj = require("./tasks/" + fileName).tasks || {};

            Object.keys(tasksObj).forEach(util.checkBeforetask, tasksObj);
        },
        addTasksToConfig: function (fileName) {
            util.addTaskTypes("tasks", fileName);
            util.addDefaultTask(fileName);
        },
        addWatchToConfig: function (fileName) {
            util.addTaskTypes("watch", fileName);
        },
        addToConfig: function (files) {
            files.forEach(util.addBeforeTasksToConfig);
            files.forEach(util.addTasksToConfig);
            files.forEach(util.addWatchToConfig);
        },

        addWatch: function (watchObj) {
            if (!config.tasks.watch) {
                config.tasks.watch = function () {
                    util.setGulp("watch", watchObj);
                };
            }
        },
        addToNamedArray: function (taskName) {
            // tasks that end with ":all" will not be added.
            var isCollectionTask = /(\:all)$/.test(taskName),
                // tasks without ":" in the name will not be added.
                addToNamedArray = /\:/.test(taskName);

            return (!isCollectionTask && addToNamedArray);
        },
        getCollectionArray: function (taskCollectionName) {
            var collectionArray = util.returnArray(config.tasks[taskCollectionName]);

            if (!config.tasks[taskCollectionName]) {
                config.tasks[taskCollectionName] = collectionArray;
            }

            return collectionArray;
        },
        setNamedTaskArray: function (taskName) {
            var splitTaskName = taskName.split(":"),
                taskCollectionName = splitTaskName[splitTaskName.length - 1],
                collectionArray = util.getCollectionArray(taskCollectionName);

            collectionArray.push(taskName);
        },
        getNamedTaskArrays: function () {
            var tasks = config.tasks;

            Object.keys(tasks).forEach(function (taskName) {
                if (util.addToNamedArray(taskName)) {
                    util.setNamedTaskArray(taskName);
                }
            });
        },

        setBeforeTaskType: function (task) {
            return (task instanceof Array) ? function () {
                gulp.start(task);
            } : task;
        },
        setBeforeTask: function (taskName, beforetasksArray, task) {
            config.tasks[taskName] = {
                beforetask: beforetasksArray,
                task: util.setBeforeTaskType(task)
            };
        },
        setBeforeTasks: function () {
            Object.keys(config.beforetasks).forEach(function (taskName) {
                var beforeTasksArray = config.beforetasks[taskName],
                    task = config.tasks[taskName];

                util.setBeforeTask(taskName, beforeTasksArray, task);
            });
        },

        init: function () {
            var files = fs.readdirSync("./gulp/tasks");

            util.addToConfig(files);
            util.getNamedTaskArrays();
            util.setBeforeTasks();

            util.addWatch(config.watch);

            //console.log(config);

            util.setGulp("task", config.tasks);
        }
    };

module.exports = util;