import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';

import PolyLine2 from '../source/PolyLine2';



function _testIntersectSegments([p0, p1, q0, q1], b) {
	assert.strictEqual(PolyLine2.intersectSegments(p0, p1, q0, q1), b);
	assert.strictEqual(PolyLine2.intersectSegments(p1, p0, q0, q1), b);
	assert.strictEqual(PolyLine2.intersectSegments(p0, p1, q1, q0), b);
	assert.strictEqual(PolyLine2.intersectSegments(p1, p0, q1, q0), b);
}



describe('PolyLine2', () => {
	describe('intersectSegments', () => {
		it("should find crossing intersections", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([1.1, 1.1]),
				new Vector2([0.0, 1.0]),
				new Vector2([1.0, 0.0])
			], true);
		});

		it("should find intersections between perpendicular touching segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([0.0, 0.5]),
				new Vector2([1.0, 0.5])
			], true);
		});

		it("should not find intersections between perpendicular noncrossing segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([1.0, 0.5]),
				new Vector2([2.0, 0.5])
			], false);
		});

		it("should not find intersections between parallel segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([1.0, 0.0]),
				new Vector2([1.0, 1.0])
			], false);
		});

		it("should find intersections between colinear overlapping segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([0.0, 0.5]),
				new Vector2([0.0, 1.5])
			], true);
		});

		it("should find the center point of the the overlap between colinear overlapping segments", () => {
			const p0 = new Vector2([5.0, 1.0]);
			const p1 = new Vector2([1.0, 5.0]);
			const q0 = new Vector2([2.0, 4.0]);
			const q1 = new Vector2([4.0, 2.0]);

			const i = new Vector2([3.0, 3.0]);
			const r = new Vector2();

			PolyLine2.intersectSegments(p0, p1, q0, q1, r);

			assert(Vector2.isEQ(i, r));
		});

		it("should not find intersections between colinear separated segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([1.0, 0.0]),
				new Vector2([2.0, 0.0]),
				new Vector2([3.0, 0.0])
			], false);
		});
	});
});
