'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.DEGENERATE = exports.CCW = exports.CW = undefined;

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
 * The clockwise orientation sign
 * @type {number}
 */
var CW = exports.CW = 1;
/**
 * The counter-clockwise orientation sign
 * @type {number}
 */
var CCW = exports.CCW = -1;
/**
 * The degenerate orientation sign
 * @type {number}
 */
var DEGENERATE = exports.DEGENERATE = 0;

var MATH_THIRD = 1.0 / 3.0;

/**
 * Planar geometric primitive, second order
 */

var Triangle2 = function () {
	_createClass(Triangle2, null, [{
		key: 'Equilateral',


		/**
   * Returns an instance representing the equilateral triangle circumscribed|inscribed by r, rotated by rad
   * @param {Vector2} p - The centroid point
   * @param {number} r - The distance between centroid and point
   * @param {number} [rad=0.0] - The angle
   * @param {boolean} [f=0.0] - The inscription factor
   * @param {Triangle2} [target] - The target instance
   * @returns {Triangle2}
   */
		value: function Equilateral(p, r) {
			var rad = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0;
			var f = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.0;
			var target = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;

			if (f !== undefined) r = _Math2.default.mix(r, r / _Math2.default.cos(_Math2.default.PI / 3.0), f);

			if (target === undefined) target = new Triangle2();

			var sin = _Math2.default.sin,
			    cos = _Math2.default.cos;

			var PI2d3 = _Math2.default.PI * 2.0 / 3.0 + rad;
			var PI4d3 = _Math2.default.PI * 4.0 / 3.0 + rad;

			target.p0.n = [p.n[0] + r * cos(rad), p.n[1] + r * sin(rad)];
			target.p1.n = [p.n[0] + r * cos(PI2d3), p.n[1] + r * sin(PI2d3)];
			target.p2.n = [p.n[0] + r * cos(PI4d3), p.n[1] + r * sin(PI4d3)];

			return target;
		}

		/**
   * Returns an instance representing the transformation of triangle
   * @param {Triangle2} triangle - The source
   * @param {Matrix3} transform - The transform
   * @param {Triangle2} [target] - The target instance
   * @returns {Triangle2}
   */

	}, {
		key: 'Transformation',
		value: function Transformation(triangle, transform, target) {
			if (target === undefined) target = new Triangle2();

			return target.transformationOf(triangle, transform);
		}

		/**
   * Returns a copy of triangle
   * @param {Triangle2} triangle - The source
   * @param {Triangle2} [target] - The target instance
   * @returns {Triangle2}
   */

	}, {
		key: 'Copy',
		value: function Copy(triangle, target) {
			if (target === undefined) target = new Triangle2();

			target.p0.copyOf(triangle.p0);
			target.p1.copyOf(triangle.p1);
			target.p2.copyOf(triangle.p2);

			return target;
		}

		/**
   * Returns a Vector2 representing the centroid of triangle (p0,p1,p2)
   * @param {Vector2} p0 - The first point
   * @param {Vector2} p1 - The second point
   * @param {Vector2} p2 - The third point
   * @returns {Vector2}
   */

	}, {
		key: 'centroid',
		value: function centroid(p0, p1, p2) {
			return _Vector2.default.BarycentricUV(p0, p1, p2, MATH_THIRD, MATH_THIRD);
		}

		/**
   * Returns a Vector2 representing the circumcenter of triangle (p0,p1,p2)
   * @param {Vector2} p0 - The first point
   * @param {Vector2} p1 - The second point
   * @param {Vector2} p2 - The third point
   * @returns {Vector2}
   */

	}, {
		key: 'circumcenter',
		value: function circumcenter(p0, p1, p2) {
			var m0 = p0.normSquared,
			    m1 = p1.normSquared,
			    m2 = p2.normSquared;
			var n0 = p0.n,
			    n1 = p1.n,
			    n2 = p2.n;

			var s0y1y = n0[1] - n1[1],
			    s1y2y = n1[1] - n2[1],
			    s2y0y = n2[1] - n0[1];

			var d = 1.0 / (2.0 * (n0[0] * s1y2y + n1[0] * s2y0y + n2[0] * s0y1y));

			var x = (m0 * s1y2y + m1 * s2y0y + m2 * s0y1y) * d;
			var y = (m0 * (n2[0] - n1[0]) + m1 * (n0[0] - n2[0]) + m2 * (n1[0] - n0[0])) * d;

			return new _Vector2.default([x, y]);
		}

		/**
   * Returns the area (1/2)|AB x AC| of triangle (p0,p1,p2)
   * @param {Vector2} p0 - The first point
   * @param {Vector2} p1 - The second point
   * @param {Vector2} p2 - The third point
   * @returns {number}
   */

	}, {
		key: 'area',
		value: function area(p0, p1, p2) {
			var a = _Vector2.default.Subtract(p1, p0);
			var b = _Vector2.default.Subtract(p2, p0);

			return _Math2.default.abs(_Vector2.default.cross(a, b)) * 0.5;
		}

		/**
   * Returns true if the circumcircle of ccw triangle (p0,p1,p2) intersects with point (q0), false otherwise
   * @param {Vector2} p0 - The first point of the triangle
   * @param {Vector2} p1 - The second point of the triangle
   * @param {Vector2} p2 - The third point of the triangle
   * @param {Vector2} q0 - The antagonist
   * @returns {boolean}
   */

	}, {
		key: 'intersectPointCircumcircle',
		value: function intersectPointCircumcircle(p0, p1, p2, q0) {
			var p0n = p0.n,
			    p1n = p1.n,
			    p2n = p2.n,
			    qn = q0.n;
			var p0x = p0n[0],
			    p0y = p0n[1],
			    p1x = p1n[0],
			    p1y = p1n[1],
			    p2x = p2n[0],
			    p2y = p2n[1];
			var qx = qn[0],
			    qy = qn[1],
			    qxx = qx * qx,
			    qyy = qy * qy;

			return new _Matrix2.default([p0x - qx, p0y - qy, p0x * p0x - qxx + (p0y * p0y - qyy), p1x - qx, p1y - qy, p1x * p1x - qxx + (p1y * p1y - qyy), p2x - qx, p2y - qy, p2x * p2x - qxx + (p2y * p2y - qyy)]).determinant > 0.0;
		}

		/**
   * Returns true if triangle (p0,p1,p2) intersects with point (q0), false otherwise
   * @param {Vector2} p0 - The first point of the triangle
   * @param {Vector2} p1 - The second point of the triangle
   * @param {Vector2} p2 - The third point of the triangle
   * @param {Vector2} q - The point
   * @param {number[]} [uv] - Array holding the barycentric (u,v) coordinates
   * References the barycentric intersection coordinates(u,v) if primitives intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersectPoint',
		value: function intersectPoint(p0, p1, p2, q, uv) {
			var vA = _Vector2.default.Subtract(p2, p0);
			var vB = _Vector2.default.Subtract(p1, p0);
			var vC = _Vector2.default.Subtract(q, p0);

			var aa = _Vector2.default.dot(vA, vA);
			var ab = _Vector2.default.dot(vA, vB);
			var ac = _Vector2.default.dot(vA, vC);
			var bb = _Vector2.default.dot(vB, vB);
			var bc = _Vector2.default.dot(vB, vC);

			var d = 1.0 / (aa * bb - ab * ab);
			var u = (bb * ac - ab * bc) * d;
			var v = (aa * bc - ab * ac) * d;

			if (u < 0.0 || v < 0.0 || u + v > 1.0) return false;

			if (uv !== undefined) uv.splice(0, uv.length, u, v);

			return true;
		}

		/**
   * Returns true if triangle (p0,p1,p2) intersects with segment (q0,q1), false otherwise
   * @param {Vector2} p0 - The first point of the triangle
   * @param {Vector2} p1 - The second point of the triangle
   * @param {Vector2} p2 - The third point of the triangle
   * @param {Vector2} q0 - The first point of the segment
   * @param {Vector2} q1 - The second point of the segment
   * @param {Vector2[]} [r] - The intersection point(s)
   * References the intersection <em>points</em> if primitives intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersectSegment',
		value: function intersectSegment(p0, p1, p2, q0, q1, r) {
			if (!r && !_PolyLine2.default.intersectSegments(q0, q1, p0, p1) && !_PolyLine2.default.intersectSegments(q0, q1, p1, p2) && !_PolyLine2.default.intersectSegments(q0, q1, p2, p0)) return false;

			if (!r) return true;

			var rN = [],
			    r0 = new _Vector2.default();

			if (_PolyLine2.default.intersectSegments(q0, q1, p0, p1, r0)) rN.push(_Vector2.default.Copy(r0));
			if (_PolyLine2.default.intersectSegments(q0, q1, p1, p2, r0)) rN.push(_Vector2.default.Copy(r0));
			if (_PolyLine2.default.intersectSegments(q0, q1, p2, p0, r0)) rN.push(_Vector2.default.Copy(r0));

			if (!rN.length) return false;

			r.splice.apply(r, [0, r.length].concat(rN));

			return true;
		}

		/**
   * Returns true if triangle (p0,p1,p2) intersects with triangle(q0,q1,q2), false otherwise
   * @param {Vector2} p0 - The first point of the first triangle
   * @param {Vector2} p1 - The second point of the first triangle
   * @param {Vector2} p2 - The third point of the first triangle
   * @param {Vector2} q0 - The first point of the second triangle
   * @param {Vector2} q1 - The second point of the second triangle
   * @param {Vector2} q2 - The third point of the second triangle
   * @param {Vector2[]} [r] - The intersection point(s)
   * References the intersection point(s) if triangles intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersect',
		value: function intersect(p0, p1, p2, q0, q1, q2, r) {
			if (!r && !Triangle2.intersectSegment(p0, p1, p2, q0, q1) && !Triangle2.intersectSegment(p0, p1, p2, q1, q2) && !Triangle2.intersectSegment(p0, p1, p2, q2, q0) && !Triangle2.intersectPoint(p0, p1, p2, q0) && !Triangle2.intersectPoint(q0, q1, q2, p0)) return false;

			if (!r) return true;

			var rN = [],
			    r0 = [];

			if (Triangle2.intersectSegment(p0, p1, p2, q0, q1, r0)) rN.push.apply(rN, r0.slice(0));
			if (Triangle2.intersectSegment(p0, p1, p2, q1, q2, r0)) rN.push.apply(rN, r0.slice(0));
			if (Triangle2.intersectSegment(p0, p1, p2, q2, q0, r0)) rN.push.apply(rN, r0.slice(0));

			if (Triangle2.intersectPoint(p0, p1, p2, q0)) rN.push(q0);
			if (Triangle2.intersectPoint(q0, q1, q2, p0)) rN.push(p0);

			if (!rN.length) return false;

			if (Triangle2.intersectPoint(p0, p1, p2, q1)) rN.push(q1);
			if (Triangle2.intersectPoint(p0, p1, p2, q2)) rN.push(q2);

			if (Triangle2.intersectPoint(q0, q1, q2, p1)) rN.push(p1);
			if (Triangle2.intersectPoint(q0, q1, q2, p2)) rN.push(p2);

			r.splice.apply(r, [0, r.length].concat(rN));

			return true;
		}

		/**
   * Creates a new instance
   * @param {Vector2} [p0] - The first point
   * @param {Vector2} [p1] - The second point
   * @param {Vector2} [p2] - The third point
   */

	}]);

	function Triangle2(p0, p1, p2) {
		_classCallCheck(this, Triangle2);

		/**
   * The first point
   * @type {Vector2}
   */
		this.p0 = p0 || new _Vector2.default();
		/**
   * The second point
   * @type {Vector2}
   */
		this.p1 = p1 || new _Vector2.default();
		/**
   * The third point
   * @type {Vector2}
   */
		this.p2 = p2 || new _Vector2.default();
	}

	/**
  * Redefines the instance
  * @param {Vector2} [p0] - The first point
  * @param {Vector2} [p1] - The second point
  * @param {Vector2} [p2] - The third point
  * @returns {Triangle2}
  */


	_createClass(Triangle2, [{
		key: 'define',
		value: function define(p0, p1, p2) {
			this.constructor.call(this, p0, p1, p2);

			return this;
		}

		/**
   * CW (1) if the instance is cw rotated, CCW (-1) if the instance is ccw rotated, DEGENERATE (0) if the instance is degenerate
   * @type {int}
   */

	}, {
		key: 'intersectsPoint',


		/**
   * Returns true if the instance intersects with point (q), false otherwise
   * Alias of {@link Triangle2.intersectPoint}
   * @param {Vector2} q - The point
   * @param {number[]} [uv] - Array holding the barycentric (u,v) coordinates
   * References the barycentric intersection coordinates(u,v) if primitives intersect
   * @returns {boolean}
   */
		value: function intersectsPoint(q, uv) {
			return Triangle2.intersectPoint(this.p0, this.p1, this.p2, q, uv);
		}

		/**
   * Returns true if the instance intersects with segment (q0,q1), false otherwise
   * Alias of {@link Triangle2.intersectSegment}
   * @param {Vector2} q0 - The first point of the segment
   * @param {Vector2} q1 - The second point of the segment
   * @param {Vector2[]} [r] - The intersection point(s)
   * References the intersection points if instances intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersectsSegment',
		value: function intersectsSegment(q0, q1, r) {
			return Triangle2.intersectSegment(this.p0, this.p1, this.p2, q0, q1, r);
		}

		/**
   * Returns true if the instance intersects with triangle, false otherwise
   * Alias of {@link Triangle2.intersect}
   * @param {Triangle2} triangle - The opposing Triangle
   * @param {Vector2[]} [point] - The intersection point(s)
   * References the intersection points if instances intersect
   * @returns {boolean}
   */

	}, {
		key: 'intersects',
		value: function intersects(triangle, point) {
			return Triangle2.intersect(this.p0, this.p1, this.p2, triangle.p0, triangle.p1, triangle.p2, point);
		}

		/**
   * The transformation of triangle
   * @param {Triangle2} triangle - The source
   * @param {Matrix3} transform - The transform
   * @returns {Triangle2}
   */

	}, {
		key: 'transformationOf',
		value: function transformationOf(triangle, transform) {
			this.p0.multiply2x3Matrix3(transform, triangle.p0);
			this.p1.multiply2x3Matrix3(transform, triangle.p1);
			this.p2.multiply2x3Matrix3(transform, triangle.p2);

			return this;
		}

		/**
   * The copy of triangle
   * @param {Triangle2} triangle - The source
   * @returns {Triangle2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(triangle) {
			this.p0.copyOf(triangle.p0);
			this.p1.copyOf(triangle.p1);
			this.p1.copyOf(triangle.p2);

			return this;
		}

		/**
   * The transformation of the instance
   * @param {Matrix3} transform - The transform
   * @returns {Triangle2}
   */

	}, {
		key: 'transformation',
		value: function transformation(transform) {
			return this.transformationOf(this, transform);
		}

		/**
   * Returns a string representation of the instance
   * @param {int} [digits=3] - The decimal places
   * @returns {string}
   */

	}, {
		key: 'toString',
		value: function toString(digits) {
			return "[Triangle2]" + "\n" + this.p0.toString() + "\n" + this.p1.toString() + "\n" + this.p2.toString();
		}
	}, {
		key: 'orientation',
		get: function get() {
			var vE0 = _Vector2.default.Subtract(this.p1, this.p0);
			var vE1 = _Vector2.default.Subtract(this.p2, this.p0);
			var n = _Vector2.default.cross(vE1, vE0);

			return _Math2.default.sign(n);
		}

		/**
   * The dereferenced centroid point
   * @type {Vector2}
   */

	}, {
		key: 'centroid',
		get: function get() {
			return _Vector2.default.BarycentricUV(this.p0, this.p1, this.p2, MATH_THIRD, MATH_THIRD);
		}

		/**
   * The dereferenced center of the enclosing circle
   * @type {Vector2}
   */

	}, {
		key: 'circumcenter',
		get: function get() {
			return Triangle2.circumcenter(this.p0, this.p1, this.p2);
		}

		/**
   * The area (1/2)|AB x AC|
   * @type {number}
   */

	}, {
		key: 'area',
		get: function get() {
			return Triangle2.area(this.p0, this.p1, this.p2);
		}
	}]);

	return Triangle2;
}();

exports.default = Triangle2;