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
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    prompt = require('cli-prompt'),
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git');

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..')),
    alloyJSONPath = path.join(root, '.alloy.json'),
    alloyJSON;

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

    async.series([
        function(mainCallback) {
            exports._initDependencies(alloyJSON.dependencies, mainCallback);
        },
        function(mainCallback) {
            exports._initYUI(alloyJSON.dependencies, mainCallback);
        }],
        function() {
            log.info('done.');
            process.exit(0);
        }
    );
};

exports._initDependency = function(dependency, depCallback) {
    log.info('Initializing repo ' + dependency.repo +
                ' [' + dependency.version + ']...');

    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['clone', dependency.repo, '-b', dependency.version, dependency.folder])
        .then(function() {
            depCallback();
        });
};

exports._initDependencies = function(dependencies, mainCallback) {
    prompt('Do you wish to clone or update the modules: [' +
                Object.keys(dependencies).join(', ') + ']? [y/N] ', function(ans) {

        if (ans.toLowerCase() === 'y') {
            var dependencyName,
                stack = [];

            for (dependencyName in dependencies) {
                var dependency = dependencies[dependencyName];

                // wraps in a closure to hold dependency reference
                (function(dependency) {
                    if (file.exists(path.join(root, dependency.folder))) {
                        stack.push(function(depCallback) {
                            exports._updateDependency(dependency, depCallback);
                        });
                    }
                    else {
                        stack.push(function(depCallback) {
                            exports._initDependency(dependency, depCallback);
                        });
                    }
                })(dependency);
            }

            async.parallel(
                stack,
                function() {
                    mainCallback();
                }
            );
        }
        else {
            mainCallback();
        }
    });
};

exports._initYUI = function(dependencies, mainCallback) {
    prompt('Do you wish to do a full YUI build into alloy build folder? [y/N] ', function(ans) {
        if (ans.toLowerCase() === 'y') {
            var buildDir = path.join(root, 'build'),
                srcDir = path.join(dependencies.yui3.folder, 'src');

            file.mkdir(buildDir);

            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .exec('shifter', ['--build-dir', buildDir, '--walk' ], { cwd: srcDir })
                .then(function() {
                    mainCallback();
                });
        }
        else {
            mainCallback();
        }
    });
};

exports._updateDependency = function(dependency, depCallback) {
    log.info('Updating repo ' + dependency.repo +
                ' [' + dependency.version + ']...');

    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['rebase', 'origin', dependency.version], { cwd: dependency.folder })
        .then(function() {
            depCallback();
        });
};