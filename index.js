
'use strict';

var readdirSync = require('fs').readdirSync;
var spawn = require('child_process').spawn;
class ChildProcessArray extends require('./child-process-array.js') {}

const REPO_DIR = 'D:/JS_FILES/NodeJS/node_modules';

var pull = (callback) => {
	var chprcs = new ChildProcessArray();
	for (let dir of readdirSync(REPO_DIR)) {
		// let childprc = spawn(
	}
};

module.exports = pull;
