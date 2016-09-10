import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';

import PolyLine2 from '../source/PolyLine2';



function _testIntersectPoint(pN, q, b) {
	assert.strictEqual(PolyLine2.intersectPoint(pN, q), b);
}

function _testIntersectSegments([p0, p1, q0, q1], b) {
	assert.strictEqual(PolyLine2.intersectSegments(p0, p1, q0, q1), b);
	assert.strictEqual(PolyLine2.intersectSegments(p1, p0, q0, q1), b);
	assert.strictEqual(PolyLine2.intersectSegments(p0, p1, q1, q0), b);
	assert.strictEqual(PolyLine2.intersectSegments(p1, p0, q1, q0), b);
}



describe('PolyLine2', () => {
	describe('intersectPoint', () => {
		it("should find intersections for points inside convex outlines", () => {
			const p0 = new Vector2();

			_testIntersectPoint([
				p0,
				new Vector2([1.0, 0.0]),
				new Vector2([0.0, 1.0]),
				p0
			], new Vector2([0.1, 0.1]), true);
		});

		it("should not find intersections for points outside convex outlines", () => {
			const p0 = new Vector2();

			_testIntersectPoint([
				p0,
				new Vector2([1.0, 0.0]),
				new Vector2([0.0, 1.0]),
				p0
			], new Vector2([-1.0, 0.1]), false);
		});

		it("should find intersections for points inside concave outlines", () => {
			const p0 = new Vector2();
			const pN = [
				p0,
				new Vector2([1.0, 1.0]),
				new Vector2([0.0, 0.5]),
				new Vector2([-1.0, 1.0]),
				p0
			];

			_testIntersectPoint(pN, new Vector2([0.5, 0.6]), true);
			_testIntersectPoint(pN, new Vector2([-0.5, 0.6]), true);
		});

		it("should not find intersections for points outside concave outlines", () => {
			const p0 = new Vector2();
			const pN = [
				p0,
				new Vector2([1.0, 1.0]),
				new Vector2([0.0, 0.5]),
				new Vector2([-1.0, 1.0]),
				p0
			];

			_testIntersectPoint(pN, new Vector2([1.0, 0.6]), false);
			_testIntersectPoint(pN, new Vector2([0.0, 0.6]), false);
			_testIntersectPoint(pN, new Vector2([-1.0, 0.6]), false);
		});

		it("should find intersections inside the filled areas of self-intersecting outlines", () => {
			const p0 = new Vector2();
			const pN = [
				p0,
				new Vector2([1.0, 1.0]),
				new Vector2([-1.0, 0.5]),
				new Vector2([1.0, 0.5]),
				new Vector2([-1.0, 1.0]),
				p0
			];

			_testIntersectPoint(pN, new Vector2([0.0, 0.25]), true);
			_testIntersectPoint(pN, new Vector2([0.5, 0.75]), true);
			_testIntersectPoint(pN, new Vector2([0.75, 0.51]), true);
			_testIntersectPoint(pN, new Vector2([-0.5, 0.75]), true);
			_testIntersectPoint(pN, new Vector2([-0.75, 0.51]), true);
		});

		it("should not find intersections inside the unfilled areas of self-intersecting outlines", () => {
			const p0 = new Vector2();
			const pN = [
				p0,
				new Vector2([1.0, 1.0]),
				new Vector2([-1.0, 0.5]),
				new Vector2([1.0, 0.5]),
				new Vector2([-1.0, 1.0]),
				p0
			];

			_testIntersectPoint(pN, new Vector2([0.5, 0.5]), false);
			_testIntersectPoint(pN, new Vector2([-0.5, 0.5]), false);
			_testIntersectPoint(pN, new Vector2([0.0, 0.51]), false);
			_testIntersectPoint(pN, new Vector2([1.0, 0.75]), false);
			_testIntersectPoint(pN, new Vector2([-1.0, 0.75]), false);
			_testIntersectPoint(pN, new Vector2([0.0, 0.75]), false);
		});

		it("should find intersections for points inside filled areas and hitting vertices of outlines", () => {
			const p0 = new Vector2();
			const pN = [
				p0,
				new Vector2([1.0, -0.5]),
				new Vector2([1.0, 0.5]),
				new Vector2([1.0, 1.5]),
				new Vector2([0.0, 1.0]),
				new Vector2([-1.0, 1.5]),
				new Vector2([-1.0, 0.5]),
				new Vector2([-1.0, -0.5]),
				p0
			];

			_testIntersectPoint(pN, new Vector2([0.0, 0.5]), true);
			_testIntersectPoint(pN, new Vector2([-0.5, 1.0]), true);
			_testIntersectPoint(pN, new Vector2([-0.5, 0.0]), true);
		});

		it("should not find intersections for points outside filled areas and hitting vertices of outlines", () => {
			const p0 = new Vector2();
			const pN = [
				p0,
				new Vector2([1.0, -0.5]),
				new Vector2([1.0, 0.5]),
				new Vector2([1.0, 1.5]),
				new Vector2([0.0, 1.0]),
				new Vector2([-1.0, 1.5]),
				new Vector2([-1.0, 0.5]),
				new Vector2([-1.0, -0.5]),
				p0
			];

			_testIntersectPoint(pN, new Vector2([-1.5, 0.5]), false);
			_testIntersectPoint(pN, new Vector2([0.0, 1.5]), false);
			_testIntersectPoint(pN, new Vector2([0.0, -0.5]), false);
			_testIntersectPoint(pN, new Vector2([-1.5, 1.5]), false);
			_testIntersectPoint(pN, new Vector2([-1.5, -0.5]), false);
		});
	});

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
