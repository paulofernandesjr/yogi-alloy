/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var TMPDIR = process.env.TMPDIR;

var command = require('command'),
    log = require("cli-log").init({ prefix: 'yogi' }),
    alloy = base.requireAlloy('alloy'),
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git'),
    util = base.requireYogi('lib/util');

// -- Compass ------------------------------------------------------------------
exports.run = function(cmd, files, opt_options) {
    var cwd = git.findRoot() + '/../',
        component = require(git.findRoot() + '/../component'),
        compassConfig = alloy.compass,
        compassConfigPath = YOGI_ALLOY_PATH + '/lib/ruby/compass.rb',
        compassConfigTempPath = TMPDIR + Date.now() + '.rb';

    util.mix(compassConfig, opt_options || {});

    file.replaceTokens(
        compassConfigPath,
        {
            extension: compassConfig['output-style'] === 'compressed' ? 'min.css' : 'css',
            version: component.version
        },
        compassConfigTempPath
    );

    var invokeArgs = [cmd],
        runner = command.open(cwd);

    invokeArgs.push('-c');
    invokeArgs.push(compassConfigTempPath);

    Object.keys(compassConfig).forEach(function(key) {
        invokeArgs.push('--' + key);

        if (compassConfig[key] !== null) {
            invokeArgs.push(compassConfig[key]);
        }
    });

    invokeArgs = invokeArgs.concat(files);

    runner.on('stdout', function(data) {
        console.log(data.toString());
    });

    log.log('file(s): ' + files.join(', ') + ' (' + compassConfig['output-style'] + ')' );

    return runner.exec('compass', invokeArgs, { cwd: cwd });
};