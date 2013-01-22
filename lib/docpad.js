/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var log = require("cli-log").init({ prefix: 'yogi', prefixColor: 'magenta' }),
    spawn = require('child_process').spawn;

// -- Docpad ------------------------------------------------------------------
exports.install = function() {
    var docpadInstall = spawn('docpad', ['install', '.']);

    docpadInstall.stdout.on('data', function(data) {
        log.log(data);
    });

    docpadInstall.on('exit', function(code) {
        if (code === 0) {
            exports.run();
        }
    });
};

exports.run = function() {
    var docpadRun = spawn('docpad', ['run', '.']);

    docpadRun.stdout.on('data', function (data) {
        log.log(data);
    });
};