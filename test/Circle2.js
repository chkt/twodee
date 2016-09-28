import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';

import Circle2 from '../source/Circle2';



describe('Circle2', () => {
	describe('intersect', () => {
		it("should detect intersections between circles", () => {
			const p0 = new Vector2(), r0 = 10.0;
			const p1 = new Vector2([12.0, 12.0]), r1 = 8.0;

			assert.strictEqual(Circle2.intersect(p0, r0, p1, r1), true);

			p1.define([20.0, 0.0]);

			assert.strictEqual(Circle2.intersect(p0, r0, p1, r1), false);

			p1.define([0.0, 0.0]);

			assert.strictEqual(Circle2.intersect(p0, r0, p1, r1), true);

			p1.define([0.0, 18.0]);

			assert.strictEqual(Circle2.intersect(p0, r0, p1, r1), true);
		});

		it("should return no intersection points if circles are equal", () => {
			const p0 = new Vector2([10.0, -10.0]), r0 = 10.0;
			const points = [];
			const ret = Circle2.intersect(p0, r0, p0, r0, points);

			assert.strictEqual(ret, true);
			assert.strictEqual(points.length, 0);
		});

		it("should return no intersection points if one circle contains the other", () => {
			const p0 = new Vector2([0.0, 0.0]), r0 = 10.0;
			const p1 = new Vector2([1.0, 0.0]), r1 = 8.0;
			const points = [];
			let ret = Circle2.intersect(p0, r0, p1, r1, points);

			assert.strictEqual(ret, true);
			assert.strictEqual(points.length, 0);

			ret = Circle2.intersect(p1, r1, p0, r0, points);

			assert.strictEqual(ret, true);
			assert.strictEqual(points.length, 0);
		});

		it("should return a single intersection point for touching circles", () => {
			const p0 = new Vector2(), r0 = 10.0;
			const p1 = new Vector2([18.0, 0.0]), r1 = 8.0;
			const points = [];
			let ret = Circle2.intersect(p0, r0, p1, r1, points);

			assert.strictEqual(ret, true);
			assert.strictEqual(points.length, 1);
			assert(Vector2.isEQ(points[0], new Vector2([10.0, 0.0])));

			p1.define([2.0, 0.0]);
			ret = Circle2.intersect(p0, r0, p1, r1, points);

			assert.strictEqual(ret, true);
			assert.strictEqual(points.length, 1);
			assert(Vector2.isEQ(points[0], new Vector2([10.0, 0.0])));
		});

		it("should return two intersection points for intersecting circles", () => {
			const p0 = new Vector2(), r0 = 10.0;
			const sin = Math.sin(Math.PI * 0.25) * r0, cos = Math.cos(Math.PI * 0.25) * r0;
			const p1 = new Vector2([sin * 2.0, 0.0]);
			const points = [];
			let ret = Circle2.intersect(p0, r0, p1, r0, points);

			assert.strictEqual(ret, true);
			assert.strictEqual(points.length, 2);
			assert(Math.abs(points[0].x - sin) < 1.0e-10 && Math.abs(points[0].y - cos) < 1.0e-10);
			assert(Math.abs(points[1].x - sin) < 1.0e-10 && Math.abs(points[1].y + cos) < 1.0e-10);
		});
	});
});
