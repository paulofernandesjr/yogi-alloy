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
        cache: Boolean,
        coverage: Boolean,
        css: Boolean,
        lint: Boolean,
        loader: Boolean,
        watch: Boolean,
        yui: Boolean
    },
    shorthands: {
        'a': [ '--all' ],
        'C': [ '--coverage' ],
        'c': [ '--css' ],
        'l': [ '--lint' ],
        'L': [ '--loader' ],
        'w': [ '--watch' ],
        'y': [ '--yui' ]
    },
    description: 'Build current folder module or walk dirs trying to build all found components.'
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
        srcDir = path.join(root, 'src'),
        auiBaseDir = path.join(srcDir, 'aui-base'),
        buildDir = path.join(root, 'build'),
        yuiSrcDir = path.join(alloyJSON.dependencies.yui3.folder, 'src'),
        yuiBaseDir = path.join(alloyJSON.dependencies.yui3.folder, 'src', 'yui'),
        stack = [];

    options.aui = false;
    options.walk = false;

    if ((cwd === root) || exports.REGEX_SRC_DIR.test(cwd)) {
        options.walk = true;
        cwd = srcDir;
    }

    if (options.all === undefined &&
        options.cache === undefined &&
        options.coverage === undefined &&
        options.css === undefined &&
        options.lint === undefined &&
        options.loader === undefined &&
        options.watch === undefined &&
        options.yui === undefined) {

        options.aui = true;

        if (cwd !== srcDir) {
            options.loader = true;
        }
    }

    if (options.all) {
        options.aui = true;

        // Check if there's any no-* flag, e.g. no-cache
        if (options.cache !== false)    { options.cache = true; }
        if (options.coverage !== false) { options.coverage = true; }
        if (options.css !== false)      { options.css = true; }
        if (options.lint !== false)     { options.lint = true; }
        if (options.loader !== false)   { options.loader = true; }
        if (options.yui !== false)      { options.yui = true; }
    }

    if (options.aui) {
        log.info(' building AlloyUI...');

        stack.push(function(mainCallback) {
            exports.buildYUI(
                cwd, buildDir, null, alloyJSON.version, options.cache,
                options.coverage, options.lint, options.walk, options.watch, mainCallback
            );
        });
    }

    if (options.cache) {
        log.info(' caching the results of the build...');
    }

    if (options.coverage) {
        log.info(' generating code coverage files...');
    }

    if (options.css) {
        log.info(' building CSS...');

        stack.push(function(mainCallback) {
            exports.buildCSS(mainCallback);
        });
    }

    if (options.lint) {
        log.info(' validating code using JSLint...');
    }

    if (options.loader) {
        log.info(' building loader metadata...');

        stack.push(function(mainCallback) {
            exports.buildYUI(
                auiBaseDir, buildDir, null, alloyJSON.version, options.cache,
                options.coverage, options.lint, options.walk, options.watch, mainCallback
            );
        });
    }

    if (options.watch) {
        log.info(' watching for any changes...');

        stack.push(function(mainCallback) {
            exports.buildYUI(
                cwd, buildDir, null, alloyJSON.version, options.cache,
                options.coverage, options.lint, options.walk, options.watch, mainCallback
            );
        });
    }

    if (options.yui) {
        log.info(' building YUI...');

        stack.push(function(mainCallback) {
            exports.buildYUI(
                yuiSrcDir, buildDir, null, alloyJSON['yui-version'], options.cache,
                options.coverage, options.lint, options.walk, options.watch, mainCallback
            );
        });
    }

    async.parallel(stack, function() {
        log.info('done.');
    });
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
            async.parallel([
                function(mainCallback) {
                    exports._copyCSS(alloyBootstrapDir, auiCssCssDir, mainCallback);
                },
                function(mainCallback) {
                    exports._copyImages(alloyBootstrapDir, auiCssImgDir, mainCallback);
                }],
                function() {
                    mainCallback();
                }
            );
        });
};

exports.buildYUI = function(srcDir, buildDir, message, version, cache, coverage, lint, walk, watch, mainCallback) {
    var _build = function() {
        file.mkdir(buildDir);

        var args = ['--build-dir', buildDir, '--replace-version=' + version ];

        if (cache) {
            args.push('--cache');
        }
        else {
            args.push('--no-cache');
        }

        if (!coverage) {
            args.push('--no-coverage');
        }

        if (!lint) {
            args.push('--no-lint');
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

exports._copyCSS = function(alloyBootstrapDir, auiCssCssDir, mainCallback) {
    var operations = [],
        cssFiles = file.find(alloyBootstrapDir, exports.REGEX_CSS_EXTENSION);

    cssFiles.forEach(function(filename) {
        var versionlessFileName = filename.replace(/-\d\.\d\.\d/, '');

        operations.push(
            function(callback) {
                file.copy(
                    path.join(alloyBootstrapDir, filename),
                    path.join(auiCssCssDir, versionlessFileName),
                    callback
                );
            }
        );
    });

    async.parallel(operations, mainCallback);
};

exports._copyImages = function(alloyBootstrapDir, auiCssImgDir, mainCallback) {
    file.copy(
        path.join(alloyBootstrapDir, 'img'),
        auiCssImgDir,
        mainCallback
    );
};