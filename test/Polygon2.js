import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';
import Matrix3 from 'xyzw/es5/Matrix3';

import Polygon2 from '../source/Polygon2';



function _createQuad(poly) {
	const v0 = poly.createVertex(new Vector2([0.0, 0.0]));
	const v1 = poly.createVertex(new Vector2([0.0, 1.0]));
	const v2 = poly.createVertex(new Vector2([1.0, 0.0]));
	const v3 = poly.createVertex(new Vector2([1.0, 1.0]));

	const f0 = poly.createFace(v0, v1, v2);
	const f1 = poly.createFace(v1, v3, v2);

	return [v0, v1, v2, v3, f0, f1];
}



describe('Polygon2', () => {
	describe('createFace', () => {
		it("should create triangles", () => {
			const poly = new Polygon2();

			const v0 = poly.createVertex(new Vector2([0.0, 0.0]));
			const v1 = poly.createVertex(new Vector2([0.0, 1.0]));
			const v2 = poly.createVertex(new Vector2([1.0, 0.0]));

			const f0 = poly.createFace(v0, v1, v2);

			assert.strictEqual(poly.face.length, 1);
			assert.strictEqual(poly.edge.length, 3);
			assert.strictEqual(poly.vertex.length, 3);
		});

		it("should create quads", () => {
			const poly = new Polygon2();

			_createQuad(poly);

			assert.strictEqual(poly.face.length, 2);
			assert.strictEqual(poly.edge.length, 5);
			assert.strictEqual(poly.vertex.length, 4);
		});
	});

	describe('turnEdge', () => {
		it("should turn the specified edge", () => {
			const poly = new Polygon2();
			const [v0, v1, v2] = _createQuad(poly);

			const [e0] = poly.edgeOfVertex(v1, [v2]);
			const e1 = poly.turnEdge(e0);

			const [f2, f3] = poly.faceOfEdge(e1);

			assert.notStrictEqual(f2, -1);
			assert.notStrictEqual(f3, -1);
		});
	});

	describe('intersects', () => {
		it("should detect intersections between instances", () => {
			const polyA = new Polygon2();
			const polyB = new Polygon2();

			_createQuad(polyA);
			_createQuad(polyB);

			const m = Matrix3.Translation(new Vector2([0.75, 0.0]));

			assert.strictEqual(polyA.intersects(polyB), true);

			polyB.transformation(m);

			assert.strictEqual(polyA.intersects(polyB), true);

			polyB.transformation(m);

			assert.strictEqual(polyA.intersects(polyB), false);
		});
	});
});
