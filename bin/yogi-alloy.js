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

var base = require(YOGI_ALLOY_PATH + '/lib/base'),
    helpCmd = require(YOGI_ALLOY_PATH + '/lib/cmds/help');

// -- CLI ----------------------------------------------------------------------
if (!YOGI_PATH) {
    console.log('This should be executed from yogi');
    process.exit(1);
}

var file = base.requireAlloy('lib/file'),
    log = require("cli-log").init({ prefix: 'yogi', prefixColor: 'magenta' }),
    nopt = require('nopt'),
    parsed = nopt(process.argv),
    remain = parsed.argv.remain;

if (!remain.length) {
    helpCmd.run();
    process.exit(0);
}

var command = remain[0],
    filepath = YOGI_ALLOY_PATH + 'lib/cmds/' + command + '.js';

if (file.exists(filepath)) {
    var instance = require(filepath),
        metadata = instance.COMMAND,
        options = nopt(metadata.options, metadata.shorthands, process.argv, 2);

    instance.run(options);
}
else {
    log.oops('[' + command + '] command not found');
}