'use strict';

const Emitter = require('events').EventEmitter;
const Collection = require('./collection');
const util = require('util');
const priv = new Map();

const FB_TPOS_DEFAULT_MIN = 0x0200;
const FB_TPOS_DEFAULT_MAX = 0x0e00;
const FB_TPOS_DEFAULT_CENTER = 0x0800;
const DEGREE_DEFAULT_MIN = 15;
const DEGREE_DEFAULT_MAX = 345;
const SID_BROADCAST = 0x3f;

export default function(five) {
	let Fn = five.Fn;
	let Animation = five.Animation;

	class ServoController extends Emitter {
		constructor(opts) {
			super();
			if (!(this instanceof ServoController)) {
				return new ServoController(opts);
			}

			// call Board.Compnent's constructor for 'this'
			five.Board.Component.call(
				this, opts = five.Board.Options(opts)
			);

			var state = {
				portId: opts.portId || this.io.SERIAL_PORT_IDs.DEFAULT,
				baud: opts.baud || 115200
			};

			priv.set(this, state);

			let rx = 0, tx = 1;
			if (this.pins) {
				if (Number.isInteger(this.pins.rx)) rx = this.pins.rx;
				if (Number.isInteger(this.pins.tx)) tx = this.pins.tx;
			}

			let serialConfig = {
				portId: state.portId, 
				baud: state.baud,
				rxPin: rx,
				txPin: tx,
			};

			this.io.serialConfig(serialConfig);

			process.nextTick(() => {
				this.io.serialRead(state.portId, (bytes) => {
					// read bytes and determine event types to emit
					// store received things in state object, use
					// for emitting events 
					// TODO
					console.log(bytes);
				});
			});

			Object.defineProperties(this, {
				// Define any accessors here
			});
		}

		servo(sid, option) {
			if (Array.isArray(sid)) {
				let servos = sid.map((s) => {
					return new Servo(this, s, option);
				});
				return new Servos(this, servos);
			} else {
				return new Servo(this, sid, option);
			}
		}

		serialWrite(bytes) {
			console.log(bytes);
			let state = priv.get(this);
			this.io.serialWrite(state.portId, bytes);
		}

		ramWrite(sid, address, data) {
			let len = data.length;
			let buf = new Buffer(3 + len);
			buf[0] = 0x80 | sid;
			buf[1] = 0x40 | 0x00 | len;
			buf[2] = address;
			let offset = 3;
			for (let d of data) {
				buf[offset++] = d;
			}
			this.serialWrite(buf);
		}

		ramRead(sid, address, len) {
			let buf = new Buffer(3 + len);
			buf[0] = 0x80 | sid;
			buf[1] = 0x00 | 0x20 | len;
			buf[2] = address;
			for (let i = 0; i < len; i++) {
				buf[3 + i] = 0x00;
			}
			this.serialWrite(buf);
		}

		ramBurstWrite(sid, data) {
			let len = data.length;
			let buf = new Buffer(1 + len);
			buf[0] = 0xc0 | sid;
			let offset = 1;
			for (let d of data) {
				buf[offset++] = d;
			}
			this.serialWrite(buf);
		}

		flashWrite(sid, address, data) {
			let len = data.length;
			let buf = new Buffer(5 + len);
			buf[0] = 0x80 | sid;
			buf[1] = 0x00 | 0x00 | len;
			buf[2] = (address & 0x7f);
			buf[3] = (address >> 7);
			let offset = 4;
			let sum = buf[2] + buf[3];
			for (let d of data) {
				buf[offset++] = d;
				sum += d;
			}
			// checksum
			buf[offset] = (-sum) & 0x7f;
			this.serialWrite(buf);
		}
	}

	class Servo extends Emitter {
		constructor(controller, sid, options) {
			super();
			if (!(this instanceof Servo)) {
				return new Servo(controller, sid, options);
			}

			// call Board.Compnent's constructor for 'this'
			five.Board.Component.call(this);

			this.controller = controller;
			this.sid = sid;
			this.min = DEGREE_DEFAULT_MIN;
			this.max = DEGREE_DEFAULT_MAX;

			if (options.range) {
				if (options.range.length < 2) {
					console.warn('The length of options.range must be greater than or equal to two.');
				} else {
					this.min = options.range[0];
					this.max = options.range[1];
				}
			}
		}

		unlock() {
			this.controller.ramWrite(this.sid, 0x14, [0x55]);
		}

		motorToggle(on) {
			this.controller.ramWrite(this.sid, 0x3b, [on ? 1 : 0]);
		}

		motorOn() {
			this.motorToggle(true);
		}

		motorOff() {
			this.motorToggle(false);
		}

		toTpos(tpos) {
			tpos = parseInt(tpos);
			if (tpos < FB_TPOS_DEFAULT_MIN || tpos > FB_TPOS_DEFAULT_MAX) {
				console.warn(`tpos value is out of range. Please specify the value from ${FB_TPOS_DEFAULT_MIN} to ${FB_TPOS_DEFAULT_MAX}.`);
				return;
			}
			this.controller.ramWrite(this.sid, 0x30, [tpos & 0x7f, (tpos >> 7) & 0x7f]);
		}

		to(degree) {
			degree = Fn.constrain(degree, this.min, this.max);
			let tpos = Fn.map(degree, DEGREE_DEFAULT_MIN, DEGREE_DEFAULT_MAX, FB_TPOS_DEFAULT_MIN, FB_TPOS_DEFAULT_MAX);
			this.toTpos(tpos);
		}

		toTpos_bst(tpos) {
			tpos = parseInt(tpos);
			if (tpos < FB_TPOS_DEFAULT_MIN || tpos > FB_TPOS_DEFAULT_MAX) {
				console.warn(`tpos value is out of range. Please specify the value from ${FB_TPOS_DEFAULT_MIN} to ${FB_TPOS_DEFAULT_MAX}.`);
				return;
			}
			// TODO: This burst write assumes that BST_LEN is 0x04 and BST_WA0, BST_WA1, BST_WA2, and BST_WA3 are FB_TPOS0, FB_TPOS1, PWM_EN and BST_DUM respectively.
			this.controller.ramBurstWrite(this.sid, [tpos & 0x7f, (tpos >> 7) & 0x7f, 1, 0]);
		}

		to_bst(degree) {
			degree = Fn.constrain(degree, this.min, this.max);
			let tpos = Fn.map(degree, DEGREE_DEFAULT_MIN, DEGREE_DEFAULT_MAX, FB_TPOS_DEFAULT_MIN, FB_TPOS_DEFAULT_MAX);
			this.toTpos_bst(tpos);
		}

		setSid(newSid) {
			if (newSid < 0 || newSid > 127) {
				console.warn(`New sid is out of range. Please specify the value from 0 to 127.`);
				return;
			}
			this.controller.flashWrite(this.sid, 0x08, [newSid]);
			console.log("You need to restart the V-SERVO to update sid.");
		}

		getSid() {
			this.controller.ramRead(this.sid, 0x08, 1);
		}

		reset() {
			this.controller.flashWrite(this.sid, 0x00, [0x3e8 & 0x7f, 0x3e8 >> 7]);
		}

		[Animation.render](position) {
			return this.to(position[0]);
		}

		[Animation.normalize](keyFrames) {
			// There are a couple of properties that are device type sepcific
			// that we need to convert to something generic
			keyFrames.forEach(function(keyFrame, index) {
				if (typeof keyFrame.degrees !== "undefined") {
					keyFrame.value = keyFrame.degrees;
				}
				if (typeof keyFrame.copyDegrees !== "undefined") {
					keyFrame.copyValue = keyFrame.copyDegrees;
				}
			});
			return keyFrames;
		}

	}

	class Servos extends Collection {
		constructor(controller, numsOrObjects) {
			super(Servo, numsOrObjects);
			if (!(this instanceof Servos)) {
				return new Servos(numsOrObjects);
			}

			this.controller = controller;
		}

		[Animation.render](value) {
			this.each(function(servo, i) {
				servo.to_bst([value[i]]);
			});
			this.controller.ramWrite(SID_BROADCAST, 0x4f, [0x01]);
		}

		[Animation.normalize](keyFrameSet) {
			return keyFrameSet.map(function(keyFrames, index) {
				if (keyFrames !== null) {
					return this[index][Animation.normalize](keyFrames);
				}
				return keyFrames;
			}, this);
		}
	}

	Collection.installMethodForwarding(
		Servos.prototype, Servo.prototype, ['unlock', 'motorOn', 'motorOff', 'to']
	);

	return ServoController;
};

/**
 *  To use the plugin in a program:
 *
 *  var five = require("johnny-five");
 *  var Component = require("component")(five);
 *
 *
 */
