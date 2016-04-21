
'use strict';

var chdir = require('process').chdir;
var fs = require('fs');
var child_process = require('child_process');
var ExtendedPromise = require('extended-promise');

var freeze = Object.freeze;
var readdirSync = fs.readdirSync;
var statSync = fs.statSync;
var spawn = child_process.spawn;

var _getfunc = (fn, ...fnlist) =>
	typeof fn === 'function' ? fn : _getfunc(...fnlist);

const REPO_DIR = 'D:/JS_FILES/NodeJS/node_modules';
const CHECKOUT_ARGS = freeze('git', freeze(['checkout', 'origin', 'master']));
const PULL_ARGS = freeze('git', freeze(['pull', 'origin', 'master']));
const DONOTHING = () => {};

var pull = (onspawn) => {
	var steps = readdirSync(REPO_DIR).map((dirname) => {
		var currdir = `${REPO_DIR}/${dirname}`;
		chdir(dirname);
		return {
			checkout(resolve, reject) {
				var childprc = spawn(...CHECKOUT_ARGS);
				onspawn(childprc);
				childprc.on('exit', (code, signal) => signal ? reject(signal) : resolve({childprc: childprc, code: code}));
			},
			pull() {},
			__proto__: null
		};
	});
};

module.exports = (onspawn) => pull(_getfunc(onspawn, DONOTHING));
