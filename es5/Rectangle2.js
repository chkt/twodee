'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Math = require('xyzw/es5/Math');

var _Math2 = _interopRequireDefault(_Math);

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

var _Matrix = require('xyzw/es5/Matrix3');

var _Matrix2 = _interopRequireDefault(_Matrix);

var _PolyLine = require('./PolyLine2');

var _PolyLine2 = _interopRequireDefault(_PolyLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Planar geometric primitive, second order
 */
var Rectangle2 = function () {
	_createClass(Rectangle2, [{
		key: 'isEQ',


		/**
   * Returns true if a and b represent the same rectangle, false otherwise
   * @param {Rectangle2} a - The protagonist
   * @param {Rectangle2} b - The antagonist
   * @returns {boolean}
   */
		value: function isEQ(a, b) {
			return a === b || _Matrix2.default.isEQ(a.transform, b.transform) && _Vector2.default.isEQ(a.extend, b.extend);
		}

		/**
   * Creates a new instance
   * @param {Matrix3} [transform] - The transform
   * @param {Vector2} [extend] - The extend
   */

	}], [{
		key: 'Define',


		/**
   * Defines an instance
   * @constructor
   * @param {Matrix3} transform - The transform
   * @param {Vector2} extend - The extend
   * @param {Rectangle2} [target] - The target instance
   * @returns {Rectangle2}
   */
		value: function Define(transform, extend, target) {
			if (target === undefined) return new this(transform, extend);else return this.call(target, transform, extend);
		}

		/**
   * Returns a new instance from w, h
   * @constructor
   * @param {number} w - The width
   * @param {number} h - The height
   * @param {Rectangle2} [target] - The target instance
   */

	}, {
		key: 'Box',
		value: function Box(w, h, target) {
			var transform = new _Matrix2.default();
			var extend = new _Vector2.default([w * 0.5, h * 0.5]);

			return this.Define(transform, extend, target);
		}

		/**
   * Returns a new instance from point
   * @constructor
   * @param {Vector2[]} point - The points
   * @param {Rectangle2} [target] - The target instance
   * @returns {Rectangle2}
   */

	}, {
		key: 'AABB',
		value: function AABB(point, target) {
			var minx = Number.MAX_VALUE,
			    miny = minx;
			var maxx = -Number.MAX_VALUE,
			    maxy = maxx;

			for (var i = point.length - 1; i > -1; i -= 1) {
				if (!(i in point)) continue;

				var p = point[i];

				minx = _Math2.default.min(p.n[0], minx);
				miny = _Math2.default.min(p.n[1], miny);
				maxx = _Math2.default.max(p.n[0], maxx);
				maxy = _Math2.default.max(p.n[1], maxy);
			}

			var w = (maxx - minx) * 0.5;
			var h = (maxy - miny) * 0.5;
			var midx = minx + w;
			var midy = miny + h;

			var transform = new _Matrix2.default([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, midx, midy, 1.0]);
			var extend = new _Vector2.default([w, h]);

			return this.Define(transform, extend, target);
		}

		/**
   * Returns an instance representing the transformation of rectangle
   * @constructor
   * @param {Rectangle2} rectangle - The source
   * @param {Matrix3} transform - The transform
   * @param {Rectangle2} [target] - The target instance
   * @returns {Rectangle2}
   */

	}, {
		key: 'Transformation',
		value: function Transformation(rectangle, transform, target) {
			if (target === undefined) target = new Rectangle2();

			return target.transformationOf(rectangle, transform);
		}

		/**
   * Returns a copy of rectangle
   * @constructor
   * @param {Rectangle2} rectangle - The source
   * @param {Rectangle2} [target] - The target instance
   * @returns {Rectangle2}
   */

	}, {
		key: 'Copy',
		value: function Copy(rectangle, target) {
			if (target === undefined) return new Rectangle2();

			target.transform.copyOf(rectangle.transform);
			target.extend.copyOf(rectangle.extend);

			return target;
		}

		/**
   * Returns true if obb (tA,eA) intersects with point (p), false otherwise
   * @param {Matrix3} tA - The transform of the obb
   * @param {Vector2} eA - The half-dimensions of the obb
   * @param {Vector2} p - The point
   * @returns {boolean}
   */

	}, {
		key: 'intersectPoint',
		value: function intersectPoint(tA, eA, p) {
			var mT = _Matrix2.default.Inverse(tA);
			var vP = _Vector2.default.Multiply2x3Matrix3(mT, p);

			if (eA.n[0] < _Math2.default.abs(vP.n[0]) || eA.n[1] < _Math2.default.abs(vP.n[1])) return false;

			return true;
		}

		/**
   * Returns true if obb (t, e) intersects with triangle(p0,p1,p2)
   * @param {Matrix3} t - The obb transform
   * @param {Vector2} e - The obb extend
   * @param {Vector2} p0 - The first point of the triangle
   * @param {Vector2} p1 - The second point of the triangle
   * @param {Vector2} p2 - The third point of the triangle
   * @returns {boolean}
   */

	}, {
		key: 'intersectTriangle',
		value: function intersectTriangle(t, e, p0, p1, p2) {
			var ex = e.n[0],
			    ey = e.n[1];

			var q0 = new _Vector2.default([ex, ey]),
			    q1 = new _Vector2.default([ex, -ey]);
			var q2 = new _Vector2.default([-ex, -ey]),
			    q3 = new _Vector2.default([-ex, ey]);

			q0.multiply2x3Matrix3(t, q0), q1.multiply2x3Matrix3(t, q1);
			q1.multiply2x3Matrix3(t, q2), q2.multiply2x3Matrix3(t, q3);

			var ps = [p0, p1, p2],
			    qs = [q0, q1, q2, q3];

			var axes = [_Vector2.default.Subtract(q1, q0), _Vector2.default.Subtract(q2, q1), _Vector2.default.Subtract(p1, p0), _Vector2.default.Subtract(p2, p1), _Vector2.default.Subtract(p0, p2)];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = axes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var va = _step.value;

					var vax = va.n[0],
					    vay = va.n[1];

					var pmin = _Math2.default.MAX_NUMBER,
					    pmax = -_Math2.default.MAX_NUMBER;
					var qmin = _Math2.default.MAX_NUMBER,
					    qmax = -_Math2.default.MAX_NUMBER;

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = ps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var p = _step2.value;

							var dot = vax * p.n[0] + vay * p.n[1];

							pmin = pmin < dot ? pmin : dot;
							pmax = pmax > dot ? pmax : dot;
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = qs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var q = _step3.value;

							var _dot = vax * q.n[0] + vay * q.n[1];

							qmin = qmin < _dot ? qmin : _dot;
							qmax = qmax > _dot ? qmax : _dot;
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}

					if (!_Math2.default.overlap(pmin, pmax, qmin, qmax)) return false;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return true;
		}

		/**
   * Returns true if obb (tA,eA) intersects with obb (tB,eB), false otherwise
   * OBB intersection test using the seperating axis method by Gottschalk et. al. [RRp767]
   * @param {Matrix3} tA - The transform of the first obb
   * @param {Vector2} eA - The half-dimensions of the first obb
   * @param {Matrix3} tB - The transform of the second obb
   * @param {Vector2} eB - The half-dimensions of the second obb
   * @returns {boolean}
   */

	}, {
		key: 'intersect',
		value: function intersect(tA, eA, tB, eB) {
			var eAn = eA.n,
			    eBn = eB.n,
			    abs = _Math2.default.abs;

			var mT = _Matrix2.default.Inverse(tA),
			    mTn = mT.n;

			mT.multiply(mT, tB);

			var tx = mTn[6],
			    ty = mTn[7];

			var r00 = abs(mTn[0]),
			    r01 = abs(mTn[3]);
			var r10 = abs(mTn[1]),
			    r11 = abs(mTn[4]);

			if (abs(tx) > eAn[0] + eBn[0] * r00 + eBn[1] * r01 || abs(ty) > eAn[1] + eBn[0] * r10 + eBn[1] * r11 || abs(tx * mTn[0] + ty * mTn[1]) > eAn[0] * r00 + eAn[1] * r10 + eBn[0] || abs(tx * mTn[3] + ty * mTn[4]) > eAn[0] * r01 + eAn[1] * r11 + eBn[1]) return false;

			return true;
		}
	}]);

	function Rectangle2(transform, extend) {
		_classCallCheck(this, Rectangle2);

		/**
   * The transform
   * @type Matrix3
   */
		this.transform = transform || new _Matrix2.default();
		/**
   * The half-dimensions
   * @type Vector2
   */
		this.extend = extend || new _Vector2.default();
	}

	/**
  * Redefines the instance
  * @param {Matrix3} [transform] - The transform
  * @param {Vector2} [extend] - The half-dimensions
  * @returns {Rectangle2}
  */


	_createClass(Rectangle2, [{
		key: 'define',
		value: function define(transform, extend) {
			this.constructor.call(this, transform, extend);

			return this;
		}

		/**
   * The dereferenced center point
   * @type Vector2
   */

	}, {
		key: 'intersectsPoint',


		/**
   * Returns true if the instance intersects with p, false otherwise
   * Alias for {@link Rectangle2.intersectPoint}
   * @param {Vector2} p - The antagonist
   * @returns {boolean}
   */
		value: function intersectsPoint(p) {
			return Rectangle2.intersectPoint(this.transform, this.extend, p);
		}

		/**
   * Returns true if the instance intersects with segment (p0,p1), false otherwise
   * Alias of {@link Polyline2.intersect}
   * @param {Vector2} p0 - The first point of the antagonist
   * @param {Vector2} p1 - The second point of the antagonist
   * @param {Vector2[]} [r] - The intersection points
   * References the intersection points if instances intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersectsSegment',
		value: function intersectsSegment(p0, p1, r) {
			return _PolyLine2.default.intersect(_PolyLine2.default.Rectangle2(this).point, [p0, p1], r);
		}

		/**
   * Returns true if the instance intersects with rectangle, false otherwise
   * Alias of {@link Rectangle2.intersect}
   * @param {Rectangle2} rectangle - The antagonist
   * @param {Rectangle2} [point] - The intersection point(s)
   * References the intersection point(s) if obbs intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersects',
		value: function intersects(rectangle, point) {
			if (!Rectangle2.intersect(this.transform, this.extend, rectangle.transform, rectangle.extend)) return false;

			if (point === undefined) return true;

			var polyA = _PolyLine2.default.Rectangle2(this);
			var polyB = _PolyLine2.default.Rectangle2(rectangle);

			_PolyLine2.default.intersect(polyA.point, polyB.point, point);

			for (var i = 0, p = polyA.point[0]; i < 4; p = polyA.point[++i]) {
				if (Rectangle2.intersectPoint(rectangle.transform, rectangle.extend, p)) point.push(p);
			}

			for (i = 0, p = polyB.point[0]; i < 4; p = polyB.point[++i]) {
				if (Rectangle2.intersectPoint(this.transform, this.extend, p)) point.push(p);
			}

			return true;
		}

		/**
   * The transformation of rectangle
   * @param {Rectangle2} rectangle - The source
   * @param {Matrix3} transform - The transform
   * @returns {Rectangle2}
   */

	}, {
		key: 'transformationOf',
		value: function transformationOf(rectangle, transform) {
			this.transform.multiply(transform, rectangle.transform);
			this.extend.copyOf(rectangle.extend);

			return this;
		}

		/**
   * The copy of rectangle
   * @param {Rectangle2} rectangle - The source
   * @returns {Rectangle2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(rectangle) {
			this.transform.copyOf(rectangle.transform);
			this.extend.copyOf(rectangle.extend);

			return this;
		}

		/**
   * The transformation of the instance
   * @param {Matrix3} transform - The transform
   * @returns {Rectangle2}
   */

	}, {
		key: 'transformation',
		value: function transformation(transform) {
			this.transform.multiply(transform, this.transform);

			return this;
		}

		/**
   * Returns a string representation of the instance
   * @returns {string}
   */

	}, {
		key: 'toString',
		value: function toString() {
			return "[Rectangle2]" + "\n" + this.transform.toString() + "\n" + this.extend.toString();
		}
	}, {
		key: 'center',
		get: function get() {
			return new _Vector2.default([this.transform.n[6], this.transform.n[7]]);
		},
		set: function set(v) {
			this.transform.n[6] = v.n[0];
			this.transform.n[7] = v.n[1];
		}

		/**
   * The width
   * Alias of {@link Rectangle2#extend}
   * @type number
   */

	}, {
		key: 'width',
		get: function get() {
			return this.extend.n[0] * 2.0;
		},
		set: function set(n) {
			this.extend.n[0] = n * 0.5;
		}

		/**
   * The height
   * Alias of {@link Rectangle#extend}
   * @type number
   */

	}, {
		key: 'height',
		get: function get() {
			return this.extend.n[1] * 2.0;
		},
		set: function set(n) {
			this.extend.n[1] = n * 0.5;
		}

		/**
   * The aspect (w/h)
   * @type number
   */

	}, {
		key: 'aspect',
		get: function get() {
			return this.extend.n[0] / this.extend.n[1];
		}

		/**
   * The area (w*h)
   * @type number
   */

	}, {
		key: 'area',
		get: function get() {
			return this.extend.n[0] * this.extend.n[1] * 4.0;
		}
	}]);

	return Rectangle2;
}();

exports.default = Rectangle2;