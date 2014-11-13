/**
 * Created by Jairo Martinez on 7/14/14.
 */

app.directive('titleBar', function () {
	return {
		restrict:     'E',
		templateUrl:  './partials/titleBar.html'
	};
});

app.directive('sideBar', function () {
	return {
		restrict:     'E',
		templateUrl:  './partials/sideBar.html',
		link: function(s,e,a){

		}
	};
});

app.directive('mainView', function () {
	return {
		restrict:     'E',
		templateUrl:  './partials/mainView.html'
	};
});

app.directive('schedulerWidget', function () {
	return {
		restrict:     'E',
		templateUrl:  './partials/widgets/scheduler.html'
	};
});

app.directive('datetimeWidget', function () {
	return {
		restrict:    'E',
		templateUrl: './partials/widgets/datetime.html'
	};
});

app.directive('calendarWidget', function () {
	return {
		restrict:    'E',
		templateUrl: './partials/widgets/calendar.html'
	};
});

app.directive('weatherWidget', function () {
	return {
		restrict:    'E',
		templateUrl: './partials/widgets/weather.html'
	};
});

app.directive('enter', function () {
	return {
		restrict: 'A',
		link:     function (s, e, a) {
			e.bind('mouseenter', function () {
				e.addClass(a.enter);
			})
		}
	}
});

app.directive('leave', function () {
	return {
		restrict: 'A',
		link:     function (s, e, a) {
			e.bind('mouseleave', function () {
				e.removeClass(a.enter);
			})
		}
	}
});

app.directive('animateIcon', function () {
	return {
		link: function (s, e, a) {
			e.bind('click', function () {
				e.addClass('fa-spin');
				setTimeout(function(){
					e.removeClass('fa-spin');
				},2000)
			});
		}
	};
});