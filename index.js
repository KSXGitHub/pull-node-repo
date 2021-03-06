
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

const REPO_DIR = 'C:/programming/javascript/npm-packages';
const CHECKOUT_ARGS = freeze(['git', freeze(['checkout', 'master'])]);
const PULL_ARGS = freeze(['git', freeze(['pull', 'origin', 'master'])]);
const DONOTHING = () => {};
const THROW = (error) => {throw error};

var pull = (onspawn, onskip, onerror) => {
	var createSpawner = (args, dirname, SpawnEvent) => (prev, resolve, reject) => {
		try {
			var childprc = spawn(...args, {'cwd': dirname});
			onspawn(new SpawnEvent(childprc, dirname));
			childprc.on('exit', (code, signal) => signal ? reject(signal) : resolve(new SpawnerResolveValue(childprc, code, prev)));
		} catch (error) {
			onerror(error);
		}
	};
	var fnlist = readdirSync(REPO_DIR)
		.map((dirname) => `${REPO_DIR}/${dirname}`)
		.filter((dirname) => statSync(`${dirname}/.git`).isDirectory() || void onskip(dirname))
		.map((dirname) => [
			createSpawner(CHECKOUT_ARGS, dirname, SpawnCheckoutEvent),
			createSpawner(PULL_ARGS, dirname, SpawnPullEvent)
		])
		.reduce((prev, res) => [...prev, ...res], [])
	;
	return ExtendedPromise.queue(ExtendedPromise.resolve(), ...fnlist);
};

function SpawnEvent(childprc, dirname) {
	return {
		'childprc': childprc,
		'dirname': dirname,
		'__proto__': this
	};
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

var result = (onspawn, onskip, onerror) =>
	pull(_getfunc(onspawn, DONOTHING), _getfunc(onskip, DONOTHING), _getfunc(onerror, THROW));

Object.assign(result, {
	'SpawnEvent': SpawnEvent,
	'SpawnCheckoutEvent': SpawnCheckoutEvent,
	'SpawnPullEvent': SpawnPullEvent,
	'SpawnerResolveValue': SpawnerResolveValue,
	'__proto__': null
});

module.exports = result;
