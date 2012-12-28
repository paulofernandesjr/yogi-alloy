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

var base = require(YOGI_ALLOY_PATH + '/lib/base');

// -- Requires -----------------------------------------------------------------
var argv = require('optimist').argv,
    file = base.requireAlloy('lib/file'),
    log = base.requireYogi('lib/log'),
    util = base.requireYogi('lib/util');

// -- CLI ----------------------------------------------------------------------
if (!YOGI_PATH) {
    console.log('This should be executed from yogi');
    process.exit(1);
}

Object.keys(argv).forEach(function(action) {
    if (!base.isReservedArg(action)) {
        var payload = argv[action],
            filepath = YOGI_ALLOY_PATH + '/lib/cmds/' + action + '.js';

        if (file.exists(filepath)) {
            require(filepath).run(payload, argv);
        }
        else {
            log.bail(util.bad + ' Ops, ' + action + ' is not recognized as a valid action');
        }
    }
});