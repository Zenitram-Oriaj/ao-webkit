/**
 * Created by Jairo Martinez on 1/16/15.
 */
var fs = require('fs');
var app = angular.module('app', []);

app.service('data', function ($http) {
	this.register = function (server, wd) {
		return $http.post('http://' + server.ip + ':' + server.port + '/register', wd);
	};

	this.testUrl = function (url) {
		return $http.get(url);
	};
});

app.controller('AppCtrl', function ($scope, $window, $sce, $timeout, data, browser) {
	function parseUrl(url, cb) {

		if (url.indexOf('http://') > -1) {

		} else {
			url = 'http://' + url;
		}

		var parser = new URL(url);

		$scope.ao.server.ip = parser.hostname;
		$scope.ao.server.port = parseInt(parser.port, 10);

		var tmp = parser.search;

		if (tmp.length > 1) {
			var a = browser.params(url);
			if (a.locationId) $scope.ao.locationId = a.locationId;
			if (a.floorId) $scope.ao.floorId = a.floorId;
		}

		var j = JSON.stringify($scope.ao, null, 2);
		fs.writeFile('app/config.json', j, function (err) {
			if (err) {
				console.error(err);
				cb(err, null);
			} else {
				cb(null, 'OK');
			}
		});
	}

	$scope.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src);
	};

	$timeout(function () {
		data.register($scope.ao.server, $scope.ao).then(
			function (res) {
				var dat = res.data;

				console.log(dat);

				$scope.url = {src: $scope.ao.url, title: "WayFinder"};
				$window.location.href = $scope.ao.url;
			},
			function (err) {

			}
		);
	}, 1000);

	$scope.connect = function () {
		$scope.url = {src: $scope.ao.url, title: "WayFinder"};

		data.testUrl($scope.ao.url).then(
			function (res) {
				parseUrl($scope.ao.url, function (err, res) {
					if (err) {
						$window.alert('Failed To Parse The Provided URL');
					} else {
						console.info(res);
						$window.location.href = $scope.ao.url;
					}
				});
			},
			function (err) {
				$window.alert('Failed To Connect To The Provided URL');
			});

	}
});

app.run(function ($rootScope, $window, browser) {
	$rootScope.ao = {};

	try {
		$rootScope.ao = JSON.parse(fs.readFileSync("app/config.json"));
	}
	catch (err) {
		$rootScope.ao = JSON.parse(fs.readFileSync("app/default.json"));
	}

	// process.env.http_proxy = '';
	// process.env.https_proxy = '';

	var gui = require('nw.gui');
	var mac = require('getmac');
	var os = require('os');
	var net = require('./services/netconfig');

	var tray = new gui.Tray({
		icon: 'img/red-elephant-16x16.png'
	});

	gui.Window.get().show();

	console.log('Starting Node Services');

	$window.locating = true;
	$rootScope.ao.url = "http://";

	$rootScope.ao.node.version = process.versions.node;
	$rootScope.ao.node.v8 = process.versions.v8;
	$rootScope.ao.node.arch = process.arch;
	$rootScope.ao.node.pid = process.pid;

	if (process.getuid) {
		$rootScope.ao.node.uid = process.getuid();
	}

	$rootScope.ao.network = net.init();

	if($rootScope.ao.network && $rootScope.ao.network.ip.indexOf('155.') > -1){
		process.env.http_proxy = 'http://zeuproxy.eu.pg.com:9400';
		process.env.https_proxy = 'http://zeuproxy.eu.pg.com:9400';
		process.env.no_proxy= 'localaddress,127.0.0.1,155.123.247.140,155.123.247.139';
	}

	if(os.type() == 'Linux'){
		console.info(os.networkInterfaces());
	}

	mac.getMac(function (err, addr) {
		if (err) {
			console.error(err);
		} else {

			$rootScope.ao.network.mac = addr;

			var uuid = '';
			var t = addr.split(':');
			for (var i = 0; i < t.length; i++) {
				uuid += t[i].toUpperCase();
			}

			$rootScope.ao.os = browser.os();

			$rootScope.ao.uuid = uuid;
			$rootScope.ao.name = 'WFD' + uuid;
			$rootScope.ao.updatedAt = new Date();

			if ($rootScope.ao.server.ip != '') {
				$rootScope.ao.url += $rootScope.ao.server.ip;

				if ($rootScope.ao.server.port) {
					$rootScope.ao.url += ':';
					$rootScope.ao.url += $rootScope.ao.server.port;
				}

				if ($rootScope.ao.locationId != '' && $rootScope.ao.floorId != '') {
					$rootScope.ao.url += '/?locationId=';
					$rootScope.ao.url += $rootScope.ao.locationId;
					$rootScope.ao.url += '&floorId=';
					$rootScope.ao.url += $rootScope.ao.floorId;
				}
			}

			var j = JSON.stringify($rootScope.ao, null, 2);
			fs.writeFile('app/config.json', j, function (err) {
				if (err) {
					console.error(err);
				}
			});
		}
	});
});