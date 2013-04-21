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
    description: 'Generate alloy release package file.'
};


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
    baseFileName,
    zipFileName;

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }

    var alloyJSON = base.getAlloyJSON();

    baseFileName = 'alloy-' + alloyJSON.version;
    zipFileName = baseFileName + '.zip';

    prompt('Do you want to release Alloy [' + alloyJSON.version + ']? [y/N] ', function(ans) {
        if (ans.toLowerCase().trim() === 'y') {
            process.chdir(root);

            async.series([
                function(mainCallback) {
                    exports._deleteFiles(mainCallback);
                },
                function(mainCallback) {
                    exports._zip(mainCallback);
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
                log.success('Released ' + zipFileName);
                mainCallback();
            });
        }
    );
};
