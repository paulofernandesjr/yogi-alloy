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
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git');

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..')),
    alloyJSONPath = path.join(root, '.alloy.json'),
    alloyJSON;

exports.REGEX_CSS_EXTENSION = /\.css$/i;

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

    var buildDir = path.join(root, 'build'),
        auiCssDir = path.join(buildDir, 'aui-css'),
        auiCssCssDir = path.join(auiCssDir, 'css'),
        auiCssImgDir = path.join(auiCssDir, 'img'),
        alloyBootstrapDir = path.join(root, alloyJSON.dependencies[base.TWITTER_BOOTSTRAP].folder);

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
                .exec('yogi', ['alloy', '--namespace-css', alloyJSON.cssnamespace ]);
        });
};