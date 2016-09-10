import Vector2 from 'xyzw/es5/Vector2';
import Rectangle2 from './Rectangle2';


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
	const va = Vector2.Subtract(p1, p0), i = Math.abs(va.n[1]) < Math.abs(va.n[0]) ? 0 : 1;
	const o = p0.n[i], sp1 = va.n[i], sq0 = q0.n[i] - o, sq1 = q1.n[i] - o;

	const [pmin, pmax] = 0.0 < sp1 ? [0.0, sp1] : [sp1, 0.0];
	const [qmin, qmax] = sq0 < sq1 ? [sq0, sq1] : [sq1, sq0];

	if (pmax - qmin < 0 || qmax - pmin < 0) return false;

	if (r !== undefined) {
		const sr0 = Math.max(pmin, qmin) / sp1;
		const sr1 = Math.min(pmax, qmax) / sp1;
		const vs = Vector2.Copy(va).multiplyScalarEQ(sr0);

		r
			.copyOf(va)
			.multiplyScalarEQ(sr1)
			.subtractEQ(vs)
			.multiplyScalarEQ(0.5)
			.addEQ(vs)
			.addEQ(p0);
	}

	return true;
}


/**
 * Planar geometric primitive, first order
 */
export default class PolyLine2 {

	/**
	 * Returns a new instance from the convex hull of point
	 * Using graham scanning
	 * @constructor
	 * @param {Vector2[]} point - The points
	 * @param {PolyLine2} [target] - The target instance
	 * @returns {PolyLine2}
	 */
	static ConvexHullGraham(point, target) {
		function convex(point, r) {
			if (point.length !== 0 && point[point.length - 1] === r) return;

			for (; point.length > 1;) {
				const pn = point[point.length - 2].n;
				const qn = point[point.length - 1].n;
				const rn = r.n;

				if ((qn[0] - pn[0]) * (rn[1] - pn[1]) - (rn[0] - pn[0]) * (qn[1] - pn[1]) > 0.0) break;

				point.pop();
			}

			point.push(r);
		}

		let sort = point.slice(0), bottom = [], top = [];

		sort.sort((a, b) => a.n[0] - b.n[0] || a.n[1] - b.n[1]);

		for (var i = 0, p = sort[0]; p !== undefined; p = sort[++i]) convex(bottom, p);

		sort.reverse();

		for (i = 0, p = sort[0]; p !== undefined; p = sort[++i]) convex(top, p);

		bottom = bottom.concat(top.slice(1, -1), bottom[0]);

		if (target) PolyLine2.call(target, bottom);
		else target = new PolyLine2(bottom);

		return target;
	}

