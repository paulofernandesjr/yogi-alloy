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
    description: 'Clone or update AlloyUI dependencies.'
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
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git');

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(dependencies, mainCallback) {
    prompt('Do you wish to clone or update the modules: [' +
                Object.keys(dependencies).join(', ') + ']? [y/N] ', function(ans) {

        if (ans.toLowerCase().trim() === 'y') {
            var dependencyName,
                stack = [];

            for (dependencyName in dependencies) {
                var dependency = dependencies[dependencyName];

                // wraps in a closure to hold dependency reference
                (function(dependency) {
                    if (file.exists(dependency.folder)) {
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

exports._updateDependency = function(dependency, depCallback) {
    log.info('Updating repo ' + dependency.repo +
                ' [' + dependency.version + ']...');

    async.series([
        function(mainCallback) {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .on('stderr', command.writeTo(process.stderr))
                .exec('git', ['fetch', dependency.repo, dependency.version], { cwd: dependency.folder })
                .then(function() {
                    mainCallback();
                });
        },
        function(mainCallback) {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .on('stderr', command.writeTo(process.stderr))
                .exec('git', ['checkout', dependency.version, '-f'], { cwd: dependency.folder })
                .then(function() {
                    mainCallback();
                });
        },
        function(mainCallback) {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .on('stderr', command.writeTo(process.stderr))
                .exec('git', ['pull', '--rebase', dependency.repo, dependency.version], { cwd: dependency.folder })
                .then(function() {
                    mainCallback();
                });
        }],
        function() {
            depCallback();
        }
    );
};

exports._initDependency = function(dependency, depCallback) {
    log.info('Initializing repo ' + dependency.repo +
                ' [' + dependency.version + ']...');

    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('git', ['clone', dependency.repo, '-b', dependency.version, dependency.folder], { cwd: root })
        .then(function() {
            depCallback();
        });
};