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
		sid: 3,
		repl: false
	});
	setTimeout(() => {
		vservo.unlock();
	}, 200);
	setTimeout(() => {
		vservo.getSid();
	}, 1000);
});
