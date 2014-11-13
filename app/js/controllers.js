/**
 * Created by digimenet on 7/8/14.
 *
 *  APPID (API key) :: 86762b93eb8d0fbf5267e2f43bfd0134
 *  las vegas id 5506956
 *  cincinnati id: 4508722
 *  newport id: 4302529
 *
 *  Yahoo Weather: http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location%3D%2289123%22&format=json

 */

app.controller('AppController', function ($scope, $window, Fullscreen, configService) {
	$scope.sidebar = false;
	$scope.display = {name: 'Way Finder Display'};

	$scope.gbsLogo = ($window.innerWidth < 500) ? 250 : 600;

	$scope.enableFullscreen = function(){
		if (Fullscreen.isEnabled()) Fullscreen.cancel();
		else Fullscreen.all();
	};

	configService.getData().then(
		function (res) {
			$scope.server = res.data.server;
			$scope.port = res.data.port;
			$scope.dsplyId = res.data.dsplyId;
		},
		function (res) {
			console.log('ERR :: ' + res.data);
		});

	$scope.hideSidebar = function () {
		$scope.sidebar = false;
	};

	$scope.toggleSidebar = function () {
		$scope.sidebar = !$scope.sidebar;
	}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
// These are children controllers of 'AppController'

app.controller('WorkspaceController', function ($scope, $window, d3Service, workspaceService, parseXML) {
	$scope.FlrWorkSpace = [];
	var occupied = "#EE0000";
	var available = "#00CC00";

	var updateStatus = function (cts) {
		for (var p in cts) {
			for (var i in $scope.FlrWorkSpace) {
				if ($scope.FlrWorkSpace[i].attr('id') == cts[p].id.toString()) {
					$scope.FlrWorkSpace[i].attr("fill", function () {
						return (cts[p].state == 1) ? occupied : available;
					});
				}
			}
		}
	};

	d3Service.d3().then(function (d3) {
		var layerNames = ["zones", "guides", "areas", "workspaces", "floorplan", "furniture", "text"]; // BOI OFFICE

		d3.xml("floorplan/" + layerNames[0] + ".svg", "image/svg+xml", function (xml) {
			parseXML.parseData(xml.documentElement, function (d) {

				var vBxWidth = Math.ceil(d._width);
				var vBxHeight = Math.ceil(d._height);
				var ratio = 1.78;

				var startX = d._x;
				var startY = d._y;
				var width = $("#floorplan-container").width();
				var height = Math.ceil(width / ratio);

				if (height < 100) height = vBxHeight;

				console.log('Width = ' + width + ' :: Height = ' + height + ' :: Ratio = ' + ratio);

				var svg = d3.select("#floorplan-container")
					.append("svg")
					.attr("viewBox", startX.toString() + " " + startY.toString() + " " + vBxWidth.toString() + " " + vBxHeight.toString())
					.attr("width", width)
					.attr("height", height);

				var insertLayer = function (svg, layerName) {
					var layer = svg.append("g").attr("id", layerName);

					if (layerName != "workspaces") {
						// static layers
						d3.xml("floorplan/" + layerName + ".svg", "image/svg+xml", function (xl) {
							$("g#" + layerName).append(xl.documentElement);
						});

					} else {
						d3.xml("floorplan/" + layerName + ".svg", "image/svg+xml", function (xm) {
							if(xm !== null) {
								parseXML.parseData(xm.documentElement, function (j) {
									for (var n in j.g.path) {
										var ws = {};
										ws.id = j.g.path[n]._id;
										ws.state = 0;
										ws.fill = j.g.path[n]._fill;
									}
									console.log(j);
								});
							}
						});
						// workspace overlays

						workspaceService.collect().then(
							function (res) {
								var workspaces = res.data;
								for (var i = workspaces.length - 1; i >= 0; i--) {

									var wsInfo = workspaces[i];
									var wsSVG = {};

									switch (wsInfo.svgType) {
										case 'rect':
											break;
										case 'polygon':
											wsSVG = layer.append("polygon")
												.attr("points", wsInfo.points);
											break;
										case 'path':
											wsSVG = layer.append("path")
												.attr("d", wsInfo.points);
											break;
										default:
											break;
									}

									wsSVG
										.attr("id", wsInfo.id)
										.attr("fill", function (d) {
											return (wsInfo.status == 0) ? available : occupied;
										});

									$scope.FlrWorkSpace.push(wsSVG);
								}
							},
							function (err) {
								console.log(err);
							});
					}
				};

				layerNames.forEach(function (layerName) {
					insertLayer(svg, layerName);
				});

				$window.onresize = function () {
					var w = $("#floorplan-container").width();
					var h = Math.ceil(width / ratio);

					svg.attr("width", w);
					svg.attr("height", h);
					$scope.$apply();
				};
			});

			setInterval(function () {
				var p = workspaceService.getWsStatus();

				p.then(
					function (res) {
						updateStatus(res.data);
					},
					function (err) {

					});
			}, 5000);
		});
	});
});

app.controller('ScheduleController', function ($scope, $modal, schedule, timelineSvc) {
	$scope.schedules = [];
	$scope.predicate = 'startTime';

	$scope.getData = function () {

		var p = schedule.collect();

		p.then(
			function (res) {
				$scope.ws = res.data;

				$scope.ws.forEach(function (w) {
					w.reservations.forEach(function (r) {

						var dt = new Date();
						var n = (dt.getTimezoneOffset() / 60 );

						// Fix Hours Based On TimeZone Offset
						r.startTime = new Date(r.startTime);
						r.stopTime = new Date(r.stopTime);

						r.startTime.setHours(r.startTime.getHours() + n);
						r.stopTime.setHours(r.stopTime.getHours() + n);

						// Determine if this meeting is today and if it is currently active, then make row green
						if (dt.getDate() == r.startTime.getDate()) {
							r.show = true;

							if (dt >= r.startTime && dt <= r.stopTime) r.status = 'success';
						}

						// Determine if the reservation has a host
						r.host = (r.createdForName.length > 0 ? r.createdForName : r.createdByName);

						// If the meeting is in the past, hide it.
						r.hide = (dt > r.stopTime);

					})
				});

				timelineSvc.build($scope.ws);
			},
			function (res) {
				console.log('ERROR :: CAN NOT GET DATA FROM SERVER :: ' + res.data);
			});
	};

	$scope.details = function (res) {
		var modalInstance = $modal.open({
			templateUrl: 'partials/reservationDetail.html',
			controller:  'modalReservationController',
			size:        'lg',
			resolve:     {
				reservation: function () {
					return res;
				}
			}
		});

		modalInstance.result.then(
			function (selectedItem) {
				$scope.selected = selectedItem;
			},
			function () {
				console.log('Modal dismissed at: ' + new Date());
			});
	};

	$scope.intv = setInterval(function () {
		if ($scope.sidebar) {
			$scope.getData();
		}
	}, 60000);

	$scope.refreshSchd = function () {
		$scope.getData();
	};

	$scope.infoReq = function (size) {
		$scope.items = ['item1', 'item2', 'item3'];

		var modalInstance = $modal.open({
			templateUrl: 'partials/modal.html',
			controller:  'ModalInstanceCtrl',
			size:        size,
			resolve:     {
				items: function () {
					return $scope.items;
				}
			}
		});

		modalInstance.result.then(
			function (selectedItem) {
				$scope.selected = selectedItem;
			},
			function () {
				console.log('Modal dismissed at: ' + new Date());
			});
	};

	$scope.getData();
});

app.controller('WeatherController', function ($scope, weatherService) {
	$scope.wthr = {};
	$scope.wthr.wd = {
		lastUpdate: Date.now()
	};

	$scope.getData = function () {
		var p = weatherService.getLocalData(2245432);

		p.then(
			function (res) {
				$scope.wthr.wd = res.data;
				var i = $scope.wthr.wd.query.results.channel.item.title.indexOf('at');
				$scope.wthr.wd.title = $scope.wthr.wd.query.results.channel.item.title.substring(0, i);
			},
			function (res) {

			});
	};

	$scope.intv = setInterval(function () {
		$scope.getData();
	}, 30 * 60 * 1000); // Check Every 30 Mins

	$scope.getData();

});

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

	$scope.items = items;
	$scope.selected = {
		item: $scope.items[0]
	};

	$scope.ok = function () {
		$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

app.controller('modalReservationController', function ($scope, $modalInstance, reservation) {

	$scope.reservation = reservation;

	$scope.list = reservation.attendeeList.split(',');

	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
