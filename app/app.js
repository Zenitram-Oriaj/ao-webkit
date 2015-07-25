/**
 * Created by Jairo Martinez on 1/16/15.
 */

var fs = require('fs');
var app = angular.module('app', []);
var gui = require('nw.gui');
var mac = require('getmac');
var os = require('os');
var net = require('./services/netconfig');

app.service('data', function ($http, $sce) {
	this.register = function (server, wd) {
		return $http.post('http://' + server.ip + ':' + server.port + '/api/register', wd);
	};

	this.testUrl = function (url) {
		return $http.get(url);
	};

	this.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src);
	};

	this.parseUrl = function (ao, cb) {
		var url = ao.url;
		try {
			if (url.indexOf('http://') > -1) {

			} else {
				url = 'http://' + url;
			}

			var parser = new URL(url);

			ao.server.ip = parser.hostname;
			ao.server.port = parseInt(parser.port, 10);

			var tmp = parser.search;

			if (tmp.length > 1) {
				var a = browser.params(url);
				if (a.locationId) ao.locationId = a.locationId;
				if (a.floorId) ao.floorId = a.floorId;
			}

			cb(null, ao);
		}
		catch (e) {
			cb(e, ao);
		}
	}
});

app.controller('AppCtrl', function ($scope, $window, data) {

	$scope.connect = function () {
		$scope.url = {src: $scope.ao.url, title: "WayFinder"};

		data.testUrl($scope.ao.url).then(
			function (tmp) {
				data.trustSrc($scope.ao.url);
				data.parseUrl($scope.ao, function (err, res) {
					if (err) {
						$window.alert('Failed To Parse The Provided URL');
					} else {

						$scope.ao = res;
						var j = JSON.stringify(res, null, 2);
						fs.writeFileSync('app/config.json', j);

						console.info(res);
						data.register($scope.ao.server, $scope.ao).then(
							function (res) {
								var dat = res.data;

								console.log(dat);

								$window.location.href = $scope.ao.url;
							},
							function (err) {
								console.error(err);
								$window.alert('Failed To Register :: ' + err.statusText);
							}
						);
					}
				});
			},
			function (err) {
				$window.alert('Failed To Connect To The Provided URL :: ' + err.statusText);
			});
	}
});

app.run(function ($rootScope, $window, browser, data) {
	$rootScope.ao = {};

	try {
		$rootScope.ao = JSON.parse(fs.readFileSync("app/config.json"));
	}
	catch (err) {
		$rootScope.ao = JSON.parse(fs.readFileSync("app/default.json"));
	}

	var tray = new gui.Tray({
		icon: 'img/red-elephant-16x16.png'
	});

	gui.Window.get().show();

	$rootScope.gui = gui;

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

	if (os.type() == 'Linux') {
		console.info(os.networkInterfaces());
	}

	mac.getMac(function (err, addr) {
		if (err) {
			console.error(err);
		} else {

			$rootScope.ao.network.mac = addr;

			var uuid = '';
			var t = [];
			if (addr.indexOf(':') > -1) {
				t = addr.split(':');
			}
			else if (addr.indexOf('-') > -1) {
				t = addr.split('-');
			}

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
			fs.writeFileSync('app/config.json', j);

			if ($rootScope.ao.url && $rootScope.ao.url.length > 10) {

				$rootScope.url = {src: $rootScope.ao.url, title: "WayFinder"};
				data.trustSrc($rootScope.ao.url);

				data.register($rootScope.ao.server, $rootScope.ao).then(
					function (res) {
						$window.location.href = $rootScope.ao.url;
					},
					function (err) {
						console.error(err);
						$window.alert('Failed To Register :: ' + err.statusText);
					}
				);
			}
		}
	});
});