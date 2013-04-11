#!/usr/bin/env node

var command = require('command'),
    which = require('which').sync,
    argv = process.argv;

// removing 'node' and the name of the JavaScript file.
argv.splice(0, 2);

command.open()
    .on('stdout', command.writeTo(process.stdout))
    .on('stderr', command.writeTo(process.stderr))
    .exec(which('yogi'), args);
