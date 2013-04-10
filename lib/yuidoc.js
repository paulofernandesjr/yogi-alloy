/*
* Copyright (c) 2013, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    file = base.requireAlloy('lib/file'),
    command = require('command'),
    path = require('path'),
    git = base.requireYogi('lib/git'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    which = require('which').sync;

// -- Root ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

// -- YUIDoc ------------------------------------------------------------------
exports.run = function(callback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec(which('yuidoc'), ['.', '--server'])
        .then(function() {
            callback();
        });
};

exports.build = function(callback, source, destination) {
    command.open(source)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec(which('yuidoc'), ['.', '-o', destination])
        .then(function() {
            callback();
        });
};