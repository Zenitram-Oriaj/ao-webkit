
var net = require('net');
var port = 8890;
///////////////////////////////////////////////////////////////
// Linx Server

var linx = net.createServer(function(c) { //'connection' listener
	c.on('end', function() {
		console.log("Connection Has Closed On Port: " + port.toString());
	});

	c.on('data', function (d) {
		console.log("Incoming Data On Port: " + port.toString());
		if(d.length > 2){
			var j = JSON.parse(d);
			window.updateStatus(j.room, j.status);
		} else {
			console.log("ERROR :: Incoming Data NOT VALID");
		}
	});
});

// Listen for connections

linx.listen(port, function () {
	console.log("Waiting For A Connection On Port: " + port.toString());
});

///////////////////////////////////////////////////////////////

