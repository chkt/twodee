'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

var _Rectangle = require('./Rectangle2');

var _Rectangle2 = _interopRequireDefault(_Rectangle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Returns true if colinear segments (p0,p1) and (q0,q1) overlap, false otherwise
 * @private
 * @param {Vector2} p0 - The first point of the first segment
 * @param {Vector2} p1 - The second point of the first segment
 * @param {Vector2} q0 - The first point of the second segment
 * @param {Vector2} q1 - The second point of the second segment
 * @param {Vector2} [r] - The intersection point
 * References the center of the overlap if segments overlap
 * @returns {boolean}
 */
function _intersectColinearSegments(p0, p1, q0, q1, r) {
	var va = _Vector2.default.Subtract(p1, p0),
	    i = Math.abs(va.n[1]) < Math.abs(va.n[0]) ? 0 : 1;
	var o = p0.n[i],
	    sp1 = va.n[i],
	    sq0 = q0.n[i] - o,
	    sq1 = q1.n[i] - o;

	var _ref = 0.0 < sp1 ? [0.0, sp1] : [sp1, 0.0];

	var _ref2 = _slicedToArray(_ref, 2);

	var pmin = _ref2[0];
	var pmax = _ref2[1];

	var _ref3 = sq0 < sq1 ? [sq0, sq1] : [sq1, sq0];

	var _ref4 = _slicedToArray(_ref3, 2);

	var qmin = _ref4[0];
	var qmax = _ref4[1];


	if (pmax - qmin < 0 || qmax - pmin < 0) return false;

	if (r !== undefined) {
		var sr0 = Math.max(pmin, qmin) / sp1;
		var sr1 = Math.min(pmax, qmax) / sp1;
		var vs = _Vector2.default.Copy(va).multiplyScalarEQ(sr0);

		r.copyOf(va).multiplyScalarEQ(sr1).subtractEQ(vs).multiplyScalarEQ(0.5).addEQ(vs).addEQ(p0);
	}

	return true;
}

/**
 * Planar geometric primitive, first order
 */

var PolyLine2 = function () {
	_createClass(PolyLine2, null, [{
		key: 'ConvexHullGraham',


		/**
   * Returns a new instance from the convex hull of point
   * Using graham scanning
   * @constructor
   * @param {Vector2[]} point - The points
   * @param {PolyLine2} [target] - The target instance
   * @returns {PolyLine2}
   */
		value: function ConvexHullGraham(point, target) {
			function convex(point, r) {
				if (point.length !== 0 && point[point.length - 1] === r) return;

				for (; point.length > 1;) {
					var pn = point[point.length - 2].n;
					var qn = point[point.length - 1].n;
					var rn = r.n;

					if ((qn[0] - pn[0]) * (rn[1] - pn[1]) - (rn[0] - pn[0]) * (qn[1] - pn[1]) > 0.0) break;

					point.pop();
				}

				point.push(r);
			}

			var sort = point.slice(0),
			    bottom = [],
			    top = [];

			sort.sort(function (a, b) {
				return a.n[0] - b.n[0] || a.n[1] - b.n[1];
			});

			for (var i = 0, p = sort[0]; p !== undefined; p = sort[++i]) {
				convex(bottom, p);
			}sort.reverse();

			for (i = 0, p = sort[0]; p !== undefined; p = sort[++i]) {
				convex(top, p);
			}bottom = bottom.concat(top.slice(1, -1), bottom[0]);

			if (target) PolyLine2.call(target, bottom);else target = new PolyLine2(bottom);

			return target;
		}

		/**
   * Returns a new instance from rectangle
   * @constructor
   * @param {Rectangle2} rectangle - The source
   * @param {PolyLine2} [target] - The target instance
   * @returns {PolyLine2}
   */

	}, {
		key: 'Rectangle2',
		value: function Rectangle2(rectangle, target) {
			var en = rectangle.extend.n;

			var point = [new _Vector2.default([-en[0], -en[1]]), new _Vector2.default([-en[0], en[1]]), new _Vector2.default([en[0], en[1]]), new _Vector2.default([en[0], -en[1]])];

			point.push(point[0]);

			if (target) PolyLine2.call(target, point);else target = new PolyLine2(point);

			target.transform(rectangle.transform);

			return target;
		}

		/**
   * Returns an instance representing the transformation of poly
   * @param {PolyLine2} poly - The source
   * @param {Matrix3} transform - The transform
   * @param {PolyLine2} [target] - The target instance
   * @return {Polyline2}
   */

	}, {
		key: 'Transformation',
		value: function Transformation(poly, transform, target) {
			if (target === undefined) target = new PolyLine2();

			return target.transformationOf(poly, transform);
		}

		/**
   * Returns a copy of poly
   * @constructor
   * @param {PolyLine2} poly - The source
   * @param {PolyLine2} [target] - The target instance
   * @returns {PolyLine2}
   */

	}, {
		key: 'Copy',
		value: function Copy(poly, target) {
			if (target === undefined) target = new PolyLine2();

			return target.copyOf(poly);
		}

		/**
   * Returns true if segment (p0,p1) intersects segment (q0,q1), false otherwise (RRp781)
   * @param {Vector2} p0 - The first point of the first segment
   * @param {Vector2} p1 - The second point of the first segment
   * @param {Vector2} q0 - The first point of the second segment
   * @param {Vector2} q1 - The second point of the second segment
   * @param {Vector2} [r] - The intersection point
   * References the intersection point if segments intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersectSegments',
		value: function intersectSegments(p0, p1, q0, q1, r) {
			var vA = _Vector2.default.Subtract(q1, q0);
			var vBp = _Vector2.default.Subtract(p1, p0).perpendicular();
			var f = _Vector2.default.dot(vA, vBp);

			var vC = _Vector2.default.Subtract(p0, q0);
			var a = _Vector2.default.dot(vC, _Vector2.default.Perpendicular(vA));

			if (f === 0.0) return a === 0.0 && _intersectColinearSegments(p0, p1, q0, q1, r);

			if (f > 0.0 && (a < 0.0 || a > f) || f < 0.0 && (a > 0.0 || a < f)) return false;

			var b = _Vector2.default.dot(vC, vBp);

			if (f > 0.0 && (b < 0.0 || b > f) || f < 0.0 && (b > 0.0 || b < f)) return false;

			if (r !== undefined) r.copyOf(vA).multiplyScalarEQ(a / f).addEQ(p0);

			return true;
		}

		/**
   * Returns true if pN intersects qN, false otherwise
   * @param {Vector2[]} pN - The first array of points
   * @param {Vector2[]} qN - The second array of points
   * @param {Vector2[]} [r] - The intersection point(s)
   * References the intersection point(s) if primitives intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersect',
		value: function intersect(pN, qN, r) {
			if (!r) {
				for (var i = 0, p0 = pN[0], p1 = pN[1]; p1; p0 = pN[++i], p1 = pN[i + 1]) {
					for (var j = 0, q0 = qN[0], q1 = qN[1]; q1; q0 = qN[++j], q1 = qN[j + 1]) {
						if (PolyLine2.intersectSegments(p0, p1, q0, q1)) return true;
					}
				}

				return false;
			}

			var rr = [],
			    v = new _Vector2.default();

			for (var _i = 0, _p = pN[0], _p2 = pN[1]; _p2; _p = pN[++_i], _p2 = pN[_i + 1]) {
				for (var _j = 0, _q = qN[0], _q2 = qN[1]; _q2; _q = qN[++_j], _q2 = qN[_j + 1]) {
					if (PolyLine2.intersectSegments(_p, _p2, _q, _q2, v)) rr.push(_Vector2.default.Copy(v));
				}
			}

			if (!rr.length) return false;

			r.splice.apply(r, [0, r.length].concat(rr));

			return true;
		}

		/**
   * Creates a new instance
   * @param {Vector2[]} point - The points
   */

	}]);

	function PolyLine2(point) {
		_classCallCheck(this, PolyLine2);

		/**
   * The points
   * @type Vector2[]
   */
		this.point = point || [];
	}

	/**
  * Redefines the instance
  * @param {Vector2[]} [point] - The points
  * @returns {PolyLine2}
  */


	_createClass(PolyLine2, [{
		key: 'define',
		value: function define(point) {
			this.constructor.call(point);

			return this;
		}

		/**
   * The number of segments
   * @type int
   */

	}, {
		key: 'intersects',


		/**
   * Returns true if the instance intersects with poly, false otherwise
   * Alias for {@link PolyLine2.intersect}
   * @param {PolyLine2} poly - The antagonist
   * @param {Vector2[]} [point] - The intersection points
   * References the intersection points if polylines intersect
   * @returns {boolean}
   */
		value: function intersects(poly, point) {
			return PolyLine2.intersect(this.point, poly.point, point);
		}

		/**
   * The transformation of poly
   * @param {PolyLine2} poly - The source
   * @param {Matrix3} transform - The transform
   * @returns {PolyLine2}
   */

	}, {
		key: 'transformationOf',
		value: function transformationOf(poly, transform) {
			var p = poly.point;
			var q = this.point = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = p[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var point = _step.value;
					q.push(_Vector2.default.Multiply2x3Matrix3(transform, point));
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

			return this;
		}

		/**
   * The copy of poly
   * @param {PolyLine2} poly - The source
   * @returns {PolyLine2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(poly) {
			this.point = [];

			for (var i = 0, point = poly.point[0]; point; point = poly.point[++i]) {
				this.point.push(_Vector2.default.Copy(point));
			}return this;
		}

		/**
   * The transformation of the instance
   * @param {Matrix3} transform - The transform
   * @returns {PolyLine2}
   */

	}, {
		key: 'transformation',
		value: function transformation(transform) {
			return this.transformationOf(this, transform);
		}

		/**
   * Returns a string representation of the instance
   * @returns {string}
   */

	}, {
		key: 'toString',
		value: function toString() {
			return '[PolyLine2]\t' + this.segments;
		}
	}, {
		key: 'segments',
		get: function get() {
			return this.point.length - 1;
		}

		/**
   * true if the first and last points are identical (===), false otherwise
   * @type boolean
   */

	}, {
		key: 'closed',
		get: function get() {
			return this.point[0] === this.point[this.point.length - 1];
		}
	}]);

	return PolyLine2;
}();

exports.default = PolyLine2;