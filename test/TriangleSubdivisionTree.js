import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';
import Triangle2 from '../source/Triangle2';
import Rectangle2 from '../source/Rectangle2';
import PolyLine2 from '../source/PolyLine2';
import TriangleSubdivisionTree from '../source/TriangleSubdivisionTree';



function _collectMetrics(mesh, points) {
	const poly = mesh.poly;
	const face = poly.face;
	const edge = poly.edge;
	const vertex = poly.vertex;
	const count = Array(points.length).fill(0);

	for (let f of face) {
		const pN = poly.pointOfFace(f);

		for (let p of pN) {
			for (let i = points.length - 1; i > -1; i -= 1) {
				if (!Vector2.isEQ(points[i], p)) continue;

				count[i] += 1;

				break;
			}
		}
	}

	return {
		face,
		edge,
		vertex,
		count
	};
}

function _testPoints(points) {
	const aabb = Rectangle2.AABB(points);
	const bound = Triangle2.Equilateral(aabb.center, aabb.extend.norm, 0.0, 2.0);

	const mesh = new TriangleSubdivisionTree(bound);

	mesh.addPoints(points);

	return _collectMetrics(mesh, points);
}

function _testOutline(outline) {
	const points = outline.point;
	const aabb = Rectangle2.AABB(points);
	const bound = Triangle2.Equilateral(aabb.center, aabb.extend.norm, 0.0, 2.0);
	const mesh = new TriangleSubdivisionTree(bound);

	mesh.intersectOutline(outline);

	return _collectMetrics(mesh, points);
}



describe('TriangleSubdivisionTree', () => {
	describe('#addPoints', () => {
		it("should create a triangle topology", () => {
			const ret = _testPoints([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([1.0, 0.0])
			]);

			assert.strictEqual(ret.vertex.length, 3);
			assert.strictEqual(ret.edge.length, 3);
			assert.strictEqual(ret.face.length, 1);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 3);
		});

		it("should create a rectangle topology", () => {
			const ret = _testPoints([
				new Vector2([0.0, 0.0]),
				new Vector2([0.0, 1.0]),
				new Vector2([1.0, 0.0]),
				new Vector2([1.0, 1.0])
			]);

			assert.strictEqual(ret.vertex.length, 4);
			assert.strictEqual(ret.edge.length, 5);
			assert.strictEqual(ret.face.length, 2);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 6);
		});

		it("should create a pentagon topology", () => {
			const ret = _testPoints([
				new Vector2([1.0, 0.0]),
				new Vector2([-1.0, 0.0]),
				new Vector2([-1.0, 1.0]),
				new Vector2([0.0, 2.0]),
				new Vector2([1.0, 1.0])
			]);

			assert.strictEqual(ret.vertex.length, 5);
			assert.strictEqual(ret.edge.length, 7);
			assert.strictEqual(ret.face.length, 3);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 9);
		});
	});

	describe('#intersectOutline', () => {
		it("should create a triangle topology", () => {
			const p0 = new Vector2([0.0, 0.0]);
			const outline = new PolyLine2([
				p0,
				new Vector2([0.0, 1.0]),
				new Vector2([1.0, 0.0]),
				p0
			]);

			const ret = _testOutline(outline);

			assert.strictEqual(ret.vertex.length, 3);
			assert.strictEqual(ret.edge.length, 3);
			assert.strictEqual(ret.face.length, 1);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 3);
		});

		it("should create a rectangle topology", () => {
			const p0 = new Vector2();
			const outline = new PolyLine2([
				p0,
				new Vector2([1.0, 0.0]),
				new Vector2([1.0, 1.0]),
				new Vector2([0.0, 1.0]),
				p0
			]);

			const ret = _testOutline(outline);

			assert.strictEqual(ret.vertex.length, 4);
			assert.strictEqual(ret.edge.length, 5);
			assert.strictEqual(ret.face.length, 2);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 6);
		});

		it("should create a pentagon topology", () => {
			const p0 = new Vector2([1.0, 0.0]);
			const outline = new PolyLine2([
				p0,
				new Vector2([-1.0, 0.0]),
				new Vector2([-1.0, 1.0]),
				new Vector2([0.0, 2.0]),
				new Vector2([1.0, 1.0]),
				p0
			]);

			const ret = _testOutline(outline);

			assert.strictEqual(ret.vertex.length, 5);
			assert.strictEqual(ret.edge.length, 7);
			assert.strictEqual(ret.face.length, 3);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 9);
		});

		it("should create a concave topology", () => {
			const p0 = new Vector2();
			const outline = new PolyLine2([
				p0,
				new Vector2([1.0, 1.0]),
				new Vector2([0.0, 0.5]),
				new Vector2([-1.0, 1.0]),
				p0
			]);

			const ret = _testOutline(outline);

			assert.strictEqual(ret.vertex.length, 4);
			assert.strictEqual(ret.edge.length, 5);
			assert.strictEqual(ret.face.length, 2);
			assert.strictEqual(ret.count.reduce((prev, current) => prev + current), 6);
		});
	});
});
