/**
 * Created by Jairo Martinez on 1/16/15.
 */
var app = angular.module('app', []);

app.service('data', function ($http) {
	this.register = function (server, wd) {
		return $http.post('http://' + server.ip + ':' + server.port + '/register', wd);
	};

	this.testUrl = function (url) {
		return $http.get(url);
	};
});

app.controller('AppCtrl', function ($scope, $window, $sce, $timeout, data) {

	$scope.trustSrc = function (src) {
		return $sce.trustAsResourceUrl(src);
	};

	$timeout(function () {
		data.register($scope.ao.server,$scope.ao).then(
			function(res){
				var dat = res.data;

				var a = $scope.ao.server.ip;
				var b = $scope.ao.server.port;
				var c = $scope.ao.wayfinder.locationId;
				var d = $scope.ao.wayfinder.floorId;
				var url = 'http://' + a + ':' + b +  '/?locationId=' + c + '&floorId=' + d;

				$scope.url = {src: url, title: "WayFinder"};
				$window.location.href = url;
			},
			function(err){

			}
		);
	}, 1000);
});

app.run(function ($rootScope, $window, browser) {
	var fs = require('fs');
	$rootScope.ao = {};

	try {
		$rootScope.ao = JSON.parse(fs.readFileSync("app/config.json"));
	}
	catch (err) {
		$rootScope.ao = JSON.parse(fs.readFileSync("app/default.json"));
	}

	console.info($rootScope.ao);

	// process.env.http_proxy = '';
	// process.env.https_proxy = '';

	var gui = require('nw.gui');
	var mac = require('getmac');
	var os = require('os');

	var tray = new gui.Tray({
		icon: 'img/red-elephant-16x16.png'
	});

	gui.Window.get().show();

	console.log('Starting Node Services');

	$window.locating = true;

	$rootScope.ao.node.version = process.versions.node;
	$rootScope.ao.node.v8 = process.versions.v8;
	$rootScope.ao.node.arch = process.arch;
	$rootScope.ao.node.pid = process.pid;

	$rootScope.ao.screen = browser.screen();
	$rootScope.ao.os = browser.os();
	$rootScope.ao.browser = browser.detect();

	if (process.getuid) {
		$rootScope.ao.node.uid = process.getuid();
	}

	mac.getMac(function (err, addr) {
		if (err) {
			console.error(err);
		} else {
			var uuid = '';
			var t = addr.split(':');
			for (var i = 0; i < t.length; i++) {
				uuid += t[i].toUpperCase();
			}

			$rootScope.ao.wayfinder.uuid = uuid;
			$rootScope.ao.wayfinder.name = 'WFD' + uuid;
			$rootScope.ao.updatedAt = new Date();

			var j = JSON.stringify($rootScope.ao, null, 2);
			fs.writeFile('app/config.json', j, function (err) {
				if (err) {
					console.error(err);
				}
			});
		}
	});
});