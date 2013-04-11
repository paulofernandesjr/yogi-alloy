/*
* Copyright (c) 2013, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

exports.COMMAND = {
    options: {},
    shorthands: {},
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
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    initDependenciesCmd = base.requireAlloy('lib/cmds/init-dependencies');

// -- Root ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

// -- Command ------------------------------------------------------------------
var source = root,
    destination = path.join(root, 'api');

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        log.oops('You must run this command inside of ' + base.ALLOY + ' folder');
    }

    var alloyJSON = base.getAlloyJSON();

    async.series([
        function(mainCallback) {
            var dependency = {"alloy-docs-theme": alloyJSON.dependencies["alloy-docs-theme"]}
            initDependenciesCmd.run(dependency, mainCallback);
        },
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
    prompt('What\'s the source folder [' + root + ']? ', function(ans) {
        if (ans.trim() !== '') {
            source = path.resolve(root, ans);
        }
        mainCallback();
    });
};

exports._getDestination = function(mainCallback) {
    prompt('What\'s the destination folder [' + destination + ']? ', function(ans) {
        if (ans.trim() !== '') {
            destination = path.resolve(root, ans);
        }
        mainCallback();
    });
};
