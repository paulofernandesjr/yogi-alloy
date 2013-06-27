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
    description: 'Deploy website project to alloyui.com.'
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
    clc = require('cli-color'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..')),
    ghpagesBranch = 'gh-pages',
    deployBranch = '',
    deployRemote = 'origin';

exports.run = function(options) {

    if (!base.isRepo(base.ALLOY_WEBSITE)) {
        log.oops('You must run this command inside of alloyui.com folder');
    }

    async.series([
        function(mainCallback) {
            exports._getCurrentBranch(mainCallback);
        },
        function(mainCallback) {
            exports._checkBranch(mainCallback);
        },
        function(mainCallback) {
            exports._checkRemote(mainCallback);
        },
        function(mainCallback) {
            exports._gitGoToBranch(mainCallback, deployBranch);
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
            exports._gitGoToBranch(mainCallback, ghpagesBranch);
        },
        function(mainCallback) {
            log.info('Move files from out folder');
            exports._moveOutFolder(mainCallback);
        },
        function(mainCallback) {
            log.info('Remove out folder');
            exports._removeOutFolder(mainCallback);
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
        },
        function(mainCallback) {
            log.info('Go back to the branch you were working');
            exports._gitGoToBranch(mainCallback, deployBranch);
        }],
        function() {
            log.success('Done :)');
            process.exit(0);
        }
    );

};

exports._getCurrentBranch = function(mainCallback) {
    git.branch(function () {
        deployBranch = arguments[0];
        mainCallback();
    });
};

exports._checkBranch = function(mainCallback) {
    prompt('What branch do you want to deploy [' + clc.magentaBright(deployBranch) + ']? ', function(ans) {
        if (ans.trim() !== '') {
            deployBranch = ans;
        }
        mainCallback();
    });
};

exports._checkRemote = function(mainCallback) {
    prompt('What remote do you want to deploy [' + clc.magentaBright(deployRemote) + ']? ', function(ans) {
        if (ans.trim() !== '') {
            deployRemote = ans;
        }
        mainCallback();
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

exports._moveOutFolder = function(mainCallback) {
    var outFolder = root + '/out/',
        outCollection = fs.readdirSync(outFolder);

    async.eachLimit(outCollection, 10, function (filename, callback) {
        var origin = outFolder + filename,
            destination = '';

        if (deployBranch === "master") {
            destination = root + '/' + filename;
        } else {
            destination = root + '/versions/' + deployBranch + '/' + filename;
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

exports._gitAddAll = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['add', '.'])
        .then(function() {
            mainCallback();
        });
};

exports._gitCommit = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['commit', '-m', 'Regenerate'])
        .then(function() {
            mainCallback();
        });
};

exports._gitPushToBranch = function(mainCallback, remote, branch) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['push', remote, branch])
        .then(function() {
            mainCallback();
        });
};

exports._gitGoToBranch = function(mainCallback, branch) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['checkout', branch])
        .then(function() {
            mainCallback();
        });
};