/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    command = require('command'),
    file = base.requireAlloy('lib/file'),
    fs = require('fs'),
    git = base.requireYogi('lib/git'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    prompt = require('cli-prompt'),
    walkdir = require('walkdir');

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..')),
    alloyJSONPath = path.join(root, '.alloy.json'),
    alloyJSON,
    baseFileName,
    zipFileName;

exports.run = function(payload, parsed) {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }
    if (!file.exists(alloyJSONPath)) {
        log.oops('Nothing to do, .alloy.json was not found.');
    }
    else {
        alloyJSON = require(alloyJSONPath);
    }

    baseFileName = 'alloy-' + alloyJSON.version;
    zipFileName = baseFileName + '.zip';

    prompt('Do you want to release Alloy [' + alloyJSON.version + ']? [y/N] ', function(ans) {
        if (ans.toLowerCase() === 'y') {
            async.series([
                function(mainCallback) {
                    exports._deleteFiles(mainCallback);
                },
                function(mainCallback) {
                    exports._gitAddChanges(mainCallback);
                },
                function(mainCallback) {
                    exports._gitStashChanges(mainCallback);
                },
                function(mainCallback) {
                    exports._zip(mainCallback);
                },
                function(mainCallback) {
                    exports._gitStashRestoreChanges(mainCallback);
                },
                function(mainCallback) {
                    exports._gitStashDrop(mainCallback);
                }],
                function() {
                    log.info('done.');
                    process.exit(0);
                }
            );
        }
        else {
            process.exit(0);
        }
    });
};

exports._deleteFiles = function(mainCallback) {
    var finder = walkdir('.'),
        filesToDeleteMap = {
            '.DS_Store': 1
        };

    fs.unlink(zipFileName);
    finder.on('file',function(filename) {
        var basename = path.basename(filename);
        if (filesToDeleteMap[basename]) {
            fs.unlink(filename);
        }
    });
    finder.on('end',function() {
        mainCallback();
    });
};

exports._gitAddChanges = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', [ 'add', '.' ])
        .then(function() {
            mainCallback();
        });
};

exports._gitStashChanges = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', [ 'stash' ])
        .then(function() {
            mainCallback();
        });
};

exports._gitStashRestoreChanges = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', [ 'stash', 'apply' ])
        .then(function() {
            mainCallback();
        });
};

exports._gitStashDrop = function(mainCallback) {
    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', [ 'stash', 'drop' ])
        .then(function() {
            mainCallback();
        });
};

exports._zip = function(mainCallback) {
    log.info('Packing...');

    var Zip = require('zip-archiver').Zip,
        zip = new Zip({
            file: zipFileName,
            root: baseFileName
        });

    async.series([
        function(zipCallback) {
            zip.add('build', function() {
                zipCallback();
            });
        },
        function(zipCallback) {
            zip.add('demos', function() {
                zipCallback();
            });
        },
        function(zipCallback) {
            zip.add('src', function() {
                zipCallback();
            });
        },
        function(zipCallback) {
            zip.add('LICENSE.md', function() {
                zipCallback();
            });
        },
        function(zipCallback) {
            zip.add('README.md', function() {
                zipCallback();
            });
        },
        function(zipCallback) {
            zip.add('.alloy.json', function() {
                zipCallback();
            });
        },
        function(zipCallback) {
            zip.add('.shifter.json', function() {
                zipCallback();
            });
        }],
        function() {
            zip.done(function() {
                log.info('Released ' + zipFileName);
                mainCallback();
            });
        }
    );
};