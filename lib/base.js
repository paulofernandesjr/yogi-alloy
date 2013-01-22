/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_PATH = process.env.YOGI_PATH,
    YOGI_ALLOY_PATH = __dirname + '/../';

var path = require('path');

exports.requireAlloy = function(p) {
    return require(path.join(YOGI_ALLOY_PATH, p));
};

exports.requireYogi = function(p) {
    return require(path.join(YOGI_PATH, p));
};

// -- Requires -----------------------------------------------------------------
var git = exports.requireYogi('lib/git'),
    log = require("cli-log").init({ prefix: 'yogi' });

// -- Utils --------------------------------------------------------------------
exports.ALLOY_WEBSITE = 'alloyui.com';
exports.TWITTER_BOOTSTRAP = 'alloy-twitter-bootstrap';
exports.OPTIONS = {
    'help': {
        alias: 'h',
        description: 'Show help'
    },
    'compile-css': {
        alias: 'c',
        description: 'Compass compile of .scss files into .css'
    },
    'namespace-css': {
        alias: 'n',
        description: 'Collect all .css files on the current directory and namespace its rules'
    },
    'run-site': {
        alias: 'r',
        description: 'Run ' + exports.ALLOY_WEBSITE + ' website project'
    },
    'watch-css': {
        alias: 'w',
        description: 'Compass watch conversion for .scss files changes into .css'
    }
};

exports.isOption = function(word) {
    return exports.OPTIONS.hasOwnProperty(word);
};

exports.isRepo = function(repoName) {
    var instance = this,
        origin = git.origin();

    if (origin.indexOf('/' + repoName + '.git') > -1) {
        return true;
    }

    log.oops('You must be inside ' + repoName + ' repo for this to work!');

    return false;
};

exports.isReservedArg = function(word) {
    var reserved = {
            '$0': 1,
            '_': 1
        },
        isAlias = (word.length === 1);

    return isAlias || reserved.hasOwnProperty(word);
};