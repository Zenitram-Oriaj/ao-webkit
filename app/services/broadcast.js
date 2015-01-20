/**
 * Created by Jairo Martinez on 1/16/15.
 */
var mdns = require('mdns');
var ad = {};

var txt_record = {
	desc: 'Way Finder Display Service',
	path: '/',
	port: 80,
	name: '',
	uuid: '',
	ips:  ''
};

function createAdvertisement(name, uuid, ips) {
	try {
		txt_record.name = name;
		txt_record.uuid = uuid;
		txt_record.ips = ips.toString();
		ad = mdns.createAdvertisement(mdns.tcp('http'), txt_record.port, {txtRecord: txt_record});
		ad.start();
		ad.on('error', handleError);
	} catch (ex) {
		handleError(ex);
	}
}

function handleError(error) {
	console.log(error);
	switch (error.errorCode) {
		case mdns.kDNSServiceErr_Unknown:
		default:
			console.warn(error);
			break;
	}
}

module.exports.init = function () {
};

module.exports.run = function (name, uuid, ips) {
	createAdvertisement(name, uuid, ips);
};