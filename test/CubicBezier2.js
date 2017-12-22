import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';

import CubicBezier2 from '../source/CubicBezier2';



describe('CubicBezier2', () => {
	describe('.Copy', () => {
		it('should return a copy of source', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const source = new CubicBezier2(p0, p1, p2, p3);
			const target = CubicBezier2.Copy(source);

			assert.notStrictEqual(source, target);
			assert.notStrictEqual(source.p0, target.p0);
			assert.notStrictEqual(source.p1, target.p1);
			assert.notStrictEqual(source.p2, target.p2);
			assert.notStrictEqual(source.p3, target.p3);
			assert.strictEqual(CubicBezier2.isEQ(source, target), true);
		});

		it('should copy into optional target', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const source = new CubicBezier2(p0, p1, p2, p3);
			const target = new CubicBezier2(
				new Vector2(),
				new Vector2(),
				new Vector2(),
				new Vector2()
			);

			assert.strictEqual(CubicBezier2.Copy(source, target), target);
			assert.notStrictEqual(source, target);
			assert.notStrictEqual(source.p0, target.p0);
			assert.notStrictEqual(source.p1, target.p1);
			assert.notStrictEqual(source.p2, target.p2);
			assert.notStrictEqual(source.p3, target.p3);
			assert.strictEqual(CubicBezier2.isEQ(source, target), true);
		});
	});

	describe('.isEq', () => {
		it('should assert equality for identical objects', () => {
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const a = new CubicBezier2(p0, p1, p2, p3);

			assert.strictEqual(CubicBezier2.isEQ(a, a), true);
		});

		it('should assert equality for curves with equal control points', () => {
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const a = new CubicBezier2(p0, p1, p2, p3);
			const b = new CubicBezier2(p0, p1, p2, p3);
			const c = new CubicBezier2(
				Vector2.Copy(p0),
				Vector2.Copy(p1),
				Vector2.Copy(p2),
				Vector2.Copy(p3)
			);

			assert.strictEqual(CubicBezier2.isEQ(a, b), true);
			assert.strictEqual(CubicBezier2.isEQ(a, c), true);

			a.p0.x = -1.0;

			assert.strictEqual(CubicBezier2.isEQ(a, b), true);
			assert.strictEqual(CubicBezier2.isEQ(a, c), false);
		});
	});

	describe('.getPointOfT', () => {
		it('should return a new point equal to p0 at t=0', () => {
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const q = CubicBezier2.getPointOfT(p0, p1, p2, p3, 0.0);

			assert.strictEqual(Vector2.isEQ(p0, q), true);
		});

		it('should return a new point equal to p3 at t=1', () => {
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const q = CubicBezier2.getPointOfT(p0, p1, p2, p3, 1.0);

			assert.strictEqual(Vector2.isEQ(p3, q), true);
		});

		it('should create a linear succession of points for linear curves', () => {
			const p0 = new Vector2([0.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			for (let i = 0.0; i <= 1.0; i += 0.03) {
				const q = CubicBezier2.getPointOfT(p0, p0, p3, p3, i);

				assert.strictEqual(q.x, q.y);
			}
		});

		it('should be symmetric for symmetric control points', () => {
			const EPSILON = 1.0e-10;
			const p0 = new Vector2([-1.0, -1.0]), p1 = new Vector2([-1.0, 1.0]);
			const p3 = new Vector2([1.0, 1.0]), p2 = new Vector2([1.0, -1.0]);

			for (let i = 0.0; i <= 1.0; i += 0.03) {
				const q = CubicBezier2.getPointOfT(p0, p1, p2 ,p3, i);
				const r = CubicBezier2.getPointOfT(p0, p1, p2, p3, 1.0 - i);

				assert.ok(Math.abs(q.norm - r.norm) < EPSILON);
				assert.ok(Math.abs(q.x + r.x) < EPSILON);
				assert.ok(Math.abs(q.y + r.y) < EPSILON);
			}
		});

		it('should approximate an arc for appropriate control points', () => {
			const r = 3.72, k = 0.5522847498;
			const p0 = new Vector2([0.0, r]), p1 = new Vector2([r * k, r]);
			const p2 = new Vector2([r, r * k]), p3 = new Vector2([r, 0.0]);

			for (let i = 0.0; i <= 1.0; i += 0.03) {
				const q = CubicBezier2.getPointOfT(p0, p1, p2, p3, i);

				assert.ok(Math.abs(q.norm - r) < 1.0e-2);
			}
		});
	});

	describe('.split', () => {
		it('should return two new curves', () => {
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const source = new CubicBezier2(p0, p1, p2, p3);
			const [a, b] = CubicBezier2.split(source);

			assert.ok(a instanceof CubicBezier2);
			assert.ok(b instanceof CubicBezier2);
		});

		it('should return curves with common split point at t', () => {
			const t = 0.372, EPSILON = 1.0e-10;
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const source = new CubicBezier2(p0, p1, p2, p3);
			const [a, b] = CubicBezier2.split(source, t);
			const q = source.getPointOfT(t);

			assert.notStrictEqual(a.p3, b.p0);
			assert.notStrictEqual(a.p0, source.p0);
			assert.notStrictEqual(b.p3, source.p3);
			assert.strictEqual(a.p0.x, source.p0.x);
			assert.strictEqual(b.p3.x, source.p3.x);
			assert.strictEqual(a.p0.y, source.p0.y);
			assert.strictEqual(b.p3.y, source.p3.y);
			assert.ok(Math.abs(a.p3.x - q.x) < EPSILON);
			assert.ok(Math.abs(b.p0.x - q.x) < EPSILON);
			assert.ok(Math.abs(a.p3.y - q.y) < EPSILON);
			assert.ok(Math.abs(b.p0.y - q.y) < EPSILON);
		});

		it('should return curves with same curvature as source', () => {
			const EPSILON = 1.0e-10;
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const source = new CubicBezier2(p0, p1, p2, p3);
			const parts = CubicBezier2.split(source, 0.5);

			for (let i = 0; i <= 1; i += 0.03) {
				const j = i * 2.0 % 1.0;
				const part = parts[Math.floor(i *  2.0)];

				const q = source.getPointOfT(i);
				const r = part.getPointOfT(j);

				assert.ok(Math.abs(q.x - r.x) < EPSILON);
				assert.ok(Math.abs(q.y - r.y) < EPSILON);
			}
		});
	});

	describe('#constructor', () => {
		it('should return a new instance', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const curve = new CubicBezier2(p0, p1, p2, p3);

			assert.ok(curve instanceof CubicBezier2);
		});

		it('should assign properties p0, p1, p2, p3', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const curve = new CubicBezier2(p0, p1, p2, p3);

			assert.strictEqual(curve.p0, p0);
			assert.strictEqual(curve.p1, p1);
			assert.strictEqual(curve.p2, p2);
			assert.strictEqual(curve.p3, p3);
		});
	});

	describe('#define', () => {
		it('should return the instance', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const curve = new CubicBezier2(p0, p1, p2, p3);

			assert.strictEqual(curve, curve.define(p0, p1, p2, p3));
		});

		it('should assign properties p0, p1, p2, p3', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const curve = new CubicBezier2(p0, p1, p2, p3);

			curve.define(p3, p2, p1, p0);

			assert.strictEqual(curve.p0, p3);
			assert.strictEqual(curve.p1, p2);
			assert.strictEqual(curve.p2, p1);
			assert.strictEqual(curve.p3, p0);
		});
	});

	describe('#getPointOfT', () => {
		it('should return the same result as .getPointOfT', () => {
			const p0 = new Vector2([0.0, 0.0]), p1 = new Vector2([0.0, 1.0]);
			const p2 = new Vector2([1.0, 0.0]), p3 = new Vector2([1.0, 1.0]);

			const curve = new CubicBezier2(p0, p1, p2, p3);

			for (let i = 0.0; i <= 1.0; i += 0.03) {
				const q = curve.getPointOfT(i);
				const r = CubicBezier2.getPointOfT(p0, p1, p2, p3, i);

				assert.strictEqual(q.norm, r.norm);
				assert.strictEqual(q.x, r.x);
				assert.strictEqual(q.y, r.y);
			}
		});
	});

	describe('#copyOf', () => {
		it('should return a copy of source', () => {
			const p0 = new Vector2(), p1 = new Vector2();
			const p2 = new Vector2(), p3 = new Vector2();

			const source = new CubicBezier2(p0, p1, p2, p3);
			const target = new CubicBezier2(
				new Vector2(),
				new Vector2(),
				new Vector2(),
				new Vector2()
			);

			target.copyOf(source);

			assert.notStrictEqual(source, target);
			assert.notStrictEqual(source.p0, target.p0);
			assert.notStrictEqual(source.p1, target.p1);
			assert.notStrictEqual(source.p2, target.p2);
			assert.notStrictEqual(source.p3, target.p3);

			assert.strictEqual(CubicBezier2.isEQ(source, target), true);
		});
	});
});
