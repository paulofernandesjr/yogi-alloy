/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

exports.COMMAND = {
    options: {
        css: Boolean,
        fast: Boolean,
        js: Boolean
    },
    shorthands: {
        'c': [ '--css' ],
        'f': [ '--fast' ],
        'j': [ '--js' ],
        'l': [ '--loader' ]
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
    initCmd = require('./init');

// -- Command ------------------------------------------------------------------
exports.REGEX_SRC_DIR = /\/src\/?$/i;
exports.REGEX_CSS_EXTENSION = /\.css$/i;

var cwd = process.cwd(),
    root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }

    if (options.css === undefined &&
        options.fast === undefined &&
        options.js === undefined &&
        options.loader === undefined) {

        options.fast = true;
        options.js = true;
        options.loader = true;
    }

    var alloyJSON = base.getAlloyJSON(),
        buildDir = path.join(root, 'build'),
        srcDir = path.join(root, 'src'),
        auiBaseDir = path.join(srcDir, 'aui-base'),
        fast = options.fast,
        stack = [],
        walk = false;

    if ((cwd === root) ||
        exports.REGEX_SRC_DIR.test(cwd)) {

        walk = true;
        cwd = srcDir;
    }

    if (options.js) {
        log.success(' building javascript');

        stack.push(function(mainCallback) {
            initCmd.buildYUI(cwd, buildDir, null, alloyJSON.version, walk, fast, mainCallback);
        });
    }

    if (options.loader) {
        log.success(' building loader metadata');
        stack.push(function(mainCallback) {
            initCmd.buildYUI(auiBaseDir, buildDir, null, alloyJSON.version, walk, fast, mainCallback);
        });
    }

    if (options.css) {
        log.success(' building css');
        stack.push(function(mainCallback) {
            exports.buildCSS(mainCallback);
        });
    }

    if (options.fast) {
        log.success(' building them fast...');
    }

    async.parallel(
        stack,
        function() {
            log.success('done.');
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

            log.info(' namespacing css files...');

            command.open(auiCssCssDir)
                .on('stdout', command.writeTo(process.stdout))
                .exec('yogi', ['alloy', 'css-namespace', '--prefix', alloyJSON.cssnamespace ])
                .then(function() {
                    mainCallback();
                });
        });
};
