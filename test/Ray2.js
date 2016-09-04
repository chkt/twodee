import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';

import Ray2 from '../source/Ray2';



function _testIntersectSegment(ray, q0, q1, b) {
	assert.strictEqual(Ray2.intersectSegment(ray.origin, ray.orientation, q0, q1), b);
	assert.strictEqual(Ray2.intersectSegment(ray.origin, ray.orientation, q1, q0), b);
}

function _testIntersect(raya, rayb, b) {
	assert.strictEqual(Ray2.intersect(raya.origin, raya.orientation, rayb.origin, rayb.orientation), b);
}



describe('Ray2', () => {
	describe('.intersectSegment', () => {
		it("should find crossing intersections", () => {
			const ray = new Ray2(new Vector2([0.0, 0.0]), new Vector2([1.0, 1.0]).normalize());
			const p0 = new Vector2([1.0, 0.0]), p1 = new Vector2([0.0, 1.0]);

			_testIntersectSegment(ray, p0, p1, true);
		});

		it("should find crossing intersections distant from the ray origin", () => {
			const ray = new Ray2(new Vector2([0.0, 0.0]), new Vector2([1.0, 1.0]).normalize());
			const p0 = new Vector2([100.0, 0.0]), p1 = new Vector2([0.0, 100.0]);

			_testIntersectSegment(ray, p0, p1, true);
		});

		it("should not find crossing intersections distant from the segment", () => {
			const ray = new Ray2(new Vector2([0.0, 0.0]), new Vector2([1.0, 1.0]).normalize());
			const p0 = new Vector2([100.0, 0.0]), p1 = new Vector2([99.0, 1.0]);

			_testIntersectSegment(ray, p0, p1, false);

			p0.define([0.0, 100.0]), p1.define([1.0, 99.0]);

			_testIntersectSegment(ray, p0, p1, false);
		});

		it("should not find intersections between parallel entities", () => {
			const ray = new Ray2(new Vector2([0.0, 0.0]), new Vector2([0.0, 1.0]));
			const p0 = new Vector2([1.0, 0.0]), p1 = new Vector2([1.0, 1.0]);

			_testIntersectSegment(ray, p0, p1, false);
		});

		it("should find intersections between colinear overlapping entities", () => {
			const ray = new Ray2(new Vector2([0.0, 0.0]), new Vector2([0.0, 1.0]));
			const p0 = new Vector2([0.0, 2.0]), p1 = new Vector2([0.0, 3.0]);

			_testIntersectSegment(ray, p0, p1, true);
		});

		it("should not find intersections between colinear separated entities", () => {
			const ray = new Ray2(new Vector2([0.0, 0.0]), new Vector2([0.0, 1.0]));
			const p0 = new Vector2([0.0, -2.0]), p1 = new Vector2([0.0, -3.0]);

			_testIntersectSegment(ray, p0, p1, false);
		});
	});

	describe('.intersect', () => {
		it("should find crossing intersections", () => {
			const a = new Ray2(new Vector2([0.0, 0.0]), new Vector2([1.0, 1.0]).normalize());
			const b = new Ray2(new Vector2([1.0, 0.0]), new Vector2([-1.0, 1.0]).normalize());

			_testIntersect(a, b, true);
		});

		it("should find crossing intersections far from ray origin", () => {
			const a = new Ray2(new Vector2([0.0, 0.0]), new Vector2([1.0, 1.0]).normalize());
			const b = new Ray2(new Vector2([100.0, 0.0]), new Vector2([-1.0, 1.0]).normalize());

			_testIntersect(a, b, true);
		});

		it("should not find intersections between noncrossing rays", () => {
			const a = new Ray2(new Vector2([0.0, 0.0]), new Vector2([-1.0, 1.0]).normalize());
			const b = new Ray2(new Vector2([1.0, 0.0]), new Vector2([1.0, 1.0]).normalize());

			_testIntersect(a, b, false);
		});

		it("should not find intersections between parallel rays", () => {
			const a = new Ray2(new Vector2([0.0, 0.0]), new Vector2([0.0, 1.0]));
			const b = new Ray2(new Vector2([1.0, 0.0]), new Vector2([0.0, 1.0]));

			_testIntersect(a, b, false);
		});

		it("should find intersections between colinear overlapping rays", () => {
			const a = new Ray2(new Vector2([0.0, 0.0]), new Vector2([1.0, 0.0]));
			const b = new Ray2(new Vector2([1.0, 0.0]), new Vector2([-1.0, 0.0]));

			_testIntersect(a, b, true);
		});

		it("should not find intersections between colinear nonoverlapping rays", () => {
			const a = new Ray2(new Vector2([0.0, 0.0]), new Vector2([-1.0, 0.0]));
			const b = new Ray2(new Vector2([1.0, 0.0]), new Vector2([1.0, 0.0]));

			_testIntersect(a, b, false);
		});
	});
});
