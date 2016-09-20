import assert from 'assert';
import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';
import Matrix3 from 'xyzw/es5/Matrix3';

import Polygon2 from '../source/Polygon2';



function _createRightTriangle(len = 1.0) {
	const poly = new Polygon2();

	const v0 = poly.createVertex(new Vector2([0.0, 0.0]));
	const v1 = poly.createVertex(new Vector2([len, 0.0]));
	const v2 = poly.createVertex(new Vector2([0.0, len]));

	poly.createFace(v0, v1, v2);

	return poly;
}

function _createQuad(poly, len = 1.0) {
	const v0 = poly.createVertex(new Vector2([0.0, 0.0]));
	const v1 = poly.createVertex(new Vector2([0.0, len]));
	const v2 = poly.createVertex(new Vector2([len, 0.0]));
	const v3 = poly.createVertex(new Vector2([len, len]));

	const f0 = poly.createFace(v0, v1, v2);
	const f1 = poly.createFace(v1, v3, v2);

	return [v0, v1, v2, v3, f0, f1];
}

function _createPolygon(sides, len = 1.0) {
	const poly = new Polygon2();

	const v0 = poly.createVertex(new Vector2([0.0, 0.0]));
	let v1;

	for (let i = sides - 1; i > -1; i -= 1) {
		const x = Math.sin(i / sides * Math.PI * 2) * len;
		const y = Math.cos(i / sides * Math.PI * 2) * len;

		let v2 = poly.createVertex(new Vector2([x, y]));

		if (v1 !== undefined) poly.createFace(v0, v1, v2);

		v1 = v2;
	}

	poly.createFace(v0, 1, v1);

	return poly;
}



describe('Polygon2', () => {
	describe('#area', () => {
		it("should return the right area for triangles", () => {
			let poly = _createRightTriangle();

			assert.strictEqual(poly.area, 0.5);

			poly = _createRightTriangle(10.0);

			assert.strictEqual(poly.area, 50.0);
		});

		it("should return the right area for quads", () => {
			const poly = new Polygon2();

			_createQuad(poly);

			assert.strictEqual(poly.area, 1.0);

			poly.define();

			_createQuad(poly, 10.0);

			assert.strictEqual(poly.area, 100.0);
		});

		it("should return the right area for polygons", () => {
			function a6(len) {
				return 3 * Math.sqrt(3) / 2 * len * len;
			}

			function a8(len) {
				return 2 * (1 + Math.sqrt(2)) * len * len;
			}

			let poly = _createPolygon(6, 33.0);

			assert(Math.abs(poly.area - a6(33.0)) < 1.0e-10);

			poly = _createPolygon(8, 33.0);

			assert(Math.abs(poly.area - a8(Vector2.Subtract(poly.pointOfVertex(2), poly.pointOfVertex(1)).norm)) < 1.0e-10);
		});

		it("should return the right area for polygons with removed faces", () => {
			function a6(len) {
				return 3 * Math.sqrt(3) / 2 * len * len * 5.0 / 6.0;
			}

			function a8(len) {
				return 2 * (1 + Math.sqrt(2)) * len * len * 7.0 / 8.0;
			}

			let poly = _createPolygon(6, 33.0);

			poly.removeFace(0);

			assert(Math.abs(poly.area - a6(33.0)) < 1.0e-10);

			poly = _createPolygon(8, 33.0);
			poly.removeFace(0);

			assert(Math.abs(poly.area - a8(Vector2.Subtract(poly.pointOfVertex(2), poly.pointOfVertex(3)).norm)) < 1.0e-10);
		});
	});

	describe('#createFace', () => {
		it("should create triangles", () => {
			const poly = _createRightTriangle();

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

	describe('#splitEdge', () => {
		it("should split the specified edge", () => {
			const poly = new Polygon2();
			const [v0, v1, v2, v3] = _createQuad(poly);

			const p = new Vector2([0.5, 0.5]);
			const edge = poly.edgeOfVertex(v1, [ v2 ])[0];

			const v4 = poly.splitEdge(edge, p);

			assert.strictEqual(poly.faceOfVertex(v0).length, 2);
			assert.strictEqual(poly.edgeOfVertex(v0).length, 3);
			assert.strictEqual(poly.faceOfVertex(v1).length, 2);
			assert.strictEqual(poly.edgeOfVertex(v1).length, 3);
			assert.strictEqual(poly.faceOfVertex(v2).length, 2);
			assert.strictEqual(poly.edgeOfVertex(v2).length, 3);
			assert.strictEqual(poly.faceOfVertex(v3).length, 2);
			assert.strictEqual(poly.edgeOfVertex(v3).length, 3);
			assert.strictEqual(poly.faceOfVertex(v4).length, 4);
			assert.strictEqual(poly.edgeOfVertex(v4).length, 4);
		});
	});

	describe('#turnEdge', () => {
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

	describe('#intersects', () => {
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
