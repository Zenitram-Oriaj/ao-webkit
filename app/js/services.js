/**
 * Created by Jairo Martinez on 9/29/14.
 */

app.service('parseXML', function (x2jsService) {
	this.parseData = function (x, cb) {
		x2jsService.X2JS().then(function (X2JS) {
			var x2js = new X2JS();
			var r = x2js.xml2json(x);
			cb(r);
		});
	}
});

app.service('workspaceService', function ($http) {
	this.getWsStatus = function () {
		return $http.get('./api/getWsStatus');
	};

	this.collect = function () {
		return $http.get('./json/workspaces');
	};
});

app.service('configService', function ($http) {
	this.getData = function () {
		return $http.get('./files/config.json');
	}
});

app.service('weatherService', function ($http) {
	this.getLocalData = function (locationId) {
		return $http.get('http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location%3D%' + locationId.toString() + '%22&format=json');
	}
});

app.service('schedule', function ($http) {
	this.collect = function () {
		return $http.get('/json/getSchedules');
	}
});

app.service('timelineSvc', function () {
	this.build = function (wsa) {
		var dataArray = [];
		var dt = new Date();
		var options = {
			"height": "auto",
			"stackEvents": false,
			"showCurrentTime": true,
			"zoomMax":24 * 30 * 60 * 1000,
			"zoomMin":3 * 60 * 60 * 1000,
			"editable": false,
			"groupMinHeight": 34,
			"scale": links.Timeline.StepDate.SCALE.HOUR,
			"step": 1
		};

		wsa.forEach(function (ws) {
			ws.reservations.forEach(function (r) {
				var data = {};
				data.start = new Date(Date.parse(r.startTime));
				data.end = new Date(Date.parse(r.stopTime));
				data.content = r.description;
				data.group = ws.name;
				data.className = 'available';
				dataArray.push(data);
			});
		});
		var timeline = new links.Timeline(document.getElementById('timeLine'), options);
		timeline.setOptions(options);
		timeline.draw(dataArray);
		timeline.setVisibleChartRangeNow();

	}
});
