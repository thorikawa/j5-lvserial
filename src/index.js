'use strict';

var Emitter = require("events").EventEmitter;
var util = require("util");
var priv = new Map();

const FB_TPOS_DEFAULT_MIN = 0x0200;
const FB_TPOS_DEFAULT_MAX = 0x0e00;
const FB_TPOS_DEFAULT_CENTER = 0x0800;
const DEGREE_DEFAULT_MIN = 15;
const DEGREE_DEFAULT_MAX = 345;

export default function(five) {
	let Fn = five.Fn;
	let Animation = five.Animation;

	return (function() {
		function Component(opts) {
			if (!(this instanceof Component)) {
				return new Component(opts);
			}

			five.Board.Component.call(
				this, opts = five.Board.Options(opts)
			);

			this.sid = opts.sid || 0;

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

		util.inherits(Component, Emitter);

		Component.prototype.serialWrite = function(bytes) {
			console.log(bytes);
			let state = priv.get(this);
			this.io.serialWrite(state.portId, bytes);
		};

		Component.prototype.ramWrite = function(address, data) {
			let len = data.length;
			let buf = new Buffer(3 + len);
			buf[0] = 0x80 | this.sid;
			buf[1] = 0x40 | 0x00 | len;
			buf[2] = address;
			let offset = 3;
			for (let d of data) {
				buf[offset++] = d;
			}
			this.serialWrite(buf);
		};

		Component.prototype.ramRead = function(address, len) {
			let buf = new Buffer(3 + len);
			buf[0] = 0x80 | this.sid;
			buf[1] = 0x00 | 0x20 | len;
			buf[2] = address;
			for (let i = 0; i < len; i++) {
				buf[3 + i] = 0x00;
			}
			this.serialWrite(buf);
		};

		Component.prototype.flashWrite = function(address,  data) {
			let len = data.length;
			let buf = new Buffer(5 + len);
			buf[0] = 0x80 | this.sid;
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
		};

		Component.prototype.unlock = function() {
			this.ramWrite(0x14, [0x55]);
		};

		Component.prototype.motorToggle = function(on) {
			this.ramWrite(0x3b, [on ? 1 : 0]);
		};

		Component.prototype.motorOn = function() {
			this.motorToggle(true);
		};

		Component.prototype.motorOff = function() {
			this.motorToggle(false);
		};

		Component.prototype.move = function(tpos) {
			tpos = parseInt(tpos);
			if (tpos < FB_TPOS_DEFAULT_MIN || tpos > FB_TPOS_DEFAULT_MAX) {
				console.warn(`tpos value is out of range. Please specify the value from ${FB_TPOS_DEFAULT_MIN} to ${FB_TPOS_DEFAULT_MAX}.`);
				return;
			}
			this.ramWrite(0x30, [tpos & 0x7f, (tpos >> 7) & 0x7f]);
		};

		Component.prototype.to = function(degree) {
			if (degree < DEGREE_DEFAULT_MIN || degree > DEGREE_DEFAULT_MAX) {
				console.warn(`The degree is out of range. Please specify the value from ${DEGREE_DEFAULT_MIN} to ${DEGREE_DEFAULT_MAX}.`);
				return;
			}
			let tpos = Fn.map(degree, DEGREE_DEFAULT_MIN, DEGREE_DEFAULT_MAX, FB_TPOS_DEFAULT_MIN, FB_TPOS_DEFAULT_MAX);
			this.move(tpos);
		};

		Component.prototype.setSid = function(newSid) {
			if (newSid < 0 || newSid > 127) {
				console.warn(`New sid is out of range. Please specify the value from 0 to 127.`);
				return;
			}
			this.flashWrite(0x08, [newSid]);
			console.log("You need to restart the V-SERVO to update sid.");
		};

		Component.prototype.getSid = function() {
			this.ramRead(0x08, 1);
		};

		Component.prototype.reset = function() {
			this.flashWrite(0x00, [0x3e8 & 0x7f, 0x3e8 >> 7]);
		};

		Component.prototype[Animation.render] = function(position) {
			return this.to(position[0]);
		};

		Component.prototype[Animation.normalize] = function(keyFrames) {
			// There are a couple of properties that are device type sepcific
			// that we need to convert to something generic
			keyFrames.forEach(function(keyFrame) {
				if (typeof keyFrame.degrees !== "undefined") {
					keyFrame.value = keyFrame.degrees;
				}
				if (typeof keyFrame.copyDegrees !== "undefined") {
					keyFrame.copyValue = keyFrame.copyDegrees;
				}
			});
			return keyFrames;
		};

		return Component;
	}());
};

/**
 *  To use the plugin in a program:
 *
 *  var five = require("johnny-five");
 *  var Component = require("component")(five);
 *
 *
 */
