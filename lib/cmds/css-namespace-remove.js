/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Eduardo Lundgren <eduardo.lundgren@liferay.com>
*/

exports.COMMAND = {
	options: {
	    'file': String
	},
	shorthands: {
	    'f': [ '--file' ]
	},
    description: 'Collect all files recursively and remove "aui-" namespace from css rules'
};

// -- Requires -----------------------------------------------------------------
var log = require("cli-log").init({ prefix: 'yogi', prefixColor: 'magenta' }),
    fs = require("fs-extra"),
    glob = require("glob");

// -- Command ------------------------------------------------------------------
exports.REMOVE_PATTERNS = [
	{
		desc: '.aui-',
		match: /\.aui\-/g,
		replace: '.'
	},
	{
		desc: 'class=""',
		match: /((?:class|className|cssClass|iconClass)=["']\s*)([\w\s-]+)(\s*["'])/g,
		// match: /((?:class|className)=["']\s*)(aui\-[\s\w-]+)+(\s*["'])/g, // good
		replace: function(match, g1, g2, g3) {
			return g1 + g2.replace(/aui\-/g, '') + g3;
		}
	},
	{
		desc: 'key: "aui-foo"',
		match: /([^'"]\w+[^'"A-Z]\s*\:\s*["']\s*)(aui\-[\s\w-]+)+(\s*["'])/g,
		replace: function(match, g1, g2, g3) {
			return g1 + g2.replace(/aui\-/g, '') + g3;
		}
	},
	{
		desc: 'variable = "aui-foo"',
		match: /([^'"]\w+[^'"]\s\=\s["']\s*)(aui\-[\s\w-]+)+(\s*["'])/g,
		replace: function(match, g1, g2, g3) {
			return g1 + g2.replace(/aui\-/g, '') + g3;
		}
	},
	{
		desc: 'add/removeClass',
		match: /(Class\(\s*["']\s*)(aui\-[\s\w-]+)+(\s*["'])/g,
		replace: function(match, g1, g2, g3) {
			return g1 + g2.replace(/aui\-/g, '') + g3;
		}
	}
];

exports.run = function(options) {
	var filePatterns,
		payload = options.file;

	if (typeof payload !== "string") {
	    log.oops('You must specify a file pattern. Try passing `--file *.css`.');
	    process.exit(1);
	}

	filePatterns = payload.split(',');

    filePatterns.forEach(function(filePattern) {
		filePattern = filePattern.trim();

		glob(filePattern, options, function (er, files) {
			files.forEach(function(filepath) {

				fs.readFile(filepath, function(err, data) {
					if (err) {
						return;
					}

					var content = data.toString();

					exports.REMOVE_PATTERNS.forEach(function(removePattern) {
						content = content.replace(
							removePattern.match, removePattern.replace || '');
					});

					fs.writeFile(filepath, content, function() {
						log.success(filepath);
					});
				});

			});
		});
    });

};