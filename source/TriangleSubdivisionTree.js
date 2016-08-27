import Vector2 from 'xyzw/es5/Vector2';

import Triangle2 from './Triangle2';
import Polygon2 from './Polygon2';



const SIZE = 7;
const SUB0 = 0, SUB1 = 1, SUB2 = 2, P0 = 4, P1 = 5, P2 = 6, FACE = 3;



const _poly = new WeakMap();

const _tree = new WeakMap();
const _faceIndex = new WeakMap();



function _treeSubdivide(faces, subfaces) {
	const poly = _poly.get(this), tree = _tree.get(this), index = _faceIndex.get(this);

	if (faces.length === 0) return;

	const [f0, f1, f2] = subfaces;
	const o0 = tree.length, o1 = o0 + SIZE, o2 = f2 !== undefined ? o1 + SIZE : -1;

	for (let face of faces) tree.splice(index[face], 4, o0, o1, o2, -1);

	tree.push(-1, -1, -1, f0, ...poly.pointOfFace(f0));
	tree.push(-1, -1, -1, f1, ...poly.pointOfFace(f1));
	index[f0] = o0, index[f1] = o1;

	if (f2 !== undefined) {
		tree.push(-1, -1, -1, f2, ...poly.pointOfFace(f2));
		index[f2] = o2;
	}
}



export default class TriangleSubdivisionTree {

	constructor(boundary) {
		const poly = new Polygon2();

		const v0 = poly.createVertex(boundary.p0);
		const v1 = poly.createVertex(boundary.p1);
		const v2 = poly.createVertex(boundary.p2);

		const f0 = poly.createFace(v0, v1, v2);

		_poly.set(this, poly);

		_tree.set(this, [-1, -1, -1, f0, boundary.p0, boundary.p1, boundary.p2]);
		_faceIndex.set(this, [0]);
	}


	get poly() {
		const poly = _poly.get(this);
		const res = Polygon2.Copy(poly);

		res.removeVertex(0);
		res.removeVertex(1);
		res.removeVertex(2);

		return res;
	}


	intersectsPoint(q) {
		const tree = _tree.get(this);
		let queue = [ 0 ];

		for (let offset = queue.pop(); offset !== undefined; offset = queue.pop()) {
			const t0 = tree[offset + SUB0], t1 = tree[offset + SUB1], t2 = tree[offset + SUB2];
			const p0 = tree[offset + P0], p1 = tree[offset + P1], p2 = tree[offset + P2];
			const face = tree[offset + FACE], uv = [];

			if (!Triangle2.intersectPoint(p0, p1, p2, q, uv)) continue;

			if (face === -1) {
				queue = [t0, t1];

				if (t2 !== -1) queue.push(t2);

				continue;
			}

			return {
				face,
				uv
			};
		}

		return null;
	}

	subdivideFace(face, q) {
		const poly = _poly.get(this);

		const v3 = poly.subdivideFace(face, q);
		const [f0, f1, f2] = poly.faceOfVertex(v3);

		_treeSubdivide.call(this, [ face ], [ f0, f1, f2 ]);

		return [
			{ face : f0, edge : poly.edgeOfFace(f0, v3)[1] },
			{ face : f1, edge : poly.edgeOfFace(f1, v3)[1] },
			{ face : f2, edge : poly.edgeOfFace(f2, v3)[1] }
		];
	}

	splitEdge(edge, q) {
		const poly = _poly.get(this);
		const [face0, face1] = poly.faceOfEdge(edge);
		const [p0, p1, p2] = poly.pointOfFace(face0, edge);

		q = Vector2
			.Subtract(p1, p0)
			.projectEQ(Vector2.Subtract(q, p0))
			.addEQ(p1);

		const v4 = poly.splitEdge(edge, q);
		const [f0, f1, f2, f3] = poly.faceOfVertex(v4);

		_treeSubdivide.call(this, [ face0 ], [ f3, f2 ]);
		_treeSubdivide.call(this, [ face1 ], [ f1, f0 ]);

		return [
			{ face : f0, edge : poly.edgeOfFace(f0, v4)[1] },
			{ face : f1, edge : poly.edgeOfFace(f1, v4)[1] },
			{ face : f2, edge : poly.edgeOfFace(f2, v4)[1] },
			{ face : f3, edge : poly.edgeOfFace(f3, v4)[1] }
		];
	}

	testEdge(face0, edge) {
		const poly = _poly.get(this);
		const face1 = poly.faceOfEdge(edge, face0)[0];

		if (face1 === -1) return true;

		const [p0, p1, p2] = poly.pointOfFace(face0, edge);
		const p3 = poly.pointOfFace(face1, edge)[2];

		return !Triangle2.intersectPointCircumcircle(p0, p1, p2, p3);
	}

	turnEdge(face0, edge) {
		const poly = _poly.get(this), tree = _tree.get(this);
		const face1 = poly.faceOfEdge(edge, face0)[0];
		const [v0, v1, v2] = poly.vertexOfFace(face0, edge);

		const e0 = poly.turnEdge(edge);
		const [f0, f1] = poly.faceOfEdge(e0);

		_treeSubdivide.call(this, [ face0, face1 ], [ f0, f1 ]);

		return [
			{ face : f0, edge : poly.edgeOfFace(f0, v2)[1] },
			{ face : f1, edge : poly.edgeOfFace(f1, v2)[1] }
		];
	}

	addPoints(points) {
		const poly = _poly.get(this);
		const E0 = 0.01, E1 = 1.0 - E0;

		for (let p of points) {
			const isect = this.intersectsPoint(p);

			if (isect === null) continue;

			const [u, v] = isect.uv;
			let edges;

			if (u > E0 && v > E0 && u + v < E1) edges = this.subdivideFace(isect.face, p);
			else if (u === 1.0 || v === 1.0 || u + v === 0.0) continue;
			else {
				const [v0, v1, v2] = poly.vertexOfFace(isect.face);
				let edge;

				if (u < E0) edge = poly.edgeOfFace(isect.face, v0)[0];
				else if (v < E0) edge = poly.edgeOfFace(isect.face, v2)[0];
				else edge = poly.edgeOfFace(isect.face, v1)[0];

				edges = this.splitEdge(edge, p);
			}

			for (let item = edges.pop(); item !== undefined; item = edges.pop()) {
				const { face, edge } = item;

				if (!this.testEdge(face, edge)) edges.push(...this.turnEdge(face, edge));
			}
		}
	}
}
