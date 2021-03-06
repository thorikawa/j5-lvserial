'use strict';

let five = require('johnny-five');
let LvSerial = require('../')(five);
let board = new five.Board({});

board.on('ready', () => {
	let servoController = new LvSerial({
		pins: {
			rx: 11,
			tx: 10
		},
		repl: false
	});
	let vservo = servoController.servo(1);
	setTimeout(() => {
		vservo.unlock();
	}, 200);
	setTimeout(() => {
		vservo.getSid();
	}, 1000);
});
