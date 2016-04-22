#! /usr/bin/env node --es-staging

'use strict';

var process = require('process');

const _x35 = '_'.repeat(35);

require('.')(onspawn, onskip)
	.onfulfill(() => mkhr('log', `COMPLETED`))
	.onreject((reason) => mkhr('error', `FAILED`, reason))
;

function onspawn(event) {
	mkhr('log', event.type === 'checkout' ? `DIRECTORY "${event.dirname}"` : `PULLING`);
	mkio(event.childprc);
}

function onskip(dirname) {
	mkhr('error', `SKIPPED "${dirname}"`);
}

function mkio(childprc) {
	['stdout', 'stderr']
		.forEach((stream) => childprc[stream].on('data', (chunk) => process[stream].write(chunk)));
}

function mkhr(mtd, ...message) {
	console[mtd](_x35);
	console[mtd](...message);
}
