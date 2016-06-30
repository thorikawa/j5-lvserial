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
			keyFrames: [{ value: 90 }, { value: 300, easing: "inQuad" }, { value: 30, easing: "outQuad" }, { value: 90 }],
			duration: 10000
  		});
	}, 2000);
	setTimeout(() => {
		console.log('motor off');
		vservo.motorOff();
	}, 16000);
});
