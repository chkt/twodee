import Math from 'xyzw/es5/Math';
import Vector2 from 'xyzw/es5/Vector2';
import Matrix3 from 'xyzw/es5/Matrix3';

import PolyLine2 from './PolyLine2';



/**
 * The clockwise orientation sign
 * @type {number}
 */
export const CW = 1;
/**
 * The counter-clockwise orientation sign
 * @type {number}
 */
export const CCW = -1;
/**
 * The degenerate orientation sign
 * @type {number}
 */
export const DEGENERATE = 0;


const MATH_THIRD = 1.0 / 3.0;



/**
 * Planar geometric primitive, second order
 */
export default class Triangle2 {

	/**
	 * Returns an instance representing the equilateral triangle circumscribed|inscribed by r, rotated by rad
	 * @constructor
	 * @param {Vector2} p - The centroid point
	 * @param {number} r - The distance between centroid and point
	 * @param {number} [rad=0.0] - The angle
	 * @param {boolean} [f=0.0] - The inscription factor
	 * @param {Triangle2} [target] - The target instance
	 * @returns {Triangle2}
	 */
	static Equilateral(p, r, rad = 0.0, f = 0.0, target = undefined) {
		if (f !== undefined) r = Math.mix(r, r / Math.cos(Math.PI / 3.0), f);

		if (target === undefined) target = new Triangle2();

		const sin = Math.sin, cos = Math.cos;

		const PI2d3 = Math.PI * 2.0 / 3.0 + rad;
		const PI4d3 = Math.PI * 4.0 / 3.0 + rad;

		target.p0.n = [p.n[0] + r * cos(rad)  , p.n[1] + r * sin(rad)];
		target.p1.n = [p.n[0] + r * cos(PI2d3), p.n[1] + r * sin(PI2d3)];
		target.p2.n = [p.n[0] + r * cos(PI4d3), p.n[1] + r * sin(PI4d3)];

		return target;
	}

	/**
	 * Returns an instance representing the transformation of triangle
	 * @constructor
	 * @param {Triangle2} triangle - The source
	 * @param {Matrix3} transform - The transform
	 * @param {Triangle2} [target] - The target instance
	 * @returns {Triangle2}
	 */
	static Transformation(triangle, transform, target) {
		if (target === undefined) target = new Triangle2();

		return target.transformationOf(triangle, transform);
	}

