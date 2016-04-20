
'use strict';

var chdir = require('process').chdir;
var fs = require('fs');
var child_process = require('child_process');
class ChildProcessArray extends require('./child-process-array.js') {}

var freeze = Object.freeze;
var readdirSync = fs.readdirSync;
var statSync = fs.statSync;
var spawn = child_process.spawn;

const REPO_DIR = 'D:/JS_FILES/NodeJS/node_modules';
const CHECKOUT_ARGS = freeze('git', freeze(['checkout', 'origin', 'master']));
const PULL_ARGS = freeze('git', freeze(['pull', 'origin', 'master']));

var pull = () => {
	var chprcs = new ChildProcessArray();
	for (let dir of readdirSync(REPO_DIR)) {
		let currentpath = `${REPO_DIR}/${dir}`;
		if (!statSync(currentpath).isDirectory()) {
			continue;
		}
		if (!statSync(`${currentpath}/.git`).isDirectory()) {
			continue;
		}
		chdir(currentpath);
		chprcs.push(spawn(...PULL_ARGS));
	}
	return chprcs;
};

module.exports = () => pull();
