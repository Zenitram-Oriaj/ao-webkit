/**
 * Created by Jairo Martinez on 1/16/15.
 */
var app = angular.module('app', []);

app.service('wyfdSvc', function ($http) {

	this.register = function (server, wd) {
		return $http.post('http://' + server.ip + ':' + server.port + '/register', wd);
	};

	this.testUrl = function (url) {
		return $http.get(url);
	};

	this.heartBeat = function (server, wd) {
		return $http.post('http://' + server.ip + ':' + server.port + '/heartbeat', wd);
	};
});

app.controller('NwCtrl', function ($scope, $window, $sce, $interval, $timeout, wyfdSvc) {
	$scope.url = {};
	$scope.urlString = 'http://';
	$scope.infoText = false;
	$scope.ready = false;
	$scope.manual = false;

	$scope.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.parseIp = function (obj) {
		$scope.ao.server.port = parseInt(obj.txtRecord.wyfd, 10);
		if (obj.addresses && obj.addresses.length > 0) {
			obj.addresses.forEach(function (o) {
				var i = o.indexOf('.');
				if (i > -1) {
					$scope.ao.server.ip = o;
				}
			});
		} else {
			console.log('No IP Found');
		}
	};

	$scope.init = function () {
		$scope.parseIp($window.server);

		wyfdSvc.register($scope.ao.server, $scope.ao).then(
			function (res) {
				$scope.infoText = true;
				$scope.ready = true;

				var t = "http://" + $scope.ao.server.ip + ':' + $scope.ao.server.port + '/?floorId=' + $scope.ao.wayfinder.floorId + '&locationId=' + $scope.ao.wayfinder.locationId;

				wyfdSvc.testUrl(t).then(
					function (res) {
						if (res.status == 200) {
						}

						$timeout(function () {
							$scope.url = {src: t, title: "WayFinder"};
							$scope.found = true;
						}, 2000);
					},
					function (err) {
						console.log(err);
					});

			},
			function (err) {
				console.log(err);
			});
	};

	$scope.manualAddr = function () {
		wyfdSvc.testUrl($scope.urlString).then(
			function (res) {
				if (res.status == 200) {
				}

				$timeout(function () {
					//$scope.url = {src: t, title: "WayFinder"};
					$scope.found = true;
				}, 2000);
			},
			function (err) {
				console.log(err);
			});
	};

	var cnt = 0;
	var chck = $interval(function () {
		cnt++;
		if (!$window.locating) {
			$scope.init();
			$interval.cancel(chck);
		}

		if (cnt > 20) {
			$scope.infoText = true;
			$scope.manual = true;
			$interval.cancel(chck);
		}
	}, 500);
});

app.run(function ($window, $rootScope) {
	var fs = require('fs');
	$rootScope.ao = JSON.parse(fs.readFileSync("./app/config.json"));

	var gui = require('nw.gui');
	var mac = require('getmac');
	var os = require('os');
	//var broadcast = require('./services/broadcast');
	//var discover = require('./services/discover');
	//var netCfg = require('./services/netconfig');

	var tray = new gui.Tray({
		icon: 'img/red-elephant-16x16.png'
	});

	gui.Window.get().show();

	console.log('Initializing Node Services');

	function init() {
		console.log('Starting Node Services');

		$window.locating = true;

		$rootScope.ao.node.version = process.versions.node;
		$rootScope.ao.node.v8 = process.versions.v8;
		$rootScope.ao.node.arch = process.arch;
		$rootScope.ao.node.pid = process.pid;

		if (process.getuid) {
			$rootScope.ao.node.uid = process.getuid();
		}

		mac.getMac(function (err, addr) {
			if (err) {

			} else {
				var uuid = '';
				var t = addr.split(':');
				for (var i = 0; i < t.length; i++) {
					uuid += t[i].toUpperCase();
				}
				$rootScope.ao.wayfinder.uuid = uuid;
				$rootScope.ao.wayfinder.name = 'WFD' + uuid;
				/*
				netCfg.updateConfig($rootScope.ao, function(err,res){
					var dt = new Date();
					$rootScope.ao.updatedAt = dt.toISOString();
					var j = JSON.stringify($rootScope.ao, null, 2);
					fs.writeFile('./app/config.json', j, function (err) {
						if (err) {
							console.log(err);
						} else {

						}
					});
				});
				*/
			}
		});

		//discover.run();
	}

	/*
	discover.on('error', function (err) {
		console.log(err);
	});
	*/
	init();
});