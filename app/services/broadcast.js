/**
 * Created by Jairo Martinez on 1/16/15.
 */
var mdns = require('mdns');
var ad = {};

function createAdvertisement(cfg) {
	try {
		var txt_record = {
			name: obj.wayfinder.name,
			uuid: obj.wayfinder.uuid,
			type: 'WFD',
			desc: 'WayFinder',
			path: '/',
			ip:   obj.network.ip,
			port: 1337
		};

		ad = mdns.createAdvertisement(mdns.tcp('http'), txt_record.port, {name: 'WayFinder', host: 'Mac.Mini.Main', txtRecord: txt_record});
		ad.on('error', handleError);
		ad.start();
	} catch (ex) {
		handleError(ex);
	}
}

function handleError(error) {
	console.error(error);
	switch (error.errorCode) {
		case mdns.kDNSServiceErr_Unknown:
		default:
			console.warn(error);
			setTimeout(function () {
				createAdvertisement();
			}, 5000);
			break;
	}
}

module.exports.init = function () {
};

module.exports.run = function (obj) {
	createAdvertisement(obj);
};
