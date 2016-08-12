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
	let vservo = servoController.servo(0, {
		range: [170, 190]
	});
	setTimeout(() => {
		vservo.unlock();
	}, 200);
	setTimeout(() => {
		console.log('motor on');
		vservo.motorOn();
	}, 400);
	setTimeout(() => {
		console.log('set PG');
		vservo.setPG(0x05);
	}, 600);
	setTimeout(() => {
		console.log('move to 160 degree');
		vservo.to(160);
	}, 2000);
	setTimeout(() => {
		console.log('move to 200 degree');
		vservo.to(200);
	}, 3000);
	setTimeout(() => {
		console.log('move to 180 degree');
		vservo.to(180);
	}, 4000);
	setTimeout(() => {
		console.log('motor off');
		vservo.motorOff();
	}, 5000);
});
