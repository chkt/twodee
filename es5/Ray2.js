'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Returns true if colinear rays (pa,oa) and (pb,ob) overlap, false otherwise
 * @private
 * @param {Vector2} pa - The origin of the first ray
 * @param {Vector2} oa - The orientation of the first ray
 * @param {Vector2} pb - The origin of the second ray
 * @param {Vector2} ob - The orientation of the second ray
 * @param {Vector2} [r] - The intersection point
 * @returns {boolean}
 */
function _intersectColinearRays(pa, oa, pb, ob, r) {
	var i = Math.abs(oa.n[1]) < Math.abs(oa.n[0]) ? 0 : 1;

	var sgna = Math.sign(oa.n[i]),
	    sgnb = Math.sign(ob.n[i]),
	    len = pb.n[i] - pa.n[i];

	if (len * sgna < 0.0 && len * sgnb > 0.0) return false;

	if (r !== undefined) r.copyOf(oa).multiplyScalarEQ(len * -sgna * 0.5 + len * sgnb * 0.5).addEQ(pa);

	return true;
}

/**
 * Returns true if colinear rays (pa,oa) and segment (q0,q1) overlap, false otherwise
 * @private
 * @param {Vector2} pa - The origin of the ray
 * @param {Vector2} oa - The orientation of the ray
 * @param {Vector2} q0 - The first point of the segment
 * @param {Vector2} q1 - The second point of the segment
 * @param {Vector2} [r] - The intersection point
 * @returns {boolean}
 */
function _intersectColinearRaySegment(pa, oa, q0, q1, r) {
	var i = Math.abs(oa.n[1]) < Math.abs(oa.n[0]) ? 0 : 1;

	var o = pa.n[i],
	    sgn = Math.sign(oa.n[i]),
	    sq0 = (q0.n[i] - o) * sgn,
	    sq1 = (q1.n[i] - o) * sgn;

	var _ref = sq0 < sq1 ? [sq0, sq1] : [sq1, sq0],
	    _ref2 = _slicedToArray(_ref, 2),
	    qmin = _ref2[0],
	    qmax = _ref2[1];

	if (qmax < 0.0) return false;

	if (r !== undefined) r.copyOf(oa).multiplyScalarEQ((qmax - (qmax - Math.max(qmin, 0.0)) * 0.5) * sgn).addEQ();

	return true;
}

/**
 * Planar Ray
 */

