'use strict';

let five = require('johnny-five');
let LvSerial = require('../')(five);
let board = new five.Board({});

board.on('ready', () => {
	let vservo = new LvSerial({
		pins: {
			rx: 11,
			tx: 10
		},
		sid: 0,
		repl: false
	});
	setTimeout(() => {
		vservo.unlock();
	}, 200);
	setTimeout(() => {
		console.log('motor on');
		vservo.motorOn();
	}, 400);
	setTimeout(() => {
		console.log('move to 30 degree');
		vservo.to(30);
	}, 2000);
	setTimeout(() => {
		console.log('move to 300 degree');
		vservo.to(300);
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
