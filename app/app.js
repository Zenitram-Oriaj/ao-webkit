/**
 * Created by Jairo Martinez on 1/16/15.
 */
var app = angular.module('app', []);

app.service('wyfdSvc', function ($http) {

	this.register = function (server) {
		return $http.get('http://' + server.ip + ':' + server.port + '/register');
	};

	this.testUrl = function(url){
		return $http.get(url);
	};
});

app.controller('NwCtrl', function ($scope, $window, $sce, $interval, $timeout, wyfdSvc) {
	$scope.wyfd = {
		ip:         '',
		port:       0,
		floorId:    '',
		locationId: ''
	};
	$scope.url = {};
	$scope.urlString = 'http://';
	$scope.infoText = false;
	$scope.ready = false;
	$scope.manual = false;

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.parseIp = function (obj) {
		$scope.wyfd.port = parseInt(obj.txtRecord.wyfd, 10);
		if (obj.addresses && obj.addresses.length > 0) {
			obj.addresses.forEach(function (o) {
				var i = o.indexOf('.');
				if (i > -1) {
					$scope.wyfd.ip = o;
				}
			});
		} else {
			console.log('No IP Found');
		}
	};

	$scope.init = function () {
		$scope.parseIp($window.wyfd);

		wyfdSvc.register($scope.wyfd).then(
			function (res) {
				$scope.infoText = true;
				$scope.ready = true;
				$scope.wyfd.floorId = res.data.floorId;
				$scope.wyfd.locationId = res.data.locationId;

				var t = "http://" + $scope.wyfd.ip + ':' + $scope.wyfd.port + '/?floorId=' + $scope.wyfd.floorId + '&locationId=' + $scope.wyfd.locationId;

				wyfdSvc.testUrl(t).then(
					function(res){
						if(res.status == 200){}

						$timeout(function(){
							$scope.url = {src: t, title:"WayFinder"};
							$scope.found = true;
						},2000);
					},
					function(err){
						console.log(err);
				});


			},
			function (err) {
				console.log(err);
			});
	};

	$scope.manualAddr = function(){
		wyfdSvc.testUrl($scope.urlString).then(
			function(res){
				if(res.status == 200){}

				$timeout(function(){
					$scope.url = {src: t, title:"WayFinder"};
					$scope.found = true;
				},2000);
			},
			function(err){
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

		if(cnt > 20){
			$scope.infoText = true;
			$scope.manual = true;
			$interval.cancel(chck);
		}
	}, 500);
});

app.run(function () {
	var broadcast = require('./services/broadcast');
	var discover = require('./services/discover');
	var gui = require('nw.gui');
	var mac = require('getmac');
	var os = require('os');

	var ifaces = os.networkInterfaces();
	var ips = [];

	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;

		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				return;
			}

			if (alias >= 1) {
				console.log(ifname + ':' + alias, iface.address);
				ips.push(iface.address);
			} else {
				console.log(ifname, iface.address);
				ips.push(iface.address);
			}
		});
	});


	var tray = new gui.Tray({
		icon: 'img/red-elephant-16x16.png'
	});
	gui.Window.get().show();

	console.log('Initializing Node Services');

	function init(){
		console.log('Starting Node Services');
		global.window.wyfd = {};
		global.window.locating = true;
		global.window.uuid = '';
		global.window.name = 'WFD000000000000';
		global.window.ips = ips;

		mac.getMac(function(err,addr){
			if(err){

			}	else {
				var uuid = '';
				var t = addr.split(':');
				for(var i = 0; i < t.length; i++){
					uuid += t[i].toUpperCase();
				}
				global.window.uuid = uuid;
				global.window.name = 'WFD' + uuid;
				broadcast.run(global.window.name, global.window.uuid, global.window.ips);
			}
		});

		discover.run();
	}

	discover.on('error', function(err){
		console.log(err);
	});

 init();
});