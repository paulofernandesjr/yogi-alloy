/*
* Copyright (c) 2013, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

exports.COMMAND = {
    alias: 'g',
    description: 'Build the API Docs locally.'
};

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var yuidoc = base.requireAlloy('lib/yuidoc'),
    async = require('async'),
    file = base.requireAlloy('lib/file'),
    command = require('command'),
    path = require('path'),
    git = base.requireYogi('lib/git'),
    prompt = require('cli-prompt'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Root ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

// -- Command ------------------------------------------------------------------
var source = root,
    destination = path.join(root, 'api');

exports.run = function(payload, parsed) {
    if (!base.isRepo(base.ALLOY)) {
        log.oops('You must run this command inside of ' + base.ALLOY + ' folder');
    }

    async.series([
        function(mainCallback) {
            exports._getSource(mainCallback);
        },
        function(mainCallback) {
            exports._getDestination(mainCallback);
        },
        function(mainCallback) {
            log.info('Build YUIDoc locally');
            yuidoc.build(mainCallback, source, destination);
        }],
        function() {
            log.info('Done :)');
            process.exit(0);
        }
    );
};

exports._getSource = function(mainCallback) {
    prompt('Which is the source folder [root]? ', function(ans) {
        if (ans !== '') {
            source = path.join(root, ans);
        }
        mainCallback();
    });
};

exports._getDestination = function(mainCallback) {
    prompt('Which is the destination folder [api]? ', function(ans) {
        if (ans !== '') {
            destination = path.join(root, ans);
        }
        mainCallback();
    });
};