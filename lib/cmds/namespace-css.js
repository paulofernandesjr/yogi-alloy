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
exports.REGEX_CSS_ATTR_CLASS = /(\[ *class *.{0,1}\= *\")( *)([^"]+)( *)(\" *\])/gi;
exports.REGEX_CSS_CLASSES = /([^0-9])\./g;
exports.REGEX_CSS_COMMENTS = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g;
exports.REGEX_CSS_EXTENSION = /\.css$/i;
exports.REGEX_CSS_URL = /url\([^)]+\)/gi;

exports.run = function(payload, parsed) {
    var root = git.findRoot() + '/../',
        files;

    if (typeof payload !== "string") {
        log.bail(util.bad + ' You must specify a namespace.');
        process.exit(1);
    }

    files = file.find(root, exports.REGEX_CSS_EXTENSION);

    if (!files.length) {
        log.bail(util.bad + ' No css files were found in this folder.');
        process.exit(1);
    }

    files.forEach(function(filename) {
        var filepath = root + filename,
            tokensValue = [],
            tokensIndex = 0;

        file.replaceRegex(filepath, exports.REGEX_CSS_COMMENTS, function(match) {
            tokensValue.push(match);
            return '@' + (tokensIndex++) + '@';
        });

        file.replaceRegex(filepath, exports.REGEX_CSS_URL, function(match) {
            tokensValue.push(match);
            return '@' + (tokensIndex++) + '@';
        });

        file.replaceRegex(filepath, exports.REGEX_CSS_CLASSES, "$1." + payload + "-");
        file.replaceRegex(filepath, exports.REGEX_CSS_ATTR_CLASS, "$1$2" + payload + "-$3$4$5");
        file.replaceTokens(filepath, tokensValue);
    });

    log.info(util.good + ' file(s): ' + files.join(', '));
};