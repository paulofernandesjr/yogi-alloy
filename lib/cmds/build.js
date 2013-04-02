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
    git = base.requireYogi('lib/git'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    initCmd = require('./init');

// -- Command ------------------------------------------------------------------
exports.REGEX_SRC_DIR = /\/src\/?$/i;
exports.REGEX_CSS_EXTENSION = /\.css$/i;

var cwd = process.cwd(),
    root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(payload, parsed) {
    if (!base.isRepo(base.ALLOY)) {
        return;
    }

    var alloyJSON = base.getAlloyJSON(),
        buildBase = exports._parseOption(payload, parsed, 'base', false),
        buildCSS = exports._parseOption(payload, parsed, 'css', false),
        buildJS = exports._parseOption(payload, parsed, 'js', true),
        fast = exports._parseOption(payload, parsed, 'fast', true),
        buildDir = path.join(root, 'build'),
        srcDir = path.join(root, 'src'),
        auiBaseDir = path.join(srcDir, 'aui-base'),
        walk = false,
        stack = [];

    if ((cwd === root) ||
        exports.REGEX_SRC_DIR.test(cwd)) {

        walk = true;
        cwd = srcDir;
    }

    if (buildJS) {
        log.info(' Building JavaScript');

        stack.push(function(mainCallback) {
            initCmd.buildYUI(cwd, buildDir, null, alloyJSON.version, walk, fast, mainCallback);
        });
    }

    if (buildBase) {
        log.info(' Building meta');
        stack.push(function(mainCallback) {
            initCmd.buildYUI(auiBaseDir, buildDir, null, alloyJSON.version, walk, fast, mainCallback);
        });
    }

    if (buildCSS) {
        log.info(' Building CSS');
        stack.push(function(mainCallback) {
            exports.buildCSS(mainCallback);
        });
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
        .exec('yogi', ['alloy', '--compile-css' ])
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
                .exec('yogi', ['alloy', '--namespace-css', alloyJSON.cssnamespace ])
                .then(function() {
                    mainCallback();
                });
        });
};

exports._parseOption = function(payload, parsed, option, defaultValue) {
    var options = parsed._;

    if (payload === true) {
        return defaultValue;
    }
    if (options.length) {
        return (payload === option) ||
                (options.indexOf(option) > -1);
    }
    return (payload === option) ;
};