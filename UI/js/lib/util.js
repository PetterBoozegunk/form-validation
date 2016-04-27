/*jslint browser: true */

(function (window) {
    "use strict";

    var $ = window.jQuery,
        Handlebars = window.Handlebars,

        localUtil = {
            trim: function (str) {
                var ret = str;

                if (typeof str === "string") {
                    ret = str.replace(/(^\s+|\s+$)/g, "");
                }

                return ret;
            },
            getDir: function (sortOb) {
                var dir = sortOb.dir || "desc";

                return dir;
            },
            getStartRange: function (sortOb) {
                var startRange = sortOb.startRange || 0;

                return startRange;
            },
            getEndRange: function (sortOb, array) {
                var endRange = sortOb.endRange || array.length;

                return endRange;
            },
            setSortObj: function (sortObj, array) {
                var that = this,
                    sortOb = sortObj || {};

                sortOb.dir = that.getDir(sortOb);
                sortOb.startRange = that.getStartRange(sortOb);
                sortOb.endRange = that.getEndRange(sortOb, array);

                return sortOb;
            },
            getSorted: function (a, b) {
                var ret = 0;

                if (a < b) {
                    ret = -1;
                } else if (a > b) {
                    ret = 1;
                }

                return ret;
            },
            setDir: function (sortedArray, dir) {
                if (dir === "asc") {
                    sortedArray.reverse();
                }

                return sortedArray;
            },
            getPropertyName: function (array, propertyName) {
                var propName = propertyName || Object.keys(array[0])[0];

                return propName;
            },
            getHbSource: {
                "object": function (templateSelectorOrObject) {
                    return templateSelectorOrObject;
                },
                "default": function (templateSelectorOrObject) {
                    return $(templateSelectorOrObject);
                }
            }
        },

        util = {
            returnString: function (val) {
                return val ? val.toString() : "";
            },
            returnObject: function (obj) {
                return (!obj) ? {} : obj;
            },
            stopDefault: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            trim: localUtil.trim,
            capitalizeFirst: function (str) {
                var first = str.substring(0, 1),
                    rest = str.substring(1, str.length);

                return first.toUpperCase() + rest;
            },
            logMulti: function (logMultiObj) {
                Object.keys(logMultiObj).forEach(function (item) {
                    window.console.log(item, " = ", logMultiObj[item]);
                });
                window.console.log(" --------------- ");
            },
            copyObjProps: function (fromObj, toObj) {
                Object.keys(fromObj).forEach(function (key) {
                    toObj[key] = fromObj[key];
                });

                return toObj;
            },

            sort: function (array, sortBy, dir) {
                var sortedArray = array.slice(0, array.length);

                sortedArray.sort(function (a, b) {
                    return localUtil.getSorted(localUtil.trim(a[sortBy]), localUtil.trim(b[sortBy]));
                });

                return localUtil.setDir(sortedArray, dir);
            },

            getHbSource: function (templateSelectorOrObject) {
                var argType = typeof templateSelectorOrObject,
                    getSrcElem = localUtil.getHbSource[argType] || localUtil.getHbSource["default"],
                    srcElem = getSrcElem(templateSelectorOrObject);

                return srcElem.html();
            },
            getHbTemplate: function (templateId, context) {
                var source = this.getHbSource(templateId),
                    template = Handlebars.compile(source),
                    ctx = context || {},
                    html = template(ctx);

                return html;
            },
            getPaginationValue: function (table, name) {
                var re = new RegExp(name + "=\\d+", "g"),
                    hasValue = (table.attr("data-ajax-pagination") || "").replace(/\s/g, "").match(re),
                    dataArray = table.data("array") || [],
                    value = hasValue ? parseInt(hasValue.toString().replace(/\D+/g, ""), 10) : dataArray.length;

                return value;
            },
            replaceUrlHashValue: function (hashName, newHashValue) {
                var currentFullHash = document.location.hash,
                    currentValueRe = new RegExp("(" + hashName + "\\=" + ")([\\w]+)", "g"),
                    newHash = hashName + "=" + newHashValue;

                if (!currentFullHash) {
                    document.location.hash = newHash;
                } else if (!currentFullHash.match(currentValueRe)) {
                    document.location.hash += "&amp;" + newHash;
                } else {
                    document.location.hash = currentFullHash.replace(currentValueRe, newHash);
                }
            },
            matches: {
                "^": function (item, searchProp, value) {
                    var matchStart = new RegExp("^" + decodeURIComponent(value), "i"),
                        matches = matchStart.test(item[searchProp]);

                    return matches;
                },
                "default": function (item, searchProp, value) {
                    return (item[searchProp].toString() === value || value === "");
                }
            },
            allMatch: function (item, searchArray, filterRe) {
                var doesMatch = 0,
                    check = util.matches[filterRe] || util.matches["default"];

                searchArray.forEach(function (search) {
                    var split = search.split("="),
                        searchProp = split[0],
                        value = split[1].replace(/\+/, " ");

                    if (check(item, searchProp, value)) {
                        doesMatch += 1;
                    }
                });

                return (doesMatch === searchArray.length);
            },
            ajaxDataSearch: function (data, searchQuery, filterRe) {
                var searchedArray = [],
                    searchArray = searchQuery.split("&");

                data.forEach(function (item) {
                    if (util.allMatch(item, searchArray, filterRe)) {
                        searchedArray.push(item);
                    }
                });

                return searchedArray;

            },
            ajaxDataSort: function (array, propertyName, sortObj) {
                var propName = localUtil.getPropertyName(array, propertyName),
                    sortO = localUtil.setSortObj(sortObj, array),
                    sortArray = util.sort(array, propName, sortO.dir),
                    arraySlice = sortArray.slice(sortO.startRange, sortO.endRange);

                return arraySlice;
            }
        };

    window.util = util;

}(window));