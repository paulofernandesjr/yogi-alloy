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
    log = require("cli-log").init({ prefix: 'yogi', prefixColor: 'magenta' });

// -- Utils --------------------------------------------------------------------
exports.ALLOY = 'alloy-ui';
exports.ALLOY_WEBSITE = 'alloyui.com';
exports.TWITTER_BOOTSTRAP = 'alloy-twitter-bootstrap';

var root = path.resolve(path.join(git.findRoot(), '..')),
    alloyJSONPath = path.join(root, '.alloy.json');

exports.getOptions = function() {
    var dir = path.resolve(YOGI_ALLOY_PATH, 'lib/cmds'),
        commands = file.find(dir),
        options = {
            'help': {
                alias: 'h',
                description: 'Show help'
            }
        };

    for (var i = 0; i < commands.length; i++) {
        var command = require(path.join(dir, commands[i])),
            commandName = path.basename(commands[i], path.extname(commands[i]));

        if (command.COMMAND) {
            options[commandName] = command.COMMAND;
        }
        else {
            log.warn('[' + commandName + '] command cannot be registered!');
        }
    }

    return options;
};

exports.OPTIONS = exports.getOptions();

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

exports.isOption = function(word) {
    return exports.OPTIONS.hasOwnProperty(word);
};

exports.isRepo = function(repoName) {
    var origin = git.origin();

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