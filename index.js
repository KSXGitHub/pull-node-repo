
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

var pull = (onspawn, onskip) => {
	var createSpawner = (args, SpawnEvent) => (prev, resolve, reject) => {
		var childprc = spawn(...args);
		onspawn(new SpawnEvent(childprc));
		childprc.on('exit', (code, signal) => signal ? reject(signal) : resolve(new SpawnerResolveValue(childprc, code, prev)));
	};
	var steps = readdirSync(REPO_DIR).map((dirname) => {
		var currdir = `${REPO_DIR}/${dirname}`;
		if (!statSync(`${currdir}/.git`).isDirectory()) {
			onskip(currdir);
			return;
		}
		chdir(currdir);
		return {
			'checkout': createSpawner(CHECKOUT_ARGS, SpawnCheckoutEvent),
			'pull': createSpawner(PULL_ARGS, SpawnPullEvent),
			'__proto__': null
		};
	}).filter(Boolean);
	var flatten = steps.reduce((prev, res) => [...prev, res.checkout, res.pull], []);
	return ExtendedPromise.queue(ExtendedPromise.resolve(), ...flatten);
};

function SpawnEvent(childprc) {
	this.childprc = childprc;
}
SpawnEvent.prototype = {
	'type': null,
	'__proto__': null
};

class SpawnCheckoutEvent extends SpawnEvent {}
SpawnCheckoutEvent.prototype.type = 'checkout';

class SpawnPullEvent extends SpawnEvent {}
SpawnPullEvent.prototype.type = 'pull';

function SpawnerResolveValue(childprc, exitcode, previous) {
	return {
		'childprc': childprc,
		'exitcode': exitcode,
		'previous': previous,
		'__proto__': this
	};
}

var result = (onspawn, onskip) =>
	pull(_getfunc(onspawn, DONOTHING), _getfunc(onskip, DONOTHING));

Object.assign(result, {
	'SpawnEvent': SpawnEvent,
	'SpawnCheckoutEvent': SpawnCheckoutEvent,
	'SpawnPullEvent': SpawnPullEvent,
	'SpawnerResolveValue': SpawnerResolveValue,
	'__proto__': null
});

module.exports = result;
