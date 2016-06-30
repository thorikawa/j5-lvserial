'use strict';

let five = require('johnny-five');
let LvSerial = require('../')(five);
let board = new five.Board({});

board.on('ready', () => {
	let vservo = new LvSerial({
		pins: {
			rx: 11,
			tx: 10
		}
	});
	setTimeout(() => {
		vservo.unlock();
	}, 200);
	setTimeout(() => {
		vservo.motorOn();
	}, 400);
	setTimeout(() => {
		vservo.move(0, 0x500);
	}, 2000);
	setTimeout(() => {
		vservo.move(0, 0xa00);
	}, 4000);
});