	/**
	 * Returns a new instance from rectangle
	 * @constructor
	 * @param {Rectangle2} rectangle - The source
	 * @param {PolyLine2} [target] - The target instance
	 * @returns {PolyLine2}
	 */
	static Rectangle2(rectangle, target) {
		const en = rectangle.extend.n;

		const point = [
			new Vector2([-en[0], -en[1]]),
			new Vector2([-en[0],  en[1]]),
			new Vector2([ en[0],  en[1]]),
			new Vector2([ en[0], -en[1]])
		];

		point.push(point[0]);

		if (target) PolyLine2.call(target, point);
		else target = new PolyLine2(point);

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
	static Transformation(poly, transform, target) {
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
	static Copy(poly, target) {
		if (target === undefined) target = new PolyLine2();

		return target.copyOf(poly);
	}


	/**
	 * Returns true if point q0 intersects poly line pN, false otherwise
	 * Using the crossings test (RRp754)
	 * @param {Vector2[]} pN - The poly line segments
	 * @param {Vector2} q0 - The point
	 * @returns {boolean}
	 */
	static intersectPoint(pN, q0) {
		const len = pN.length, q0y = q0.n[1];
		let res = false;

		let e0 = pN[len - 1], y0 = e0.y >= q0y;

		for (let i = len - 2; i > -1; i -= 1) {
			const e1 = pN[i], e1y = e1.n[1], y1 = e1y >= q0y;

			if (
				y1 !== y0 &&
				((e1y - q0y) * (e0.n[0] - e1.n[0]) >= (e1.n[0] - q0.n[0]) * (e0.n[1] - e1y)) === y1
			) res = !res;

			e0 = e1, y0 = y1;
		}

		return res;
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
	static intersectSegments(p0, p1, q0, q1, r) {
		const vA = Vector2.Subtract(q1, q0);
		const vBp = Vector2.Subtract(p1, p0).perpendicular();
		const f = Vector2.dot(vA, vBp);

		const vC = Vector2.Subtract(p0, q0);
		const a = Vector2.dot(vC, Vector2.Perpendicular(vA));

		if (f === 0.0) return a === 0.0 && _intersectColinearSegments(p0, p1, q0, q1, r);

		if (f > 0.0 && (a < 0.0 || a > f) || f < 0.0 && (a > 0.0 || a < f)) return false;

		const b = Vector2.dot(vC, vBp);

		if (f > 0.0 && (b < 0.0 || b > f) || f < 0.0 && (b > 0.0 || b < f)) return false;

		if (r !== undefined) r
			.copyOf(vA)
			.multiplyScalarEQ(a / f)
			.addEQ(p0);

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
	static intersect(pN, qN, r) {
		if (!r) {
			for (var i = 0, p0 = pN[0], p1 = pN[1]; p1; p0 = pN[++i], p1 = pN[i + 1]) {
				for (var j = 0, q0 = qN[0], q1 = qN[1]; q1; q0 = qN[++j], q1 = qN[j + 1]) {
					if (PolyLine2.intersectSegments(p0, p1, q0, q1)) return true;
				}
			}

			return false;
		}

		const rr = [], v = new Vector2();

		for (let i = 0, p0 = pN[0], p1 = pN[1]; p1; p0 = pN[++i], p1 = pN[i + 1]) {
			for (let j = 0, q0 = qN[0], q1 = qN[1]; q1; q0 = qN[++j], q1 = qN[j + 1]) {
				if (PolyLine2.intersectSegments(p0, p1, q0, q1, v)) rr.push(Vector2.Copy(v));
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
	constructor(point) {
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
	define(point) {
		this.constructor.call(point);

		return this;
	}


	/**
	 * The number of segments
	 * @type int
	 */
	get segments() {
		return this.point.length - 1;
	}

	/**
	 * true if the first and last points are identical (===), false otherwise
	 * @type boolean
	 */
	get closed() {
		return this.point[0] === this.point[this.point.length - 1];
	}


	/**
	 * Returns true if the instance intersects with point, false otherwise
	 * Alias for {@link PolyLine2.intersectsPoint}
	 * @param {Vector2} point - The antagonist
	 * @returns {boolean}
	 */
	intersectsPoint(point) {
		return PolyLine2.intersectPoint(this.point, point);
	}

	/**
	 * Returns true if the instance intersects with poly, false otherwise
	 * Alias for {@link PolyLine2.intersect}
	 * @param {PolyLine2} poly - The antagonist
	 * @param {Vector2[]} [point] - The intersection points
	 * References the intersection points if polylines intersect
	 * @returns {boolean}
	 */
	intersects(poly, point) {
		return PolyLine2.intersect(this.point, poly.point, point);
	}


	/**
	 * The transformation of poly
	 * @param {PolyLine2} poly - The source
	 * @param {Matrix3} transform - The transform
	 * @returns {PolyLine2}
	 */
	transformationOf(poly, transform) {
		const p = poly.point;
		const q = this.point = [];

		for (let point of p) q.push(Vector2.Multiply2x3Matrix3(transform, point));

		return this;
	}

	/**
	 * The copy of poly
	 * @param {PolyLine2} poly - The source
	 * @returns {PolyLine2}
	 */
	copyOf(poly) {
		this.point = [];

		for (var i = 0, point = poly.point[0]; point; point = poly.point[++i]) this.point.push(Vector2.Copy(point));

		return this;
	}


	/**
	 * The transformation of the instance
	 * @param {Matrix3} transform - The transform
	 * @returns {PolyLine2}
	 */
	transformation(transform) {
		return this.transformationOf(this, transform);
	}


	/**
	 * Returns a string representation of the instance
	 * @returns {string}
	 */
	toString() {
		return `[PolyLine2]\t${ this.segments }`;
	}
}
