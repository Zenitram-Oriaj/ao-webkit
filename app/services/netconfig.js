/**
 * Created by Jairo Martinez on 11/24/14.
 */

/**
 * -- /etc/network/interfaces --
 auto eth0
 iface eth0 inet static
 address 192.168.0.101
 gateway 192.168.0.1
 netmask 255.255.255.0
 dns-nameservers 8.8.8.8 8.8.4.4

 sudo service network-manager restart
 sudo service networking restart
 sudo service resolvconf restart

 -------------------------------------------

 -- /etc/environment --
 http_proxy="http://autoproxy.pg.com:8080/"
 https_proxy="http://autoproxy.pg.com:8080/"
 ftp_proxy="http://autoproxy.pg.com:8080/"
 no_proxy="localhost,127.0.0.1,.pg.com,localaddress,137.*,143.*"
 HTTP_PROXY="http://autoproxy.pg.com:8080/"
 HTTPS_PROXY="http://autoproxy.pg.com:8080/"
 FTP_PROXY="http://autoproxy.pg.com:8080/"
 NO_PROXY="localhost,127.0.0.1,.pg.com,localaddress,137.*,143.*"

 */

var os = require('os');
var fs = require('fs');

function readNetConfig(params, cb) {
	var ps = require('child_process');
	ps.exec('cat /etc/network/interfaces', function (error, stdout, stderr) {

		var lines = stdout.split("\n");

		lines.forEach(function (line) {
			if (line.indexOf('eth0 inet', 0)) {
				if (line.indexOf('static', 0)) {
					params.mode = 'M';
				} else {
					params.mode = 'A';
				}
				cb(params);
			}
		});
	});
}

function writeToFile(params, cb) {
	var data =
		'# This file describes the network interfaces available on your system\r' +
		'# and how to activate them. For more information, see interfaces(5).\r' +
		'\r\n' +
		'# The loopback network interface\r' +
		'auto lo\r' +
		'iface lo inet loopback\r' +
		'\r\n' +
		'# The primary network interface\r' +
		'auto eth0\r';

	switch (params.network.mode) {
		case 'M':
		{
			data += 'iface eth0 inet static\r' +
			'address ' + params.network.ip + '\r' +
			'gateway ' + params.network.gw + '\r' +
			'netmask ' + params.network.sub + '\r' +
			'dns-nameservers ' + params.network.dns + '\r';
			break;
		}
		case 'A':
		default:
		{
			data += 'iface eth0 inet dhcp\r';
			break;
		}
	}

	var result = fs.writeFileSync('netInfo.txt', data);
	cb(result);
}

function setNetConfig(cfg, cb) {
	if (os.type() == 'Linux') {
		writeToFile(cfg, function (rslt) {
			var ps = require('child_process');
			ps.exec('sudo sh /home/roomfinder/ao/shell/netconfig.sh', function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				cb(cfg);
			});
		});
	} else {
		cb(cfg);
	}

}

module.exports.setNetConfig = setNetConfig;

module.exports.updateConfig = function (cfg, cb) {
	var ifcfg = require('netroute').getInfo();
	var netif = os.networkInterfaces();

	if (netif.eth0) {
		netif.eth0.forEach(function (i) {
			if (i.family == 'IPv4') {
				cfg.network.ip = i.address;
				cfg.network.sub = i.netmask;
				cfg.network.mac = i.mac;
			}
		});
	}

	if (netif.en0) {
		netif.en0.forEach(function (i) {
			if (i.family == 'IPv4') {
				cfg.network.ip = i.address;
				cfg.network.sub = i.netmask;
				cfg.network.mac = i.mac;
			}
		});
	}

	if (netif.em1) {
		netif.em1.forEach(function (i) {
			if (i.family == 'IPv4') {
				cfg.network.ip = i.address;
				cfg.network.sub = i.netmask;
				cfg.network.mac = i.mac;
			}
		});
	}

	var ip = cfg.network.ip.split('.');

	//
	/////////////////////////////////////////////////


	ifcfg.IPv4.forEach(function (s) {
		var idx = s.interface.indexOf('ut');

		if(idx < 0) {
			if (s.gateway.indexOf(ip[0]) > -1) {
				cfg.network.gw = s.gateway;
			}
		}
	});

	var a = os.type();
	var b = os.arch();
	var c = os.release();

	cfg.wayfinder.type = a + ' ' + b + ' (' + c + ')';

	if (os.type() == 'Linux') {
		readNetConfig(cfg, function (rslt) {
			cfg = rslt;
			cb(null, cfg);
		});
	} else {
		cb(null, cfg);
	}
};