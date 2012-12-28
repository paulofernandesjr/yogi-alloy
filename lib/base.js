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
    log = exports.requireYogi('lib/log'),
    util = exports.requireYogi('lib/util');

// -- Utils --------------------------------------------------------------------
exports.ALLOY_WEBSITE = 'alloyui.com';
exports.TWITTER_BOOTSTRAP = 'alloy-twitter-bootstrap';

exports.isRepo = function(repoName) {
    var instance = this,
        origin = git.origin();

    if (origin.indexOf(repoName) > -1) {
        return true;
    }

    log.bail(util.bad + ' You must be inside ' + repoName + ' repo for this to work!');

    return false;
};

exports.isReservedArg = function(word) {
    var reserved = {
        '$0': 1,
        '_': 1
    };

    return reserved.hasOwnProperty(word);
};