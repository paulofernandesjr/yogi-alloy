#!/usr/bin/env node

/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

(function() {

    var argv = require('optimist').argv,
        path = require('path'),

        YOGI_PATH = process.env.YOGI_PATH,
        YOGI_ALLOY_PATH = __dirname + '/../';

    if (!YOGI_PATH) {
        console.log('This should be executed from yogi');
        process.exit(1);
    }

    var requireAlloy = function(p) {
            return require(path.join(YOGI_ALLOY_PATH, p));
        },

        requireYogi = function(p) {
            return require(path.join(YOGI_PATH, p));
        },

        compass = requireAlloy('lib/compass'),
        file = requireAlloy('lib/file'),

        git = requireYogi('lib/git'),
        log = requireYogi('lib/log'),
        util = requireYogi('lib/util');

    var Alloy = {

        REGEX_CSS_COMMENTS: /((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g,
        REGEX_CSS_CLASSES: /([^0-9])\./g,
        REGEX_CSS_EXTENSION: /\.css$/i,
        TWITTER_BOOTSTRAP: 'alloy-twitter-bootstrap',

        /*
        * YOGI Alloy Commands
        */
        doCompileCss: function(payload, parsed) {
            var instance = this;

            if (instance._isTwitterBootstrapFolder()) {
                compass.run('compile', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ]);
                compass.run('compile', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ], { 'output-style': 'compressed' });
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

            if (instance._isTwitterBootstrapFolder()) {
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

            if (instance._isTwitterBootstrapFolder()) {
                compass.run('watch', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ]);
                compass.run('watch', [ 'lib/bootstrap.scss', 'lib/responsive.scss' ], { 'output-style': 'compressed' });
            }
        },
        /*
        * End of commands
        */

        _isReservedArg: function(word) {
            var reserved = {
                '$0': 1,
                '_': 1
            };

            return reserved.hasOwnProperty(word);
        },

        _isTwitterBootstrapFolder: function() {
            var instance = this,
                origin = git.origin();

            if (origin.indexOf(instance.TWITTER_BOOTSTRAP) > -1) {
                return true;
            }

            log.bail(util.bad + ' You must be inside ' + instance.TWITTER_BOOTSTRAP + ' repo for this to work!');

            return false;
        },

        _toPascalCase: function(str) {
            return str.replace(/\w+/g, function(m) {
                return m[0].toUpperCase() + m.slice(1).toLowerCase();
            });
        }
    };

    /*
    * Available commands:
    *
    * yogi alloy --compile-css
    * yogi alloy --watch-css
    * yogi alloy --namespace-css
    */
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

}());