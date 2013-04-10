/*
* Copyright (c) 2013, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

exports.COMMAND = {
    alias: 's',
    description: 'Run and watches ' + exports.ALLOY_WEBSITE + ' for any changes'
};

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var docpad = base.requireAlloy('lib/docpad'),
    async = require('async'),
    file = base.requireAlloy('lib/file'),
    command = require('command'),
    path = require('path'),
    git = base.requireYogi('lib/git'),
    log = require('cli-log').init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Command ------------------------------------------------------------------
var root = path.resolve(path.join(git.findRoot(), '..'));

exports.run = function(payload, parsed) {

    if (!base.isRepo(base.ALLOY_WEBSITE)) {
        log.oops('You must run this command inside of alloyui.com folder');
    }

    async.series([
        function(mainCallback) {
            log.info('Check if docpad was already installed');
            if (!file.exists('node_modules')) {
                docpad.install(mainCallback);
            } else {
                mainCallback();
            }
        },
        function(mainCallback) {
            log.info('Run docpad and watches for any changes');
            docpad.run(mainCallback);
        }],
        function() {
            log.info('done.');
            process.exit(0);
        }
    );

};