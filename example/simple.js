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
		console.log('motor on');
		vservo.motorOn();
	}, 400);
	setTimeout(() => {
		console.log('move to 0x500');
		vservo.to(0, 30);
	}, 2000);
	setTimeout(() => {
		console.log('move to 0xa00');
		vservo.to(0, 300);
	}, 4000);
	setTimeout(() => {
		console.log('motor off');
		vservo.motorOff();
	}, 5000);
});
