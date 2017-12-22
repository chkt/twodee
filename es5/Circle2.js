'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Circle geometry
 */
var Circle2 = function () {
	_createClass(Circle2, null, [{
		key: 'Define',


		/**
   * Returns an instance representing p and r
   * @param {Vector2} p - The center point
   * @param {number} r - The radius
   * @param {Circle2} [target] - The target instance
   * @returns {Circle2}
   */
		value: function Define(p, r, target) {
			if (target === undefined) target = new this(p, r);else this.call(target, p, r);

			return target;
		}

		/**
   * Returns an instance at p with area a
   * @param {Vector2} p - The center point
   * @param {number} a - The area
   * @param {Circle2} [target] - The target instance
   * @returns {Circle2}
   */

	}, {
		key: 'Area',
		value: function Area(p, a, target) {
			var r = Math.sqrt(a / Math.PI);

			return this.Define(p, r, target);
		}

		/**
   * Returns a copy of circle
   * @param {Circle2} circle - The source
   * @param {Circle2} [target] - The target instance
   * @returns {Circle2}
   */

	}, {
		key: 'Copy',
		value: function Copy(circle, target) {
			return this.Define(_Vector2.default.Copy(circle.center), circle.radius, target);
		}

		/**
   * Returns true if q intersects circle (p,r), false otherwise
   * @param {Vector2} p - The circle center
   * @param {number} r - The circle radius
   * @param {Vector2} q - The point
   * @returns {boolean}
   */

	}, {
		key: 'intersectPoint',
		value: function intersectPoint(p, r, q) {
			return _Vector2.default.Subtract(p, q).normSquared <= r * r;
		}

		/**
   * Returns true if circle (p0,r0) intersects circle (p1,r1), false otherwise
   * @param {Vector2} p0 - The first circle center
   * @param {number} r0 - The first circle radius
   * @param {Vector2} p1 - The second circle center
   * @param {number} r1 - The second circle radius
   * @param {Vector2[]} [points] - The intersection points
   * @returns {boolean}
   */

	}, {
		key: 'intersect',
		value: function intersect(p0, r0, p1, r1, points) {
			var p10 = _Vector2.default.Subtract(p1, p0),
			    d = p10.norm;

			if (d > r0 + r1) return false;

			if (points === undefined || d <= Math.abs(r1 - r0)) return true;

			var dInverse = 1.0 / d,
			    r0Squared = r0 * r0;
			var a = (r0Squared - r1 * r1 + d * d) * 0.5 * dInverse;
			var h = Math.sqrt(r0Squared - a * a);

			var p2 = _Vector2.default.Copy(p10).multiplyScalarEQ(a * dInverse);

			var t = _Vector2.default.Copy(p10).multiplyScalarEQ(h * dInverse);

			var x3 = p2.x + t.y,
			    x4 = p2.x - t.y;
			var y3 = p2.y + t.x,
			    y4 = p2.y - t.x;

			points.splice(0, points.length, new _Vector2.default([x3, y3]));

			if (x3 !== x4 || y3 !== y4) points.push(new _Vector2.default([x4, y4]));

			return true;
		}

		/**
   * Returns true if a and b are equal (a == b), false otherwise
   * @param {Circle2} a - The protagonist
   * @param {Circle2} b - The antagonist
   * @returns {boolean}
   */

	}, {
		key: 'isEQ',
		value: function isEQ(a, b) {
			return a === b || _Vector2.default.isEQ(a.center, b.center) && a.radius === b.radius;
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
  * @returns {Circle2}
  */


	_createClass(Circle2, [{
		key: 'define',
		value: function define(p, r) {
			this.constructor.call(this, p, r);

			return this;
		}

		/**
   * The area
   * @type {number}
   */

	}, {
		key: 'intersectsPoint',


		/**
   * Returns true if p intersects the instance, false otherwise
   * @param {Vector2} p - The point
   * @returns {boolean}
   */
		value: function intersectsPoint(p) {
			return _Vector2.default.Subtract(this.center, p).normSquared <= this.radius * this.radius;
		}

		/**
   * Returns true if circle intersects the instance, false otherwise
   * @param {Circle2} circle - The circle
   * @param {Vector2[]} [points] - The intersection points
   * @returns {boolean}
   */

	}, {
		key: 'intersects',
		value: function intersects(circle, points) {
			return Circle2.intersect(this.center, this.radius, circle.center, circle.radius, points);
		}

		/**
   * The transformation of circle
   * @param {Circle2} circle - The source
   * @param {Matrix3} transform - The transform
   * @returns {Circle2}
   */

	}, {
		key: 'transformationOf',
		value: function transformationOf(circle, transform) {
			this.center.multiply2x3Matrix3(transform, circle.center);

			return this;
		}

		/**
   * The copy of circle
   * @param {Circle2} circle - The source
   * @returns {Circle2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(circle) {
			return this.define(_Vector2.default.Copy(circle.center), circle.radius);
		}

		/**
   * The transformation of the instance
   * @param {Matrix3} transform - The transform
   * @returns {Circle2}
   */

	}, {
		key: 'transformation',
		value: function transformation(transform) {
			this.center.multiply2x3Matrix3(transform, this.center);

			return this;
		}

		/**
   * Returns a string representation of the instance
   * @param {int} digits - The decimal places
   * @returns {string}
   */

	}, {
		key: 'toString',
		value: function toString() {
			var digits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

			return '[Circle2] ' + this.center.toString(digits) + ' ' + this.radius + ')';
		}
	}, {
		key: 'area',
		get: function get() {
			return Math.PI * this.radius * this.radius;
		}
	}]);

	return Circle2;
}();

exports.default = Circle2;