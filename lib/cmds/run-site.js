/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_ALLOY_PATH = __dirname + '/../../';

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var docpad = base.requireAlloy('lib/docpad');

// -- Command ------------------------------------------------------------------
exports.run = function(payload, parsed) {
	if (base.isRepo(base.ALLOY_WEBSITE)) {
		if (!file.exists('node_modules')) {
			docpad.install();
		} else {
			docpad.run();
		}
	}
};