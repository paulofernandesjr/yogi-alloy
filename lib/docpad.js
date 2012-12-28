/*
* Copyright (c) 2012, Liferay Inc. All rights reserved.
* Code licensed under the BSD License:
* https://github.com/liferay/alloy-ui/blob/master/LICENSE.txt
*
* @author Zeno Rocha <zeno.rocha@liferay.com>
*/

// -- Yogi Alloy Header --------------------------------------------------------
var YOGI_PATH = process.env.YOGI_PATH,
    YOGI_ALLOY_PATH = __dirname + '/../';

var path = require('path');

function requireAlloy(p) {
    return require(path.join(YOGI_ALLOY_PATH, p));
}

function requireYogi(p) {
    return require(path.join(YOGI_PATH, p));
}

// -- Requires -----------------------------------------------------------------
var log = requireYogi('lib/log'),
    spawn = require('child_process').spawn;

// -- Docpad ------------------------------------------------------------------
exports.install = function() {

  var docpadInstall = spawn('docpad', ['install', '.']);

  docpadInstall.stdout.on('data', function (data) {
    log.info(data);
  });

  docpadInstall.on('exit', function (code) {
    if (code == 0) {
      exports.run();
    }
  });

};

exports.run = function() {

  var docpadRun = spawn('docpad', ['run', '.']);

  docpadRun.stdout.on('data', function (data) {
      log.info(data);
  });

};