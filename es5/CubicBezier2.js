'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _V = new _Vector2.default();

/**
 * Cubic Bezier Curve
 */

var CubicBezier2 = function () {
	_createClass(CubicBezier2, null, [{
		key: 'Copy',


		/**
   * Returns a copy of source
   * @param {CubicBezier2} source - The source curve
   * @param {CubicBezier2} [target] - The target curve
   * @returns {CubicBezier2}
   */
		value: function Copy(source, target) {
			if (target === undefined) target = new CubicBezier2(new _Vector2.default(), new _Vector2.default(), new _Vector2.default(), new _Vector2.default());

			return target.copyOf(source);
		}

		/**
   * Return the point at t of cubic bezier curve p0,p1,p2,p3
   * @param {Vector2} p0
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @param {number} t - The position
   * @returns {Vector2}
   */

	}, {
		key: 'getPointOfT',
		value: function getPointOfT(p0, p1, p2, p3, t) {
			var tt = t * t,
			    it = 1.0 - t,
			    itt = it * it;

			return _Vector2.default.MultiplyScalar(p0, itt * it).addEQ(_V.multiplyScalar(p1, 3.0 * itt * t)).addEQ(_V.multiplyScalar(p2, 3.0 * it * tt)).addEQ(_V.multiplyScalar(p3, tt * t));
		}

		/**
   * Returns the partial segments of source split at t
   * @param {CubicBezier2} source - The source curve
   * @param {number} t - The position
   * @returns {CubicBezier2[]}
   */

	}, {
		key: 'split',
		value: function split(source, t) {
			var it = 1.0 - t;
			var p00 = source.p0,
			    p10 = source.p1,
			    p20 = source.p2,
			    p30 = source.p3;
			var v = new _Vector2.default();

			var p11 = _Vector2.default.MultiplyScalar(p10, it).addEQ(v.multiplyScalar(p20, t));
			var p21 = _Vector2.default.MultiplyScalar(p20, it).addEQ(v.multiplyScalar(p30, t));
			var p12 = _Vector2.default.MultiplyScalar(p11, it).addEQ(v.multiplyScalar(p21, t));

			var p01 = _Vector2.default.MultiplyScalar(p00, it).addEQ(v.multiplyScalar(p10, t));
			var p02 = _Vector2.default.MultiplyScalar(p01, it).addEQ(v.multiplyScalar(p11, t));
			var p03 = _Vector2.default.MultiplyScalar(p02, it).addEQ(v.multiplyScalar(p12, t));

			return [new this(v.copyOf(p00), p01, p02, p03), new this(p11.copyOf(p03), p12, p21, _Vector2.default.Copy(p30))];
		}

		/**
   * Returns true if a and b represent the same curve, false otherwise
   * @param {CubicBezier2} a
   * @param {CubicBezier2} b
   * @returns {boolean}
   */

	}, {
		key: 'isEQ',
		value: function isEQ(a, b) {
			return a === b || _Vector2.default.isEQ(a.p0, b.p0) && _Vector2.default.isEQ(a.p1, b.p1) && _Vector2.default.isEQ(a.p2, b.p2) && _Vector2.default.isEQ(a.p3, b.p3);
		}

		/**
   * Creates an instance
   * @param {Vector2} p0
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   */

	}]);

	function CubicBezier2(p0, p1, p2, p3) {
		_classCallCheck(this, CubicBezier2);

		this.p0 = p0;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}

	/**
  * Defines the instance
  * @param {Vector2} p0
  * @param {Vector2} p1
  * @param {Vector2} p2
  * @param {Vector2} p3
  * @returns {CubicBezier2}
  */


	_createClass(CubicBezier2, [{
		key: 'define',
		value: function define(p0, p1, p2, p3) {
			this.constructor.call(this, p0, p1, p2, p3);

			return this;
		}

		/**
   * Returns the point at t
   * @param {number} t - The position
   * @returns {Vector2}
   */

	}, {
		key: 'getPointOfT',
		value: function getPointOfT(t) {
			return CubicBezier2.getPointOfT(this.p0, this.p1, this.p2, this.p3, t);
		}

		/**
   * The copy of source
   * @param {CubicBezier2} source - The source bezier
   * @returns {CubicBezier2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(source) {
			this.p0.copyOf(source.p0);
			this.p1.copyOf(source.p1);
			this.p2.copyOf(source.p2);
			this.p3.copyOf(source.p3);

			return this;
		}
	}]);

	return CubicBezier2;
}();

exports.default = CubicBezier2;