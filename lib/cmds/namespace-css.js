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
var log = require("cli-log").init({ prefix: 'yogi', prefixColor: 'magenta' }),
    path = require('path'),
    file = base.requireAlloy('lib/file'),
    git = base.requireYogi('lib/git');

// -- Command ------------------------------------------------------------------
exports.REGEX_CSS_ATTR_CLASS = /(\[ *class *.{0,1}\= *\")( *)([^"]+)( *)(\" *\])/gi;
exports.REGEX_CSS_CLASSES = /([^0-9])\./g;
exports.REGEX_CSS_COMMENTS = /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g;
exports.REGEX_CSS_EXTENSION = /\.css$/i;
exports.REGEX_CSS_URL = /url\([^)]+\)/gi;
exports.REGEX_DECIMALS = /:[\s\r\n]*\d*\.\d+[^;}]*[\s\r\n]*(;|\})/gi;
exports.REGEX_FILTERS = /filter:[^;]+;/gi;

exports.run = function(payload, parsed) {
    var currentDir = path.resolve('.'),
        files;

    if (typeof payload !== "string") {
        log.oops('You must specify a namespace.');
        process.exit(1);
    }

    files = file.find(currentDir, exports.REGEX_CSS_EXTENSION);

    if (!files.length) {
        log.oops('No css files were found in this folder.');
        process.exit(1);
    }

    files.forEach(function(filename) {
        var filepath = path.join(currentDir, filename),
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

        file.replaceRegex(filepath, exports.REGEX_DECIMALS, function(match) {
            tokensValue.push(match);
            return '@' + (tokensIndex++) + '@';
        });

        file.replaceRegex(filepath, exports.REGEX_FILTERS, function(match) {
            tokensValue.push(match);
            return '@' + (tokensIndex++) + '@';
        });

        file.replaceRegex(filepath, exports.REGEX_CSS_CLASSES, "$1." + payload + "-");
        file.replaceRegex(filepath, exports.REGEX_CSS_ATTR_CLASS, "$1$2" + payload + "-$3$4$5");
        file.replaceTokens(filepath, tokensValue);
    });

    log.log('file(s): ' + files.join(', '));
};