	/**
	 * Returns a copy of triangle
	 * @param {Triangle2} triangle - The source
	 * @param {Triangle2} [target] - The target instance
	 * @returns {Triangle2}
	 */
	static Copy(triangle, target) {
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
	static centroid(p0, p1, p2) {
		return Vector2.BarycentricUV(p0, p1, p2, MATH_THIRD, MATH_THIRD);
	}

	/**
	 * Returns a Vector2 representing the circumcenter of triangle (p0,p1,p2)
	 * @param {Vector2} p0 - The first point
	 * @param {Vector2} p1 - The second point
	 * @param {Vector2} p2 - The third point
	 * @returns {Vector2}
	 */
	static circumcenter(p0, p1, p2) {
		const m0 = p0.normSquared, m1 = p1.normSquared, m2 = p2.normSquared;
		const n0 = p0.n, n1 = p1.n, n2 = p2.n;

		const s0y1y = n0[1] - n1[1], s1y2y = n1[1] - n2[1], s2y0y = n2[1] - n0[1];

		const d = 1.0 / (2.0 * (n0[0] * s1y2y + n1[0] * s2y0y + n2[0] * s0y1y));

		const x = (m0 *  s1y2y          + m1 *  s2y0y          + m2 *  s0y1y         ) * d;
		const y = (m0 * (n2[0] - n1[0]) + m1 * (n0[0] - n2[0]) + m2 * (n1[0] - n0[0])) * d;

		return new Vector2([x, y]);
	}


	/**
	 * Returns true if the circumcircle of ccw triangle (p0,p1,p2) intersects with point (q0), false otherwise
	 * @param {Vector2} p0 - The first point of the triangle
	 * @param {Vector2} p1 - The second point of the triangle
	 * @param {Vector2} p2 - The third point of the triangle
	 * @param {Vector2} q0 - The antagonist
	 * @returns {boolean}
	 */
	static intersectPointCircumcircle(p0, p1, p2, q0) {
		const p0n = p0.n, p1n = p1.n, p2n = p2.n, qn = q0.n;
		const p0x = p0n[0], p0y = p0n[1], p1x = p1n[0], p1y = p1n[1], p2x = p2n[0], p2y = p2n[1];
		const qx = qn[0], qy = qn[1], qxx = qx * qx, qyy = qy * qy;

		return new Matrix3([
			p0x - qx, p0y - qy, (p0x * p0x - qxx) + (p0y * p0y - qyy),
			p1x - qx, p1y - qy, (p1x * p1x - qxx) + (p1y * p1y - qyy),
			p2x - qx, p2y - qy, (p2x * p2x - qxx) + (p2y * p2y - qyy)
		]).determinant > 0.0;
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
	static intersectPoint(p0, p1, p2, q, uv) {
		const vA = Vector2.Subtract(p2, p0);
		const vB = Vector2.Subtract(p1, p0);
		const vC = Vector2.Subtract(q , p0);

		const aa = Vector2.dot(vA, vA);
		const ab = Vector2.dot(vA, vB);
		const ac = Vector2.dot(vA, vC);
		const bb = Vector2.dot(vB, vB);
		const bc = Vector2.dot(vB, vC);

		const d = 1.0 / (aa * bb - ab * ab);
		const u = (bb * ac - ab * bc) * d;
		const v = (aa * bc - ab * ac) * d;

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
	static intersectSegment(p0, p1, p2, q0, q1, r) {
		if (
			!r &&
			!PolyLine2.intersectSegments(q0, q1, p0, p1) &&
			!PolyLine2.intersectSegments(q0, q1, p1, p2) &&
			!PolyLine2.intersectSegments(q0, q1, p2, p0)
		) return false;

		if (!r) return true;

		const rN = [], r0 = new Vector2();

		if (PolyLine2.intersectSegments(q0, q1, p0, p1, r0)) rN.push(Vector2.Copy(r0));
		if (PolyLine2.intersectSegments(q0, q1, p1, p2, r0)) rN.push(Vector2.Copy(r0));
		if (PolyLine2.intersectSegments(q0, q1, p2, p0, r0)) rN.push(Vector2.Copy(r0));

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
	static intersect(p0, p1, p2, q0, q1, q2, r) {
		if (
			!r &&
			!Triangle2.intersectSegment(p0, p1, p2, q0, q1) &&
			!Triangle2.intersectSegment(p0, p1, p2, q1, q2) &&
			!Triangle2.intersectSegment(p0, p1, p2, q2, q0) &&
			!Triangle2.intersectPoint(p0, p1, p2, q0) &&
			!Triangle2.intersectPoint(q0, q1, q2, p0)
		) return false;

		if (!r) return true;

		const rN = [], r0 = [];

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
	constructor(p0, p1, p2) {
		/**
		 * The first point
		 * @type Vector2
		 */
		this.p0 = p0 || new Vector2();
		/**
		 * The second point
		 * @type Vector2
		 */
		this.p1 = p1 || new Vector2();
		/**
		 * The third point
		 * @type Vector2
		 */
		this.p2 = p2 || new Vector2();
	}


	/**
	 * Redefines the instance
	 * @param {Vector2} [p0] - The first point
	 * @param {Vector2} [p1] - The second point
	 * @param {Vector2} [p2] - The third point
	 * @returns {Triangle2}
	 */
	define(p0, p1, p2) {
		this.constructor.call(this, p0, p1, p2);

		return this;
	}


	/**
	 * CW (1) if the instance is cw rotated, CCW (-1) if the instance is ccw rotated, DEGENERATE (0) if the instance is degenerate
	 * @type int
	 */
	get orientation() {
		const vE0 = Vector2.Subtract(this.p1, this.p0);
		const vE1 = Vector2.Subtract(this.p2, this.p0);
		const n   = Vector2.cross(vE1, vE0);

		return Math.sign(n);
	}

	/**
	 * The dereferenced centroid point
	 * @type Vector2
	 */
	get centroid() {
		return Vector2.BarycentricUV(this.p0, this.p1, this.p2, MATH_THIRD, MATH_THIRD);
	}

	/**
	 * The dereferenced center of the enclosing circle
	 * @type Vector2
	 */
	get circumcenter() {
		return Triangle2.circumcenter(this.p0, this.p1, this.p2);
	}

	/**
	 * The area (1/2)|AB x AC|
	 * @type number
	 */
	get area() {
		const vA = Vector2.Subtract(this.p1, this.p0);
		const vB = Vector2.Subtract(this.p2, this.p0);

		return Math.abs(Vector2.cross(vA, vB)) * 0.5;
	}


	/**
	 * Returns true if the instance intersects with point (q), false otherwise
	 * Alias of {@link Triangle2.intersectPoint}
	 * @param {Vector2} q - The point
	 * @param {number[]} [uv] - Array holding the barycentric (u,v) coordinates
	 * References the barycentric intersection coordinates(u,v) if primitives intersect
	 * @returns {boolean}
	 */
	intersectsPoint(q, uv) {
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
	intersectsSegment(q0, q1, r) {
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
	intersects(triangle, point) {
		return Triangle2.intersect(this.p0, this.p1, this.p2, triangle.p0, triangle.p1, triangle.p2, point);
	}


	/**
	 * The transformation of triangle
	 * @param {Triangle2} triangle - The source
	 * @param {Matrix3} transform - The transform
	 * @returns {Triangle2}
	 */
	transformationOf(triangle, transform) {
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
	copyOf(triangle) {
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
	transformation(transform) {
		return this.transformationOf(this, transform);
	}


	/**
	 * Returns a string representation of the instance
	 * @returns {string}
	 */
	toString(digits) {
		return "[Triangle2]" +
			"\n" + this.p0.toString() +
			"\n" + this.p1.toString() +
			"\n" + this.p2.toString();
	}
}
