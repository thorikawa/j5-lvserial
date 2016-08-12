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
	let vservo = servoController.servo(2);
	let animation = new five.Animation(vservo);

	setTimeout(() => {
		vservo.unlock();
	}, 200);
	setTimeout(() => {
		console.log('motor on');
		vservo.motorOn();
	}, 400);
	setTimeout(() => {
		animation.enqueue({
			cuePoints: [0, 0.25, 0.75, 1],
			keyFrames: [{ value: 180 }, { value: 200, easing: "inQuad" }, { value: 140, easing: "outQuad" }, { value: 180 }],
			duration: 3000,
			fps: 30
  		});
	}, 2000);
	setTimeout(() => {
		console.log('motor off');
		vservo.motorOff();
	}, 16000);
});
