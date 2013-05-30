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
    description: 'Deploy API Docs to alloyui.com/api.'
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
    clc = require('cli-color'),
    apiBuildCmd = base.requireAlloy('lib/cmds/api-build');

// -- Root ---------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

// -- Command ------------------------------------------------------------------
var alloySiteDir = path.join(root, '../alloyui.com'),
    ghpagesBranch = 'gh-pages',
    deployRemote = 'origin';

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        log.oops('You must run this command inside of ' + base.ALLOY + ' folder');
    }

    var alloyJSON = base.getAlloyJSON(),
        themeDir = alloyJSON.dependencies['alloy-yuidoc-theme'].folder,
        configFile = path.join(themeDir, 'yuidoc.json');

    async.series([
        function(mainCallback) {
            exports._checkRemote(mainCallback);
        },
        function(mainCallback) {
            exports._gitGoToBranch(mainCallback, ghpagesBranch);
        },
        function(mainCallback) {
            var sourceDir = root,
                destinationDir = path.join(alloySiteDir, 'api');

            log.info('Build YUIDoc locally');
            log.info('Origin: ' + clc.magentaBright(sourceDir));
            log.info('Destination: ' + clc.magentaBright(destinationDir));

            yuidoc.build(mainCallback, alloyJSON.version, configFile, sourceDir, destinationDir);
        },
        function(mainCallback) {
            log.info('Add changes to gh-pages branch');
            exports._gitAddAll(mainCallback);
        },
        function(mainCallback) {
            log.info('Commit changes to gh-pages branch');
            exports._gitCommit(mainCallback);
        },
        function(mainCallback) {
            log.info('Push changes to gh-pages branch');
            exports._gitPushToBranch(mainCallback, deployRemote, ghpagesBranch);
        }],
        function() {
            log.info('Done :)');
            process.exit(0);
        }
    );
};

exports._checkRemote = function(mainCallback) {
    prompt('What alloyui.com remote do you want to deploy [' + clc.magentaBright(deployRemote) + ']? ', function(ans) {
        if (ans.trim() !== '') {
            deployRemote = ans;
        }
        mainCallback();
    });
};

exports._gitGoToBranch = function(mainCallback, branch) {
    command.open(alloySiteDir)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['checkout', branch])
        .then(function() {
            mainCallback();
        });
};

exports._gitAddAll = function(mainCallback) {
    command.open(alloySiteDir)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['add', '.'])
        .then(function() {
            mainCallback();
        });
};

exports._gitCommit = function(mainCallback) {
    command.open(alloySiteDir)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['commit', '-m', 'Regenerate API Docs'])
        .then(function() {
            mainCallback();
        });
};

exports._gitPushToBranch = function(mainCallback, remote, branch) {
    command.open(alloySiteDir)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['push', remote, branch])
        .then(function() {
            mainCallback();
        });
};