/**
 * Created by Jairo Martinez on 1/16/15.
 */
var mdns = require('mdns');
var os = require('os');
var EventEmitter = require('events').EventEmitter;
var errCnt = 0;

if (os.type() == 'Linux') {
	mdns.isAvahi = true;
}

console.log('Initializing MDNS Discover Service');
var discover = mdns.createBrowser(mdns.tcp('http'));

function run() {
	try {
		discover.start();
	} catch (err) {
		module.exports.emit('error', err);
	}
}

discover.on('serviceUp', function (service) {
	try {
		if (service.txtRecord && service.txtRecord.wyfd) {
			window.server = service;
			console.log(service);
			window.locating = false;
			module.exports.emit('server', service);
		}
	} catch (err) {
		console.log('MDNS serviceUp() Error');
		console.log(err);
	}
});

discover.on('serviceDown', function (service) {
	try {
		service.addresses = ['0.0.0.0'];
	} catch (err) {
		console.log('MDNS serviceDown() Error');
		console.log(err);
	}
});

discover.on('error', function (err) {
	errCnt++;

	if (errCnt >= 99) {
		errCnt = 1;
		discover.stop();
		setTimeout(function () {
			run();
		}, 2000)
	}

	module.exports.emit('error', err);
});

module.exports = new EventEmitter();

module.exports.init = function () {
};

module.exports.run = run;
