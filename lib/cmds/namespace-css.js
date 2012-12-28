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
var file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git'),
    log = base.requireYogi('lib/log'),
    util = base.requireYogi('lib/util');

// -- Command ------------------------------------------------------------------
exports.REGEX_CSS_CLASSES = /([^0-9])\./g;
exports.REGEX_CSS_COMMENTS = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g;
exports.REGEX_CSS_EXTENSION = /\.css$/i;

exports.run = function(payload, parsed) {
    var root = git.findRoot() + '/../',
        files;

    if (typeof payload !== "string") {
        log.bail(util.bad + ' You must specify a namespace.');
        process.exit(1);
    }

    if (base.isRepo(base.TWITTER_BOOTSTRAP)) {
        files = file.find(root, exports.REGEX_CSS_EXTENSION);

        files.forEach(function(filename) {
            var filepath = root + filename,
                comments = [],
                commentsIndex = 0;

            file.replaceRegex(filepath, exports.REGEX_CSS_COMMENTS, function(match) {
                comments.push(match);
                return '@' + (commentsIndex++) + '@';
            });

            file.replaceRegex(filepath, exports.REGEX_CSS_CLASSES, "$1." + payload + "-");
            file.replaceTokens(filepath, comments);
        });

        log.info(util.good + ' file(s): ' + files.join(', '));
    }
};