var Ray2 = function () {
	_createClass(Ray2, null, [{
		key: 'Define',


		/**
   * Returns a defined instance
   * @param {Vector2} origin - The ray origin
   * @param {Vector2} orientation - The ray orientation
   * @param {Ray2} [target] - The target instance
   * @returns {Ray2}
   */
		value: function Define(origin, orientation, target) {
			if (target === undefined) return new Ray2(origin, orientation);

			this.constructor.call(this, origin, orientation, target);

			return this;
		}

		/**
   * Returns true if ray (pa,oa) intersects line segment (q0,q1), false otherwise
   * @param {Vector2} pa - The ray origin
   * @param {Vector2} oa - The ray orientation
   * @param {Vector2} q0 - The first point of the line segment
   * @param {Vector2} q1 - The second point of the line segment
   * @param {Vector2} [r] - The intersection point
   * @returns {boolean}
   */

	}, {
		key: 'intersectSegment',
		value: function intersectSegment(pa, oa, q0, q1, r) {
			var va = _Vector2.default.Subtract(q1, q0);
			var vbp = _Vector2.default.Perpendicular(oa);
			var f = _Vector2.default.dot(va, vbp);

			var vc = _Vector2.default.Subtract(pa, q0);
			var a = _Vector2.default.dot(vc, _Vector2.default.Perpendicular(va));

			if (f === 0.0) return a === 0.0 && _intersectColinearRaySegment(pa, oa, q0, q1, r);

			if (f > 0.0 && a < 0.0 || f < 0.0 && a > 0.0) return false;

			var b = _Vector2.default.dot(vc, vbp);

			if (f > 0.0 && (b < 0.0 || b > f) || f < 0.0 && (b > 0.0 || b < f)) return false;

			if (r !== undefined) r.copyOf(oa).multiplyScalarEQ(a / f).addEQ(pa);

			return true;
		}

		/**
   * Returns true if ray (pa,oa) and ray (pb,ob) intersect, false otherwise
   * @param {Vector2} pa - The origin of the first ray
   * @param {Vector2} oa - The orientation of the first ray
   * @param {Vector2} pb - The origin of the second ray
   * @param {Vector2} ob - The orientation of the second ray
   * @param {Vector2} [r] - The intersection point
   * @returns {boolean}
   */

	}, {
		key: 'intersect',
		value: function intersect(pa, oa, pb, ob, r) {
			var vbp = _Vector2.default.Perpendicular(oa);
			var f = _Vector2.default.dot(ob, vbp);

			var vc = _Vector2.default.Subtract(pa, pb);
			var a = _Vector2.default.dot(vc, _Vector2.default.Perpendicular(oa));

			if (f === 0.0) return a === 0.0 && _intersectColinearRays(pa, oa, pb, ob, r);

			if (f > 0.0 && a < 0.0 || f < 0.0 && a > 0.0) return false;

			var b = _Vector2.default.dot(vc, vbp);

			if (f > 0.0 && b < 0.0 || f < 0.0 && b > 0.0) return false;

			if (r !== undefined) r.copyOf(oa).multiplyScalarEQ(a / f).addEQ(pa);

			return true;
		}

		/**
   * Returns true if a and b represent the same ray (a == b), false otherwise
   * @param {Ray2} a - The protagonist
   * @param {Ray2} b - The antagonist
   * @returns {boolean}
   */

	}, {
		key: 'isEQ',
		value: function isEQ(a, b) {
			return a === b || _Vector2.default.isEQ(a.origin, b.origin) && _Vector2.default.isEQ(a.orientation, b.orientation);
		}

		/**
   * Creates a new instance
   * @param {Vector2} origin - The ray origin
   * @param {Vector2} orientation - The orientation
   */

	}]);

	function Ray2(origin, orientation) {
		_classCallCheck(this, Ray2);

		/**
   * The origin
   * @type {Vector2}
   */
		this.origin = origin;
		/**
   * The orientation
   * @type {Vector2}
   */
		this.orientation = orientation;
	}

	/**
  * Redefines the instance
  * @param {Vector2} origin - The ray origin
  * @param {Vector2} orientation - The orientation
  * @returns {Ray2}
  */


	_createClass(Ray2, [{
		key: 'define',
		value: function define(origin, orientation) {
			this.constructor.call(this, origin, orientation);

			return this;
		}

		/**
   * Returns true if the instance intersects line segment (p0, p1), false otherwise
   * @param {Vector2} p0 - The first point of the segment
   * @param {Vector2} p1 - The second point of the segment
   * @param {Vector2} [r] - The intersection point
   * @returns {boolean}
   */

	}, {
		key: 'intersectsSegment',
		value: function intersectsSegment(p0, p1, r) {
			return Ray2.intersectSegment(this.origin, this.orientation, p0, p1, r);
		}

		/**
   * Returns true if the instance intersects ray, false otherwise
   * @param {Ray2} ray - The antagonist
   * @param {Vector2} [r] - The intersection point
   * @returns {boolean}
   */

	}, {
		key: 'intersects',
		value: function intersects(ray, r) {
			return Ray2.intersect(this.origin, this.orientation, ray.origin, ray.orientation, r);
		}

		/**
   * The copy of ray
   * @param {Ray2} ray - The source
   * @returns {Ray2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(ray) {
			this.origin = _Vector2.default.Copy(ray.origin);
			this.orientation = _Vector2.default.Copy(ray.orientation);

			return this;
		}

		/**
   * Returns a string representation of the instance
   * @param {int} [digits=3] - The decimal digits
   * @returns {string}
   */

	}, {
		key: 'toString',
		value: function toString() {
			var digits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

			return '[Ray2] ' + this.origin.toString(digits) + ' ' + this.orientation.toString(digits);
		}
	}]);

	return Ray2;
}();

exports.default = Ray2;