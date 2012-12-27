/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

(function() {

	var fs = require('fs'),

		Okeys = Object.keys,

		Ovalues = function (obj) {
			var keys = Object.keys(obj),
				i = 0,
				len = keys.length,
				values = [];

			for (; i < len; ++i) {
				values.push(obj[keys[i]]);
			}

			return values;
		};

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
			keys = Okeys(tokens),
			values = Ovalues(tokens),
			content = instance.read(filepath);

		keys.forEach(function(key) {
			content = content.replace('@' + key.toUpperCase() + '@', values[key]);
		});

		instance.write(opt_outputFilepath || filepath, content);
	};

	exports.write = function(filepath, content) {
		return fs.writeFileSync(filepath, content);
	};

}());