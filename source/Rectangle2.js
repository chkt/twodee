import Vector2 from 'xyzw/es5/Vector2';
import Matrix3 from 'xyzw/es5/Matrix3';

import PolyLine2 from './PolyLine2';



/**
 * Planar geometric primitive, second order
 */
export default class Rectangle2 {

	/**
	 * Returns a new instance from point
	 * @constructor
	 * @param {Vector2[]} point - The points
	 * @param {Rectangle2} [target] - The target instance
	 * @returns {Rectangle2}
	 */
	static AABB(point, target) {
		let minx =  Number.MAX_VALUE, miny = minx;
		let maxx = -Number.MAX_VALUE, maxy = maxx;

		for (var i = 0, p = point[0]; p; p = point[++i]) {
			minx = Math.min(p.n[0], minx);
			miny = Math.min(p.n[1], miny);
			maxx = Math.max(p.n[0], maxx);
			maxy = Math.max(p.n[1], maxy);
		}

		const w = (maxx - minx) * 0.5;
		const h = (maxy - miny) * 0.5;
		const midx = minx + w;
		const midy = miny + h;

		const transform = new Matrix3([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, midx, midy, 1.0]);
		const extend = new Vector2([w, h]);

		if (target === undefined) return new Rectangle2(transform, extend);
		else return target.define(transform, extend);
	}

	/**
	 * Returns an instance representing the transformation of rectangle
	 * @constructor
	 * @param {Rectangle2} rectangle - The source
	 * @param {Matrix3} transform - The transform
	 * @param {Rectangle2} [target] - The target instance
	 * @returns {Rectangle2}
	 */
	static Transformation(rectangle, transform, target) {
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
	static Copy(rectangle, target) {
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
	static intersectPoint(tA, eA, p) {
		const mT = Matrix3.Inverse(tA);
		const vP = Vector2.Multiply2x3Matrix3(mT, p);

		if (eA.n[0] < Math.abs(vP.n[0]) || eA.n[1] < Math.abs(vP.n[1])) return false;

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
	static intersect(tA, eA, tB, eB) {
		const eAn = eA.n, eBn = eB.n, abs = Math.abs;

		const mT = Matrix3.Inverse(tA), mTn = mT.n;

		mT.multiply(mT, tB);

		const tx = mTn[6], ty = mTn[7];

		const r00 = abs(mTn[0]), r01 = abs(mTn[3]);
		const r10 = abs(mTn[1]), r11 = abs(mTn[4]);

		if (
			abs(tx) > eAn[0] + eBn[0] * r00 + eBn[1] * r01 ||
			abs(ty) > eAn[1] + eBn[0] * r10 + eBn[1] * r11 ||
			abs(tx * mTn[0] + ty * mTn[1]) > eAn[0] * r00 + eAn[1] * r10 + eBn[0] ||
			abs(tx * mTn[3] + ty * mTn[4]) > eAn[0] * r01 + eAn[1] * r11 + eBn[1]
		) return false;

		return true;
	}


	/**
	 * Returns true if a and b represent the same rectangle, false otherwise
	 * @param {Rectangle2} a - The protagonist
	 * @param {Rectangle2} b - The antagonist
	 * @returns {boolean}
	 */
	isEQ(a, b) {
		return a === b || Matrix3.isEQ(a.transform, b.transform) && Vector2.isEQ(a.extend, b.extend);
	}



	/**
	 * Creates a new instance
	 * @param {Matrix3} [transform] - The transform
	 * @param {Vector2} [extend] - The extend
	 */
	constructor(transform, extend) {
		/**
		 * The transform
		 * @type Matrix3
		 */
		this.transform = transform || new Matrix3();
		/**
		 * The half-dimensions
		 * @type Vector2
		 */
		this.extend = extend || new Vector2();
	}


	/**
	 * Redefines the instance
	 * @param {Matrix3} [transform] - The transform
	 * @param {Vector2} [extend] - The half-dimensions
	 * @returns {Rectangle2}
	 */
	define(transform, extend) {
		this.constructor.call(this, transform, extend);

		return this;
	}


	/**
	 * The dereferenced center point
	 * @type Vector2
	 */
	get center() {
		return new Vector2([this.transform.n[6], this.transform.n[7]]);
	}

	set center(v) {
		this.transform.n[6] = v.n[0];
		this.transform.n[7] = v.n[1];
	}


	/**
	 * The width
	 * Alias of {@link Rectangle2#extend}
	 * @type number
	 */
	get width() {
		return this.extend.n[0] * 2.0;
	}

	set width(n) {
		this.extend.n[0] = n * 0.5;
	}


	/**
	 * The height
	 * Alias of {@link Rectangle#extend}
	 * @type number
	 */
	get height() {
		return this.extend[1] * 2.0;
	}

	set height(n) {
		this.extend.n[1] = n * 0.5;
	}


	/**
	 * The aspect (w/h)
	 * @type number
	 */
	get aspect() {
		return this.extend.n[0] / this.extend.n[1];
	}

	/**
	 * The area (w*h)
	 * @type number
	 */
	get area() {
		return this.extend.n[0] * this.extend.n[1] * 4.0;
	}


	/**
	 * Returns true if the instance intersects with p, false otherwise
	 * Alias for {@link Rectangle2.intersectPoint}
	 * @param {Vector2} p - The antagonist
	 * @returns {boolean}
	 */
	intersectsPoint(p) {
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
	intersectsSegment(p0, p1, r) {
		return PolyLine2.intersect(PolyLine2.Rectangle2(this).point, [p0, p1], r);
	}

	/**
	 * Returns true if the instance intersects with rectangle, false otherwise
	 * Alias of {@link Rectangle2.intersect}
	 * @param {Rectangle2} rectangle - The antagonist
	 * @param {Rectangle2} [point] - The intersection point(s)
	 * References the intersection point(s) if obbs intersect
	 * @returns {boolean}
	 */
	intersects(rectangle, point) {
		if (!Rectangle2.intersect(this.transform, this.extend, rectangle.transform, rectangle.extend)) return false;

		if (point === undefined) return true;

		const polyA = PolyLine2.Rectangle2(this);
		const polyB = PolyLine2.Rectangle2(rectangle);

		PolyLine2.intersect(polyA.point, polyB.point, point);

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
	transformationOf(rectangle, transform) {
		this.transform.multiply(transform, rectangle.transform);
		this.extend.copyOf(rectangle.extend);

		return this;
	}

	/**
	 * The copy of rectangle
	 * @param {Rectangle2} rectangle - The source
	 * @returns {Rectangle2}
	 */
	copyOf(rectangle) {
		this.transform.copyOf(rectangle.transform);
		this.extend.copyOf(rectangle.extend);

		return this;
	}


	/**
	 * The transformation of the instance
	 * @param {Matrix3} transform - The transform
	 * @returns {Rectangle2}
	 */
	transformation(transform) {
		this.transform.multiply(transform, this.transform);

		return this;
	}


	/**
	 * Returns a string representation of the instance
	 * @returns {string}
	 */
	toString() {
		return "[Rectangle2]" +
			"\n" + this.transform.toString() +
			"\n" + this.extend.toString();
	}
}
