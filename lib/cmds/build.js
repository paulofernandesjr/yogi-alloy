/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

exports.COMMAND = {
    options: {
        all: Boolean,
        aui: Boolean,
        css: Boolean,
        fast: Boolean,
        loader: Boolean,
        watch: Boolean,
        yui: Boolean
    },
    shorthands: {
        'A': [ '--all' ],
        'a': [ '--aui' ],
        'c': [ '--css' ],
        'f': [ '--fast' ],
        'l': [ '--loader' ],
        'w': [ '--watch' ],
        'y': [ '--yui' ]
    },
    description: 'Build current folder component or walk dirs trying to build all found components.'
};

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    command = require('command'),
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    prompt = require('cli-prompt');

// -- Command ------------------------------------------------------------------
exports.REGEX_SRC_DIR = /\/src\/?$/i;
exports.REGEX_CSS_EXTENSION = /\.css$/i;

var cwd = process.cwd(),
    root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }

    var alloyJSON = base.getAlloyJSON(),
        auiBaseDir = path.join(srcDir, 'aui-base'),
        buildDir = path.join(root, 'build'),
        srcDir = path.join(root, 'src'),
        yuiSrcDir = path.join(alloyJSON.dependencies.yui3.folder, 'src'),
        yuiBaseDir = path.join(alloyJSON.dependencies.yui3.folder, 'src', 'yui'),
        stack = [],
        walk = false;

    if ((cwd === root) ||
        exports.REGEX_SRC_DIR.test(cwd)) {

        walk = true;
        cwd = srcDir;
    }

    if (options.all === undefined &&
        options.aui === undefined &&
        options.css === undefined &&
        options.fast === undefined &&
        options.loader === undefined &&
        options.watch === undefined &&
        options.yui === undefined) {

        options.aui = true;
        options.fast = true;

        if (cwd !== srcDir) {
            options.loader = true;
        }
    }

    if (options.all) {
        options.aui = true;
        options.css = true;
        options.yui = true;
    }

    if (options.aui) {
        log.info(' building AlloyUI...');

        stack.push(function(mainCallback) {
            exports.buildYUI(cwd, buildDir, null, alloyJSON.version, options.fast, walk, options.watch, mainCallback);
        });
    }

    if (options.css) {
        log.info(' building CSS...');

        stack.push(function(mainCallback) {
            exports.buildCSS(mainCallback);
        });
    }

    if (options.fast) {
        log.info(' building them fast...');
    }

    if (options.loader) {
        log.info(' building loader metadata...');

        stack.push(function(mainCallback) {
            exports.buildYUI(auiBaseDir, buildDir, null, alloyJSON.version, options.fast, walk, options.watch, mainCallback);
        });
    }

    if (options.watch) {
        log.info(' watching for any changes...');

        stack.push(function(mainCallback) {
            exports.buildYUI(cwd, buildDir, null, alloyJSON.version, options.fast, walk, options.watch, mainCallback);
        });
    }

    if (options.yui) {
        log.info(' building YUI...');

        stack.push(function(mainCallback) {
            exports.buildYUI(yuiSrcDir, buildDir, null, alloyJSON['yui-version'], options.fast, walk, options.watch, mainCallback);
        });
    }

    async.series([
        function(mainCallback) {
            if (options.all || options.aui || options.watch) {
                exports.buildYUI(yuiBaseDir, buildDir, null, alloyJSON['yui-version'], true, walk, false, mainCallback);
            }
            else {
                mainCallback();
            }
        }],
        function() {
            async.parallel(stack, function() {
                log.success('done.');
            });
        }
    );
};

exports.buildCSS = function(mainCallback) {
    var alloyJSON = base.getAlloyJSON(),
        buildDir = path.join(root, 'build'),
        auiCssDir = path.join(buildDir, 'aui-css'),
        auiCssCssDir = path.join(auiCssDir, 'css'),
        auiCssImgDir = path.join(auiCssDir, 'img'),
        alloyBootstrapDir = alloyJSON.dependencies[base.TWITTER_BOOTSTRAP].folder;

    file.mkdir(auiCssDir);
    file.mkdir(auiCssCssDir);
    file.mkdir(auiCssImgDir);

    command.open(alloyBootstrapDir)
        .on('stdout', command.writeTo(process.stdout))
        .on('stderr', command.writeTo(process.stderr))
        .exec('yogi', ['alloy', 'css-compile' ])
        .then(function() {
            file.find(alloyBootstrapDir, exports.REGEX_CSS_EXTENSION).forEach(function(css) {
                var versionlessFile = css.replace(/-\d\.\d\.\d/, '');

                file.copy(
                    path.join(alloyBootstrapDir, css),
                    path.join(auiCssCssDir, versionlessFile)
                );
            });

            log.info(' copying images...');

            file.copy(
                path.join(alloyBootstrapDir, 'img'),
                auiCssImgDir
            );

            mainCallback();
        });
};

exports.buildYUI = function(srcDir, buildDir, message, version, fast, walk, watch, mainCallback) {
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

        if (watch) {
            args.push('--watch');
        }

        command.open(srcDir)
            .on('stdout', command.writeTo(process.stdout))
            .on('stderr', command.writeTo(process.stderr))
            .exec('shifter', args, { cwd: srcDir })
            .then(function() {
                mainCallback();
            });
    };

    if (message) {
        prompt(message + ' [' + buildDir + ']? [y/N] ', function(ans) {
            if (ans.toLowerCase().trim() === 'y') {
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