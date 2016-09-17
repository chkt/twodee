"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle2 = function () {
	_createClass(Circle2, null, [{
		key: "Define",


		/**
   * Returns an instance representing p and r
   * @constructor
   * @param {Vector2} p - The center point
   * @param {number} r - The radius
   * @param {Circle2} [target] - The target instance
   * @returns {Circle}
   */
		value: function Define(p, r, target) {
			if (target === undefined) target = new this(p, r);else this.call(target, p, r);

			return target;
		}

		/**
   * Returns an instance at p with area a
   * @constructor
   * @param {Vector2} p - The center point
   * @param {number} a - The area
   * @param {Circle2} [target] - The target instance
   * @returns {Circle2}
   */

	}, {
		key: "Area",
		value: function Area(p, a, target) {
			var r = Math.sqrt(a / Math.PI);

			return this.Define(p, r, target);
		}

		/**
   * Creates a new instance
   * @param {Vector2} p - The center point
   * @param {number} r - The radius
   */

	}]);

	function Circle2(p, r) {
		_classCallCheck(this, Circle2);

		/**
   * The center point
   * @type {Vector2}
   */
		this.center = p;
		/**
   * The radius
   * @type {number}
   */
		this.radius = r;
	}

	/**
  * Redefines the instance
  * @param {Vector2} p - The center point
  * @param {Vector2} r - The radius
  * @returns {Circle}
  */


	_createClass(Circle2, [{
		key: "define",
		value: function define(p, r) {
			this.constructor.call(this, p, r);

			return this;
		}

		/**
   * The area
   * @type number
   */

	}, {
		key: "area",
		get: function get() {
			return Math.PI * this.radius * this.radius;
		}
	}]);

	return Circle2;
}();

exports.default = Circle2;