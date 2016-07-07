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
		vservo.getSid();
	}, 1000);
	setTimeout(() => {
		vservo.setSid(1);
	}, 2000);
	setTimeout(() => {
		vservo.getSid();
	}, 3000);
	// setTimeout(() => {
	// 	vservo.reset();
	// }, 4000);
	// setTimeout(() => {
	// 	vservo.getSid();
	// }, 5000);
});
