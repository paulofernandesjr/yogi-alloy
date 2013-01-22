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
var optimist = require('optimist'),
    argv = optimist.usage('Usage: yogi alloy -[hcnw]', base.OPTIONS).argv,
    file = base.requireAlloy('lib/file'),
    log = require("cli-log").init({ prefix: 'yogi' });

// -- CLI ----------------------------------------------------------------------
if (!YOGI_PATH) {
    console.log('This should be executed from yogi');
    process.exit(1);
}

var options = Object.keys(argv);

if (argv.help || options.length < 4) {
    optimist.showHelp();
    process.exit(0);
}

options.forEach(function(option) {
    if (base.isOption(option)) {
        var payload = argv[option],
            filepath = YOGI_ALLOY_PATH + '/lib/cmds/' + option + '.js';

        if (file.exists(filepath)) {
            require(filepath).run(payload, argv);
        }
    }
    else if (!base.isReservedArg(option)) {
        log.oops(option + ' is not recognized as a valid option');
    }
});