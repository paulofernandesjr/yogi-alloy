/*
* Copyright (c) 2013, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

exports.COMMAND = {
    options: {
        name: String
    },
    shorthands: {
        'n': [ '--name' ]
    },
    description: 'Create a new AlloyUI module.'
};

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    git = base.requireYogi('lib/git'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    which = require('which').sync,
    spawn = require('child_process').spawn;

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(options) {
    if (!base.isRepo(base.ALLOY)) {
        log.oops('You must run this command inside of ' + base.ALLOY + ' folder');
    }

    async.series([
        function(mainCallback) {
            if (typeof options.name !== "string") {
                log.oops('You must specify a module name. Try passing `--name foo`.');
                process.exit(1);
            } else {
                log.info('Create a new AlloyUI module');
                exports._initModule(mainCallback, options.name);
            }
        }],
        function() {
            log.info('Done :)');
            process.exit(0);
        }
    );
};

exports._initModule = function(mainCallback, moduleName) {
    var srcFolder = path.join(root, 'src');

    if (moduleName.indexOf('aui-') !== 0) {
        moduleName = 'aui-' + moduleName;
    }

    var cmd = spawn(which('yogi'), ['init', moduleName], {
      cwd: srcFolder,
      env: process.env,
      stdio: 'inherit'
    });

    cmd.on('exit', function() {
        mainCallback();
    });
};
