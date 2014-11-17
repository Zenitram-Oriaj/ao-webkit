/**
 * Created by digimenet on 7/8/14.
 */

var app = angular.module('app', ['ngResource','ngAnimate','ui.bootstrap', 'd3', 'x2js']);

app.run(function(){

	var gui = require('nw.gui');
	
	setTimeout(function(){
		var tray = new gui.Tray({
			icon: 'img/red-elephant-16x16.png'
		});
		gui.Window.get().show();
	},30 * 1000);

});