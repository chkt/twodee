export default class Circle2 {

	/**
	 * Returns an instance representing p and r
	 * @constructor
	 * @param {Vector2} p - The center point
	 * @param {number} r - The radius
	 * @param {Circle2} [target] - The target instance
	 * @returns {Circle}
	 */
	static Define(p, r, target) {
		if (target === undefined) target = new Circle2(p, r);
		else this.constructor.call(target, p, r);

		return target;
	}

	/**
	 * Returns an instance at p with area a
	 * @constructor
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
	 * @returns {Circle}
	 */
	define(p, r) {
		this.constructor.call(this, p, r);

		return this;
	}


	/**
	 * The area
	 * @type number
	 */
	get area() {
		return Math.PI * this.radius * this.radius;
	}
}
