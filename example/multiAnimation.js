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
	let servos = servoController.servo([0, 1, 2, 3]);
	let animation = new five.Animation(servos);

	setTimeout(() => {
		servos.unlock();
	}, 200);
	setTimeout(() => {
		console.log('motor on');
		servos.motorOn();
	}, 400);
	setTimeout(() => {
		animation.enqueue({
			cuePoints: [0, 1],
			keyFrames: [
				[{ value: 180 }, { value: 190 }],
				[{ value: 180 }, { value: 185 }],
				[{ value: 180 }, { value: 170 }],
				[{ value: 180 }, { value: 175 }],
			],
			duration: 10000,
			fps: 30
  		});
	}, 2000);
	setTimeout(() => {
		console.log('motor off');
		servos.motorOff();
	}, 16000);
});
