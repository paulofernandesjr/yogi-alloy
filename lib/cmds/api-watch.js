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
    description: 'Run the API Docs locally and watch for any changes.'
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
    clc = require('cli-color'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Root ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

// -- Command ------------------------------------------------------------------
exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        log.oops('You must run this command inside of ' + base.ALLOY + ' folder');
    }

    var alloyJSON = base.getAlloyJSON(),
        themeDir = alloyJSON.dependencies['alloy-apidocs-theme'].folder;
        configFile = path.join(themeDir, 'yuidoc.json');

    async.series([
        function(mainCallback) {
            log.info('Run YUIDoc and watch for any changes');
            yuidoc.run(mainCallback, alloyJSON.version, configFile);
        }],
        function() {
            log.info('Done :)');
            process.exit(0);
        }
    );
};