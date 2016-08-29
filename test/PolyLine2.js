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

		it("should find intersections between coplanar overlapping segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([0.0, 0.5]),
				new Vector2([0.0, 1.5])
			], true);
		});

		it("should not find intersections between coplanar separated segments", () => {
			_testIntersectSegments([
				new Vector2([0.0, 0.0]),
				new Vector2([1.0, 0.0]),
				new Vector2([2.0, 0.0]),
				new Vector2([3.0, 0.0])
			], false);
		});
	});
});
