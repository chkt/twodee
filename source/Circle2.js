import Vector2 from 'xyzw/es5/Vector2';



/**
 * Circle geometry
 */
export default class Circle2 {

	/**
	 * Returns an instance representing p and r
	 * @param {Vector2} p - The center point
	 * @param {number} r - The radius
	 * @param {Circle2} [target] - The target instance
	 * @returns {Circle2}
	 */
	static Define(p, r, target) {
		if (target === undefined) target = new this(p, r);
		else this.call(target, p, r);

		return target;
	}

	/**
	 * Returns an instance at p with area a
	 * @param {Vector2} p - The center point
	 * @param {number} a - The area
	 * @param {Circle2} [target] - The target instance
	 * @returns {Circle2}
	 */
	static Area(p, a, target) {
		const r = Math.sqrt(a / Math.PI);

		return this.Define(p, r, target);
	}


	/**
	 * Returns a copy of circle
	 * @param {Circle2} circle - The source
	 * @param {Circle2} [target] - The target instance
	 * @returns {Circle2}
	 */
	static Copy(circle, target) {
		return this.Define(Vector2.Copy(circle.center), circle.radius, target);
	}


	/**
	 * Returns true if q intersects circle (p,r), false otherwise
	 * @param {Vector2} p - The circle center
	 * @param {number} r - The circle radius
	 * @param {Vector2} q - The point
	 * @returns {boolean}
	 */
	static intersectPoint(p, r, q) {
		return Vector2.Subtract(p, q).normSquared <= r * r;
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
	static intersect(p0, r0, p1, r1, points) {
		const p10 = Vector2.Subtract(p1, p0), d = p10.norm;

		if (d > r0 + r1) return false;

		if (points === undefined || d <= Math.abs(r1 - r0)) return true;

		const dInverse = 1.0 / d, r0Squared = r0 * r0;
		const a = (r0Squared - r1 * r1 + d * d) * 0.5 * dInverse;
		const h = Math.sqrt(r0Squared - a * a);

		const p2 = Vector2
			.Copy(p10)
			.multiplyScalarEQ(a * dInverse);

		const t = Vector2
			.Copy(p10)
			.multiplyScalarEQ(h * dInverse);

		const x3 = p2.x + t.y, x4 = p2.x - t.y;
		const y3 = p2.y + t.x, y4 = p2.y - t.x;

		points.splice(0, points.length, new Vector2([x3, y3]));

		if (x3 !== x4 || y3 !== y4) points.push(new Vector2([x4, y4]));

		return true;
	}


	/**
	 * Returns true if a and b are equal (a == b), false otherwise
	 * @param {Circle2} a - The protagonist
	 * @param {Circle2} b - The antagonist
	 * @returns {boolean}
	 */
	static isEQ(a, b) {
		return a === b || Vector2.isEQ(a.center, b.center) && a.radius === b.radius;
	}


	/**
	 * Creates a new instance
	 * @param {Vector2} p - The center point
	 * @param {number} r - The radius
	 */
	constructor(p, r) {
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
	define(p, r) {
		this.constructor.call(this, p, r);

		return this;
	}


	/**
	 * The area
	 * @type {number}
	 */
	get area() {
		return Math.PI * this.radius * this.radius;
	}


	/**
	 * Returns true if p intersects the instance, false otherwise
	 * @param {Vector2} p - The point
	 * @returns {boolean}
	 */
	intersectsPoint(p) {
		return Vector2.Subtract(this.center, p).normSquared <= this.radius * this.radius;
	}

	/**
	 * Returns true if circle intersects the instance, false otherwise
	 * @param {Circle2} circle - The circle
	 * @param {Vector2[]} [points] - The intersection points
	 * @returns {boolean}
	 */
	intersects(circle, points) {
		return Circle2.intersect(this.center, this.radius, circle.center, circle.radius, points);
	}


	/**
	 * The transformation of circle
	 * @param {Circle2} circle - The source
	 * @param {Matrix3} transform - The transform
	 * @returns {Circle2}
	 */
	transformationOf(circle, transform) {
		this.center.multiply2x3Matrix3(transform, circle.center);

		return this;
	}

	/**
	 * The copy of circle
	 * @param {Circle2} circle - The source
	 * @returns {Circle2}
	 */
	copyOf(circle) {
		return this.define(Vector2.Copy(circle.center), circle.radius);
	}


	/**
	 * The transformation of the instance
	 * @param {Matrix3} transform - The transform
	 * @returns {Circle2}
	 */
	transformation(transform) {
		this.center.multiply2x3Matrix3(transform, this.center);

		return this;
	}


	/**
	 * Returns a string representation of the instance
	 * @param {int} digits - The decimal places
	 * @returns {string}
	 */
	toString(digits = 3) {
		return `[Circle2] ${ this.center.toString(digits) } ${ this.radius })`;
	}
}
