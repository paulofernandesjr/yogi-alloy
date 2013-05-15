#!/usr/bin/env node

var spawn = require('child_process').spawn,
    which = require('which').sync,
    argv = process.argv;

// removing 'node' and the name of the JavaScript file.
argv.splice(0, 2);
// adding 'alloy' to yogi arguments
argv.unshift('alloy');

spawn(which('yogi'), argv, {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit'
});
