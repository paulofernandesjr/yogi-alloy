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
var YOGI_ALLOY_PATH = __dirname + '/../../',
    base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var yuidoc = base.requireAlloy('lib/yuidoc'),
    async = require('async'),
    file = base.requireAlloy('lib/file'),
    command = require('command'),
    path = require('path'),
    git = base.requireYogi('lib/git'),
    prompt = require('cli-prompt'),
    clc = require('cli-color'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Root ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

// -- Command ------------------------------------------------------------------
var sourceDir = root,
    destinationDir = path.join(root, 'api');

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        log.oops('You must run this command inside of ' + base.ALLOY + ' folder');
    }

    var alloyJSON = base.getAlloyJSON(),
        themeDir = alloyJSON.dependencies['alloy-apidocs-theme'].folder,
        configFile = path.join(themeDir, 'yuidoc.json');

    async.series([
        function(mainCallback) {
            exports._getSourceDir(mainCallback);
        },
        function(mainCallback) {
            exports._getDestinationDir(mainCallback);
        },
        function(mainCallback) {
            log.info('Build YUIDoc locally');
            yuidoc.build(mainCallback, alloyJSON.version, configFile, sourceDir, destinationDir);
        }],
        function() {
            log.info('Done :)');
            process.exit(0);
        }
    );
};

exports._getSourceDir = function(mainCallback) {
    prompt('What\'s the source directory [' + clc.magentaBright(root) + ']? ', function(ans) {
        if (ans.trim() !== '') {
            sourceDir = path.resolve(root, ans);
        }
        mainCallback();
    });
};

exports._getDestinationDir = function(mainCallback) {
    prompt('What\'s the destination directory [' + clc.magentaBright(destinationDir) + ']? ', function(ans) {
        if (ans.trim() !== '') {
            destinationDir = path.resolve(root, ans);
        }
        mainCallback();
    });
};