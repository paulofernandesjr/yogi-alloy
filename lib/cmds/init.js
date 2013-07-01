/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

exports.COMMAND = {
    options: {},
    shorthands: {},
    description: 'Initialize or build AlloyUI dependencies.'
};

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    command = require('command'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    prompt = require('cli-prompt'),
    buildCmd = require('./build'),
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git'),
    initDependenciesCmd = base.requireAlloy('lib/cmds/init-dependencies');

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function() {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }

    var alloyJSON = base.getAlloyJSON();

    async.series([
        function(mainCallback) {
            initDependenciesCmd.run(alloyJSON.dependencies, mainCallback);
        },
        function(mainCallback) {
            exports._initNPM(mainCallback);
        },
        function(mainCallback) {
            exports._initYUI(alloyJSON.dependencies.yui3, mainCallback);
        },
        function(mainCallback) {
            exports._initAUI(mainCallback);
        },
        function(mainCallback) {
            exports._initCSS(mainCallback);
        }],
        function() {
            log.info('done.');
            process.exit(0);
        }
    );
};

exports._initAUI = function(mainCallback) {
    var alloyJSON = base.getAlloyJSON(),
        buildDir = path.join(root, 'build'),
        srcDir = path.join(root, 'src');

    buildCmd.buildYUI(
        srcDir, buildDir, 'Do you wish to build AlloyUI', alloyJSON.version,
        false, false, false, true, false, mainCallback
    );
};

exports._initCSS = function(mainCallback) {
    var buildDir = path.join(root, 'build');

    prompt('Do you wish to import ' + base.TWITTER_BOOTSTRAP +
            ' [' + buildDir + '/aui-css]? [y/N] ', function(ans) {

        if (ans.toLowerCase().trim() === 'y') {
            buildCmd.buildCSS(mainCallback);
        }
        else {
            mainCallback();
        }
    });
};

exports._initNPM = function(mainCallback) {
    if (file.exists(path.join(root, 'node_modules'))) {
        mainCallback();
        return;
    }

    prompt('Do you wish to initialize NPM modules [y/N] ', function(ans) {
        if (ans.toLowerCase().trim() === 'y') {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .on('stderr', command.writeTo(process.stderr))
                .exec('npm', ['install'], { cwd: root })
                .then(function() {
                    mainCallback();
                });
        }
        else {
            mainCallback();
        }
    });
};

exports._initYUI = function(dependency, mainCallback) {
    var alloyJSON = base.getAlloyJSON(),
        buildDir = path.join(root, 'build'),
        dependencySrcDir = path.join(dependency.folder, 'src'),
        srcDir = path.resolve(dependencySrcDir, root, dependencySrcDir);

    buildCmd.buildYUI(
        srcDir, buildDir, 'Do you wish to build YUI', alloyJSON['yui-version'],
        false, false, false, true, false, mainCallback
    );
};