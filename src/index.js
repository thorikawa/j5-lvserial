'use strict';

var Emitter = require("events").EventEmitter;
var util = require("util");
var priv = new Map();

export default function(five) {
	return (function() {
		function Component(opts) {
			if (!(this instanceof Component)) {
				return new Component(opts);
			}

			five.Board.Component.call(
				this, opts = five.Board.Options(opts)
			);

			var state = {
				portId: opts.portId || this.io.SERIAL_PORT_IDs.DEFAULT,
				baud: opts.baud || 115200,
			};

			priv.set(this, state);

			let rx = 0, tx = 1;
			if (this.pins) {
				if (Number.isInteger(this.pins.rx)) rx = this.pins.rx;
				if (Number.isInteger(this.pins.tx)) tx = this.pins.tx;
			}

			for (let pin of [rx, tx]) {
				this.io.pinMode(pin, this.io.MODES.SERIAL);
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
				});
			});

			Object.defineProperties(this, {
				// Define any accessors here
			});
		}

		util.inherits(Component, Emitter);

		Component.prototype.write = function(bytes) {
			let state = priv.get(this);
			this.io.serialWrite(state.portId, bytes);
		};

		Component.prototype.flashWrite = function(sid, address, data) {
			let len = data.length;
			let buf = new Buffer(3 + len);
			buf[0] = 0x80 | sid;
			buf[1] = 0x40 | 0x00 | len;
			buf[2] = address;
			let offset = 3;
			for (let d of data) {
				buf[offset++] = d;
			}
			this.write(buf);
		};

		Component.prototype.unlock = function(sid=0) {
			this.flashWrite(sid, 0x14, [0x55]);
		};

		Component.prototype.motorToggle = function(sid=0, on) {
			this.flashWrite(sid, 0x3b, [on ? 1 : 0]);
		};

		Component.prototype.motorOn = function(sid=0) {
			this.motorToggle(sid, true);
		};

		Component.prototype.motorOff = function(sid=0) {
			this.motorToggle(sid, false);
		};

		Component.prototype.move = function(sid=0, tpos) {
			if (tpos < 0x200 || tpos > 0xe00) {
				console.warn('tpos value is out of range. Please specify the value from 0x200 to 0xe00.');
				return;
			}
			this.flashWrite(sid, 0x30, [tpos & 0x7f, (tpos >> 7) & 0x7f]);
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
