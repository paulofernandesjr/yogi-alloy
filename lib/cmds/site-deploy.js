/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

exports.COMMAND = {
    alias: 'D',
    description: 'Deploy website project to alloyui.com'
};

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var docpad = base.requireAlloy('lib/docpad'),
    async = require('async'),
    file = base.requireAlloy('lib/file'),
    command = require('command'),
    path = require('path'),
    git = base.requireYogi('lib/git'),
    fs = require('fs'),
    prompt = require('cli-prompt'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..')),
    currentBranch = '';

exports.run = function(payload, parsed) {

    if (!base.isRepo(base.ALLOY_WEBSITE)) {
        log.oops('You must run this command inside of alloyui.com folder');
    }

    async.series([
        function(mainCallback) {
            exports._getCurrentBranch(mainCallback);
        },
        function(mainCallback) {
            exports._checkCommand(mainCallback);
        },
        function(mainCallback) {
            log.info('Check if docpad is installed');
            exports._checkDocpadInstall(mainCallback);
        },
        function(mainCallback) {
            log.info('Build the website locally');
            exports._buildWebsite(mainCallback);
        },
        function(mainCallback) {
            log.info('Go to gh-pages branch');
            exports._goToGhpagesBranch(mainCallback);
        },
        function(mainCallback) {
            log.info('Move files from out folder');
            exports._moveOutFolder(mainCallback, payload);
        },
        function(mainCallback) {
            log.info('Remove out folder');
            exports._removeOutFolder(mainCallback);
        },
        function(mainCallback) {
            log.info('Remove node_modules folder');
            exports._removeNodeModulesFolder(mainCallback);
        },
        function(mainCallback) {
            log.info('Add changes to gh-pages branch');
            exports._addToGhpagesBranch(mainCallback);
        },
        function(mainCallback) {
            log.info('Commit changes to gh-pages branch');
            exports._commitToGhpagesBranch(mainCallback);
        },
        function(mainCallback) {
            log.info('Push changes to gh-pages branch');
            exports._pushToGhpagesBranch(mainCallback);
        },
        function(mainCallback) {
            log.info('Goes back to current branch');
            exports._goBackToCurrentBranch(mainCallback, payload);
        }],
        function() {
            log.success('Done :)');
            process.exit(0);
        }
    );

};

exports._getCurrentBranch = function(mainCallback) {
    git.branch(function () {
        currentBranch = arguments[0];
        mainCallback();
    });
};

exports._checkCommand = function(mainCallback) {
    prompt('Are you sure you want to deploy ' + currentBranch + '? [y/N] ', function(ans) {
        if (ans.toLowerCase() === 'y') {
            mainCallback();
        } else {
            log.oops('No problem, take your time.');
            process.exit(0);
        }
    });
};

exports._checkDocpadInstall = function(mainCallback) {
    if (!file.exists('node_modules')) {
        docpad.install(mainCallback);
    } else {
        log.success('Docpad already installed');
        mainCallback();
    }
};

exports._buildWebsite = function(mainCallback) {
    docpad.generate(mainCallback);
};

exports._goToGhpagesBranch = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['checkout', 'gh-pages', '-f'])
        .then(function() {
            mainCallback();
        });
};

exports._moveOutFolder = function(mainCallback) {
    var outFolder = root + '/out/',
        outCollection = fs.readdirSync(outFolder);

    async.eachLimit(outCollection, 10, function (filename, callback) {
        var origin = outFolder + filename,
            destination = '';

        if (currentBranch === "master") {
            destination = root + '/' + filename;
        } else {
            destination = root + '/versions/' + currentBranch + '/' + filename;
        }

        file.copy(origin, destination, function(err) {
            if (err) {
                log.oops(err);
            }
            else {
                log.success('Copied: ' + filename);
                callback();
            }
        });
    }, function() {
        mainCallback();
    });
};

exports._removeOutFolder = function(mainCallback) {
    var outFolder = root + '/out/';

    file.remove(outFolder, function(err) {
        if (err) {
            log.oops(err);
        }
        else {
            log.success('Removed: ' + outFolder);
            mainCallback();
        }
    });
};

exports._removeNodeModulesFolder = function(mainCallback) {
    var nodeModulesFolder = root + '/node_modules/';

    file.remove(nodeModulesFolder, function(err) {
        if (err) {
            log.oops(err);
        }
        else {
            log.success('Removed: ' + nodeModulesFolder);
            mainCallback();
        }
    });
};

exports._addToGhpagesBranch = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['add', '.'])
        .then(function() {
            mainCallback();
        });
};

exports._commitToGhpagesBranch = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['commit', '-m', 'Regenerate'])
        .then(function() {
            mainCallback();
        });
};

exports._pushToGhpagesBranch = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['push', 'origin', 'gh-pages'])
        .then(function() {
            mainCallback();
        });
};

exports._goBackToCurrentBranch = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['checkout', currentBranch])
        .then(function() {
            mainCallback();
        });
};