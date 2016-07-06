j5-lvserial
====
Johnny-five plugin for servo motors which support LVSerial protocol provided by Vstone.

# Compatiblity
I confirmed that this plugin works with VS-SV3310 and Arduino UNO. It should work with VS-SV1150 as well.

# Example

```c
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
```

You can find more examples in [examples](./examples) folder.

# Note
You need to write `StandardFirmataPlus` to your arduino board if you want to use SoftwareSerial. Otherwise `StandardFirmata` will be sufficient.

# Reference
https://vstone.co.jp/products/v_servo/qa.html

# License
MIT License
