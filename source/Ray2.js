import Vector2 from 'xyzw/es5/Vector2';



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
	const i = Math.abs(oa.n[1]) < Math.abs(oa.n[0]) ? 0 : 1;

	const sgna = Math.sign(oa.n[i]), sgnb = Math.sign(ob.n[i]), len = pb.n[i] - pa.n[i];

	if (len * sgna < 0.0 && len * sgnb > 0.0) return false;

	if (r !== undefined) r
		.copyOf(oa)
		.multiplyScalarEQ(len * -sgna * 0.5 + len * sgnb * 0.5)
		.addEQ(pa);

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
	const i = Math.abs(oa.n[1]) < Math.abs(oa.n[0]) ? 0 : 1;

	const o = pa.n[i], sgn = Math.sign(oa.n[i]), sq0 = (q0.n[i] - o) * sgn, sq1 = (q1.n[i] - o) * sgn;
	const [qmin, qmax] = sq0 < sq1 ? [sq0, sq1] : [sq1, sq0];

	if (qmax < 0.0) return false;

	if (r !== undefined) r
		.copyOf(oa)
		.multiplyScalarEQ((qmax - (qmax - Math.max(qmin, 0.0)) * 0.5) * sgn)
		.addEQ();

	return true;
}



/**
 * Planar Ray
 */
export default class Ray2 {

	/**
	 * Returns a defined instance
	 * @param {Vector2} origin - The ray origin
	 * @param {Vector2} orientation - The ray orientation
	 * @param {Ray2} [target] - The target instance
	 * @returns {Ray2}
	 */
	static Define(origin, orientation, target) {
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
	static intersectSegment(pa, oa, q0, q1, r) {
		const va = Vector2.Subtract(q1, q0);
		const vbp = Vector2.Perpendicular(oa);
		const f = Vector2.dot(va, vbp);

		const vc = Vector2.Subtract(pa, q0);
		const a = Vector2.dot(vc, Vector2.Perpendicular(va));

		if (f === 0.0) return a === 0.0 && _intersectColinearRaySegment(pa, oa, q0, q1, r);

		if (f > 0.0 && a < 0.0 || f < 0.0 && a > 0.0) return false;

		const b = Vector2.dot(vc, vbp);

		if (f > 0.0 && (b < 0.0 || b > f) || f < 0.0 && (b > 0.0 || b < f)) return false;

		if (r !== undefined) r
			.copyOf(oa)
			.multiplyScalarEQ(a / f)
			.addEQ(pa);

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
	static intersect(pa, oa, pb, ob, r) {
		const vbp = Vector2.Perpendicular(oa);
		const f = Vector2.dot(ob, vbp);

		const vc = Vector2.Subtract(pa, pb);
		const a = Vector2.dot(vc, Vector2.Perpendicular(oa));

		if (f === 0.0) return a === 0.0 && _intersectColinearRays(pa, oa, pb, ob, r);

		if (f > 0.0 && a < 0.0 || f < 0.0 && a > 0.0) return false;

		const b = Vector2.dot(vc, vbp);

		if (f > 0.0 && b < 0.0 || f < 0.0 && b > 0.0) return false;

		if (r !== undefined) r
			.copyOf(oa)
			.multiplyScalarEQ(a / f)
			.addEQ(pa);

		return true;
	}


	/**
	 * Returns true if a and b represent the same ray (a == b), false otherwise
	 * @param {Ray2} a - The protagonist
	 * @param {Ray2} b - The antagonist
	 * @returns {boolean}
	 */
	static isEQ(a, b) {
		return a === b || Vector2.isEQ(a.origin, b.origin) && Vector2.isEQ(a.orientation, b.orientation);
	}


	/**
	 * Creates a new instance
	 * @param {Vector2} origin - The ray origin
	 * @param {Vector2} orientation - The orientation
	 */
	constructor(origin, orientation) {
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
	define(origin, orientation) {
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
	intersectsSegment(p0, p1, r) {
		return Ray2.intersectSegment(this.origin, this.orientation, p0, p1, r);
	}

	/**
	 * Returns true if the instance intersects ray, false otherwise
	 * @param {Ray2} ray - The antagonist
	 * @param {Vector2} [r] - The intersection point
	 * @returns {boolean}
	 */
	intersects(ray, r) {
		return Ray2.intersect(this.origin, this.orientation, ray.origin, ray.orientation, r);
	}


	/**
	 * The copy of ray
	 * @param {Ray2} ray - The source
	 * @returns {Ray2}
	 */
	copyOf(ray) {
		this.origin = Vector2.Copy(ray.origin);
		this.orientation = Vector2.Copy(ray.orientation);

		return this;
	}


	/**
	 * Returns a string representation of the instance
	 * @param {int} [digits=3] - The decimal digits
	 * @returns {string}
	 */
	toString(digits = 3) {
		return `[Ray2] ${ this.origin.toString(digits) } ${ this.orientation.toString(digits) }`;
	}
}
