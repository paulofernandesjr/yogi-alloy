/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

exports.COMMAND = {
    alias: 'i',
    description: 'Initialize or update alloy project and dependencies'
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
    git = base.requireYogi('lib/git');

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(payload, parsed) {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }

    var alloyJSON = base.getAlloyJSON();

    async.series([
        function(mainCallback) {
            exports._initDependencies(alloyJSON.dependencies, mainCallback);
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

exports.buildYUI = function(srcDir, buildDir, message, version, walk, fast, mainCallback) {
    var _build = function() {
        file.mkdir(buildDir);

        var args = ['--build-dir', buildDir, '--replace-version=' + version ];

        if (fast) {
            args.push('--no-lint');
            args.push('--no-coverage');
            args.push('--cache');
        }

        if (walk) {
            args.push('--walk');
        }

        command.open(srcDir)
            .on('stdout', command.writeTo(process.stdout))
            .exec('shifter', args, { cwd: srcDir })
            .then(function() {
                mainCallback();
            });
    };

    if (message) {
        prompt(message + ' [' + buildDir + ']? [y/N] ', function(ans) {
            if (ans.toLowerCase() === 'y') {
                _build();
            }
            else {
                mainCallback();
            }
        });
    }
    else {
        _build();
    }
};

exports._initDependency = function(dependency, depCallback) {
    log.info('Initializing repo ' + dependency.repo +
                ' [' + dependency.version + ']...');

    command.open(root)
        .on('stdout', command.writeTo(process.stdout))
        .exec('git', ['clone', dependency.repo, '-b', dependency.version, dependency.folder], { cwd: root })
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

exports._initAUI = function(mainCallback) {
    var alloyJSON = base.getAlloyJSON(),
        buildDir = path.join(root, 'build'),
        srcDir = path.join(root, 'src');

    exports.buildYUI(srcDir, buildDir, 'Do you wish to build AlloyUI', alloyJSON.version, true, true, mainCallback);
};

exports._initCSS = function(mainCallback) {
    prompt('Do you wish to import ' + base.TWITTER_BOOTSTRAP +
            ' css files into alloy/build/aui-css/ folder? [y/N] ', function(ans) {

        if (ans.toLowerCase() === 'y') {
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

    prompt('Do you wish to initialize npm modules [y/N] ', function(ans) {
        if (ans.toLowerCase() === 'y') {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
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

    exports.buildYUI(srcDir, buildDir, 'Do you wish to build YUI', alloyJSON['yui-version'], true, true, mainCallback);
};

exports._updateDependency = function(dependency, depCallback) {
    log.info('Updating repo ' + dependency.repo +
                ' [' + dependency.version + ']...');

    async.series([
        function(mainCallback) {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .on('stderr', command.writeTo(process.stdout))
                .exec('git', ['fetch', dependency.repo, dependency.version], { cwd: dependency.folder })
                .then(function() {
                    mainCallback();
                });
        },
        function(mainCallback) {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
                .exec('git', ['checkout', dependency.version], { cwd: dependency.folder })
                .then(function() {
                    mainCallback();
                });
        },
        function(mainCallback) {
            command.open(root)
                .on('stdout', command.writeTo(process.stdout))
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