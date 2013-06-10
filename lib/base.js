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
var file = exports.requireAlloy('lib/file'),
    git = exports.requireYogi('lib/git'),
    log = require("cli-log").init({ prefix: 'yogi', prefixColor: 'magenta' }),
    updateNotifier = require('update-notifier');

// -- Utils --------------------------------------------------------------------
exports.ALLOY = 'alloy-ui';
exports.ALLOY_WEBSITE = 'alloyui.com';
exports.TWITTER_BOOTSTRAP = 'alloy-twitter-bootstrap';

var root = path.resolve(path.join(git.findRoot(), '..')),
    alloyJSONPath = path.join(root, '.alloy.json');

exports.checkVersion = function() {
    var notifier = updateNotifier({
        packagePath: '../package',
        updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
    });

    if (notifier.update) {
        notifier.notify();
    }
};

exports.getAlloyJSON = function() {
    var alloyJSON = require(alloyJSONPath),
        dependencies = alloyJSON.dependencies,
        dependency,
        dependencyName;

    if (!file.exists(alloyJSONPath)) {
        log.oops('Nothing to do, .alloy.json was not found.');
    }

    // Resolve all dependency paths to absolute
    if (dependencies) {
        for (dependencyName in dependencies) {
            if (dependencies.hasOwnProperty(dependencyName)) {
                dependency = dependencies[dependencyName];

                if (dependency.folder) {
                    dependency.folder = path.resolve(root, dependency.folder);
                }
            }
        }
    }

    return alloyJSON;
};

exports.isRepo = function(repoName) {
    var origin = git.origin();

    if (origin.indexOf('/' + repoName + '.git') > -1) {
        return true;
    }

    log.oops('You must be inside ' + repoName + ' repo for this to work!');

    return false;
};