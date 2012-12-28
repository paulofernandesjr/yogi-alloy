#!/usr/bin/env node

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

function requireAlloy(p) {
    return require(path.join(YOGI_ALLOY_PATH, p));
}

function requireYogi(p) {
    return require(path.join(YOGI_PATH, p));
}

// -- CLI ----------------------------------------------------------------------
if (!YOGI_PATH) {
    console.log('This should be executed from yogi');
    process.exit(1);
}

// -- Requires -----------------------------------------------------------------
var argv = require('optimist').argv,
    compass = requireAlloy('lib/compass'),
    docpad = requireAlloy('lib/docpad'),
    file = requireAlloy('lib/file'),
    git = requireYogi('lib/git'),
    log = requireYogi('lib/log'),
    util = requireYogi('lib/util');

// -- Commands -----------------------------------------------------------------
var Alloy = {
    REGEX_CSS_COMMENTS: /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g,
    REGEX_CSS_CLASSES: /([^0-9])\./g,
    REGEX_CSS_EXTENSION: /\.css$/i,
    TWITTER_BOOTSTRAP: 'alloy-twitter-bootstrap',
    ALLOY_WEBSITE: 'alloyui.com',

    doCompileCss: function(payload, parsed) {
        var instance = this;

        if (instance._isRepo(instance.TWITTER_BOOTSTRAP)) {
            compass.run('compile', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ]);
            compass.run('compile',[ 'lib/bootstrap.scss', 'lib/responsive.scss' ], { 'output-style': 'compressed' });
        }
    },

    doNamespaceCss: function(payload, parsed) {
        var instance = this,
            root = git.findRoot() + '/../',
            files;

        if (typeof payload !== "string") {
            log.bail(util.bad + ' You must specify a namespace.');
            process.exit(1);
        }

        if (instance._isRepo(instance.TWITTER_BOOTSTRAP)) {
            files = file.find(root, instance.REGEX_CSS_EXTENSION);

            files.forEach(function(filename) {
                var filepath = root + filename,
                    comments = [],
                    commentsIndex = 0;

                file.replaceRegex(filepath, instance.REGEX_CSS_COMMENTS, function(match) {
                    comments.push(match);
                    return '@' + (commentsIndex++) + '@';
                });

                file.replaceRegex(filepath, instance.REGEX_CSS_CLASSES, "$1." + payload + "-");
                file.replaceTokens(filepath, comments);
            });

            log.info(util.good + ' file(s): ' + files.join(', '));
        }
    },

    doWatchCss: function(payload, parsed) {
        var instance = this;

        if (instance._isRepo(instance.TWITTER_BOOTSTRAP)) {
            compass.run('watch', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ]);
            compass.run('watch', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ], { 'output-style': 'compressed' });
        }
    },

    doRunSite: function(payload, parsed) {
        var instance = this;

        if (instance._isRepo(instance.ALLOY_WEBSITE)) {

            if (!file.hasFolder('node_modules')) {
                docpad.install();
            } else {
                docpad.run();
            }

        }
    },

    _isReservedArg: function(word) {
        var reserved = {
            '$0': 1,
            '_': 1
        };

        return reserved.hasOwnProperty(word);
    },

    _isRepo: function(repoName) {
        var instance = this,
            origin = git.origin();

        if (origin.indexOf(repoName) > -1) {
            return true;
        }

        log.bail(util.bad + ' You must be inside ' + repoName + ' repo for this to work!');

        return false;
    },

    _toPascalCase: function(str) {
        return str.replace(/\w+/g, function(m) {
            return m[0].toUpperCase() + m.slice(1).toLowerCase();
        });
    }
};

// -- Initializer --------------------------------------------------------------
Object.keys(argv).forEach(function(action) {
    if (!Alloy._isReservedArg(action)) {
        var payload = argv[action],
            methodName = 'do' + Alloy._toPascalCase(action).replace('-', '');

        if (Alloy[methodName]) {
            log.info(util.good + ' Running ' + action);

            Alloy[methodName].call(Alloy, payload, argv);
        }
        else {
            log.bail(util.bad + ' Ops, ' + action + ' is not recognized as a valid action');
        }
    }
});