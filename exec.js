#! /usr/bin/env node --es-staging

'use strict';

var process = require('process');

require('.')(onspawn, onskip)
	.onfulfill(() => console.log(`COMPLETED`))
	.onreject((reason) => console.error(`FAILED`, reason))
;

function onspawn(event) {
	console.log(event.type === 'checkout' ? `DIRECTORY "${event.dirname}"` : `PULLING`);
	mkio(event.childprc);
}

function onskip(dirname) {
	console.error(`SKIPPED "${dirname}"`);
}

function mkio(childprc) {
	['stdout', 'stderr']
		.forEach((stream) => childprc[stream].on('data', (chunk) => process[stream].write(chunk)));
}
