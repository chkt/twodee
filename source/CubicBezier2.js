import Vector2 from 'xyzw/es5/Vector2';



const _V = new Vector2();



/**
 * Cubic Bezier Curve
 */
export default class CubicBezier2 {

	/**
	 * Returns a copy of source
	 * @param {CubicBezier2} source - The source curve
	 * @param {CubicBezier2} [target] - The target curve
	 * @returns {CubicBezier2}
	 */
	static Copy(source, target) {
		if (target === undefined) target = new CubicBezier2(
			new Vector2(),
			new Vector2(),
			new Vector2(),
			new Vector2()
		);

		return target.copyOf(source);
	}


	/**
	 * Return the point at t of cubic bezier curve p0,p1,p2,p3
	 * @param {Vector2} p0
	 * @param {Vector2} p1
	 * @param {Vector2} p2
	 * @param {Vector2} p3
	 * @param {number} t - The position
	 * @returns {Vector2}
	 */
	static getPointOfT(p0, p1, p2, p3, t) {
		const tt = t * t, it = 1.0 - t, itt = it * it;

		return Vector2
			.MultiplyScalar(p0, itt * it)
			.addEQ(_V.multiplyScalar(p1, 3.0 * itt * t))
			.addEQ(_V.multiplyScalar(p2, 3.0 * it * tt))
			.addEQ(_V.multiplyScalar(p3, tt * t));
	}


	/**
	 * Returns the partial segments of source split at t
	 * @param {CubicBezier2} source - The source curve
	 * @param {number} t - The position
	 * @returns {CubicBezier2[]}
	 */
	static split(source, t) {
		const it = 1.0 - t;
		const p00 = source.p0, p10 = source.p1, p20 = source.p2, p30 = source.p3;
		const v = new Vector2();

		const p11 = Vector2.MultiplyScalar(p10, it).addEQ(v.multiplyScalar(p20, t));
		const p21 = Vector2.MultiplyScalar(p20, it).addEQ(v.multiplyScalar(p30, t));
		const p12 = Vector2.MultiplyScalar(p11, it).addEQ(v.multiplyScalar(p21, t));

		const p01 = Vector2.MultiplyScalar(p00, it).addEQ(v.multiplyScalar(p10, t));
		const p02 = Vector2.MultiplyScalar(p01, it).addEQ(v.multiplyScalar(p11, t));
		const p03 = Vector2.MultiplyScalar(p02, it).addEQ(v.multiplyScalar(p12, t));

		return [
			new this(v.copyOf(p00), p01, p02, p03),
			new this(p11.copyOf(p03), p12, p21, Vector2.Copy(p30))
		];
	}


	/**
	 * Returns true if a and b represent the same curve, false otherwise
	 * @param {CubicBezier2} a
	 * @param {CubicBezier2} b
	 * @returns {boolean}
	 */
	static isEQ(a, b) {
		return a === b ||
			Vector2.isEQ(a.p0, b.p0) &&
			Vector2.isEQ(a.p1, b.p1) &&
			Vector2.isEQ(a.p2, b.p2) &&
			Vector2.isEQ(a.p3, b.p3);
	}



	/**
	 * Creates an instance
	 * @param {Vector2} p0
	 * @param {Vector2} p1
	 * @param {Vector2} p2
	 * @param {Vector2} p3
	 */
	constructor(p0, p1, p2, p3) {
		this.p0 = p0;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}

	/**
	 * Defines the instance
	 * @param {Vector2} p0
	 * @param {Vector2} p1
	 * @param {Vector2} p2
	 * @param {Vector2} p3
	 * @returns {CubicBezier2}
	 */
	define(p0, p1, p2, p3) {
		this.constructor.call(this, p0, p1, p2, p3);

		return this;
	}


	/**
	 * Returns the point at t
	 * @param {number} t - The position
	 * @returns {Vector2}
	 */
	getPointOfT(t) {
		return CubicBezier2.getPointOfT(this.p0, this.p1, this.p2, this.p3, t);
	}


	/**
	 * The copy of source
	 * @param {CubicBezier2} source - The source bezier
	 * @returns {CubicBezier2}
	 */
	copyOf(source) {
		this.p0.copyOf(source.p0);
		this.p1.copyOf(source.p1);
		this.p2.copyOf(source.p2);
		this.p3.copyOf(source.p3);

		return this;
	}
}
