/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

// -- Requires -----------------------------------------------------------------
var fs = require('fs');

// -- Utils --------------------------------------------------------------------
function objectValues(obj) {
    var keys = Object.keys(obj),
        i = 0,
        len = keys.length,
        values = [];

    for (; i < len; ++i) {
        values.push(obj[keys[i]]);
    }

    return values;
}

// -- File ---------------------------------------------------------------------
exports.find = function(path, opt_pattern) {
    return fs.readdirSync(path).filter(function(file) {
        return (opt_pattern || /.*/).test(file);
    });
};

exports.getJSON = function(filepath) {
    var instance = this,
        json = null;

    if (fs.existsSync(filepath)) {
        json = JSON.parse(instance.read(filepath));
    }

    return json;
};

exports.read = function(filepath) {
    return fs.readFileSync(filepath).toString();
};

exports.replaceRegex = function(filepath, regex, replacement) {
    var instance = this,
        content = instance.read(filepath);

    instance.write(filepath, content.replace(regex, replacement));
};

exports.replaceTokens = function(filepath, tokens, opt_outputFilepath) {
    var instance = this,
        keys = Object.keys(tokens),
        values = objectValues(tokens),
        content = instance.read(filepath);

    keys.forEach(function(key, index) {
        content = content.replace('@' + key.toUpperCase() + '@', values[index]);
    });

    instance.write(opt_outputFilepath || filepath, content);
};

exports.write = function(filepath, content) {
    return fs.writeFileSync(filepath, content);
};

exports.hasFolder = function(folderName) {
    return fs.existsSync(folderName);
};