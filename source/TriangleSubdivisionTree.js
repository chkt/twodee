import Vector2 from 'xyzw/es5/Vector2';

import Triangle2 from './Triangle2';
import PolyLine2 from './PolyLine2';
import Polygon2 from './Polygon2';



const FLAG_NONE = 0b0;
const FLAG_FACE_IMMUTABLE = 0b01;
const FLAG_FACE_INVALID = 0b10;
const FLAG_EDGE_IMMUTABLE = 0b1;
const FLAG_VERTEX_INVALID = 0b1;


const SIZE = 7;
const SUB0 = 0, SUB1 = 1, SUB2 = 2, P0 = 4, P1 = 5, P2 = 6, FACE = 3;



const _poly = new WeakMap();

const _tree = new WeakMap();
const _faceIndex = new WeakMap();

const _faceFlags = new WeakMap();
const _edgeFlags = new WeakMap();
const _vertexFlags = new WeakMap();


/**
 * Returns true if face has flag, false otherwise
 * @private
 * @param {int} face - The face index
 * @param {int} flag - The face flag
 * @returns {boolean}
 */
function _hasFaceFlag(face, flag) {
	const flags = _faceFlags.get(this);

	return face in flags && flags[face] & flag !== 0;
}

/**
 * Sets flag for face
 * @private
 * @param {int} face - The face index
 * @param {int} flag - The face flag
 */
function _setFaceFlag(face, flag) {
	const flags = _faceFlags.get(this);

	if (!(face in flags)) flags[face] = FLAG_NONE;

	flags[face] |= flag;
}


/**
 * Returns true if edge has flag, false, otherwise
 * @private
 * @param {int} edge - The edge index
 * @param {int} flag - The edge flag
 * @returns {boolean}
 */
function _hasEdgeFlag(edge, flag) {
	const flags = _edgeFlags.get(this);

	return edge in flags && flags[edge] & flag !== 0;
}

/**
 * Sets flag for edge
 * @private
 * @param {int} edge - The edge index
 * @param {int} flag - The edge flag
 */
function _setEdgeFlag(edge, flag) {
	const flags = _edgeFlags.get(this);

	if (!(edge in flags)) flags[edge] = FLAG_NONE;

	flags[edge] |= flag;
}


/**
 * Returns true if vertex has flag, false otherwise
 * @private
 * @param {int} vertex - The vertex index
 * @param {int} flag - The vertex flag
 * @returns {boolean}
 */
function _hasVertexFlag(vertex, flag) {
	const flags = _vertexFlags.get(this);

	return vertex in flags && flags[vertex] & flag !== 0;
}

/**
 * Sets flag for vertex
 * @private
 * @param {int} vertex - The vertex index
 * @param {int} flag - The vertex flag
 */
function _setVertexFlag(vertex, flag) {
	const flags = _vertexFlags.get(this);

	if (!(vertex in flags)) flags[vertex] = FLAG_NONE;

	flags[vertex] |= flag;
}


/**
 * Creates new branches in the subdivision tree
 * @private
 * @param {int[]} faces - the branching face indices
 * @param {int[]} subfaces - the new subface indices
 */
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


/**
 * Returns the newly created face indices and their far edge indices after subdividing face with q
 * @private
 * @param {int} face - The face index
 * @param {Vector2} q - The subdivision point
 * @returns {Object[]}
 */
function _faceSubdivide(face, q) {
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

/**
 * Returns the newly created face indices and their far edge indices after splitting edge with q
 * @private
 * @param {int} edge - The edge index
 * @param {Vector2} q - The splitting point
 * @returns {Object[]}
 */
function _edgeSplit(edge, q) {
	const poly = _poly.get(this);
	const [face0, face1] = poly.faceOfEdge(edge);

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

/**
 * Returns the newly created face indices and their face edge indices
 * after turning the edge of the quad of face0 and the face opposite of edge
 * @private
 * @param {int} face0 - The face index of the first face
 * @param {int} edge - The edge index of the edge
 * @returns {Object[]}
 */
function _edgeTurn(face0, edge) {
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


/**
 * Delaunay triangulation subdivision tree
 */
export default class TriangleSubdivisionTree {

	/**
	 * Creates a new instance
	 * @param {Triangle2} boundary - The boundary triangle
	 */
	constructor(boundary) {
		const poly = new Polygon2();

		const v0 = poly.createVertex(boundary.p0);
		const v1 = poly.createVertex(boundary.p1);
		const v2 = poly.createVertex(boundary.p2);

		const f0 = poly.createFace(v0, v1, v2);

		_poly.set(this, poly);

		_tree.set(this, [-1, -1, -1, f0, boundary.p0, boundary.p1, boundary.p2]);
		_faceIndex.set(this, [0]);

		_faceFlags.set(this, {});
		_edgeFlags.set(this, {});
		_vertexFlags.set(this, {
			[ v0 ] : FLAG_VERTEX_INVALID,
			[ v1 ] : FLAG_VERTEX_INVALID,
			[ v2 ] : FLAG_VERTEX_INVALID
		});
	}


	/**
	 * Returns a dereferenced polygon representing the subdivision state
	 * @returns {Polygon2}
	 */
	get poly() {
		const poly = _poly.get(this);
		const res = Polygon2.Copy(poly);

		for (let prop in _faceFlags.get(this)) {
			const face = Number.parseInt(prop);

			if (_hasFaceFlag.call(this, face, FLAG_FACE_INVALID)) res.removeFace(face);
		}

		for (let prop in _vertexFlags.get(this)) {
			const vertex = Number.parseInt(prop);

			if (_hasVertexFlag.call(this, vertex, FLAG_VERTEX_INVALID)) res.removeVertex(vertex);
		}

		return res;
	}


	/**
	 * Returns the intersection face and barycentric coordinate if q intersects with the subdivision tree, null otherwise
	 * @param {Vector2} q - The point
	 * @returns {null|Object}
	 */
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

	/**
	 * Returns true if edge is the optimal edge for the quad of face0 and the face opposite of edge, false otherwise
	 * @param {int} face0 - The face index of the first face
	 * @param {int} edge - The edge index of the edge
	 * @returns {boolean}
	 */
	testEdge(face0, edge) {
		const poly = _poly.get(this);
		const face1 = poly.faceOfEdge(edge, face0)[0];

		if (face1 === -1) return true;

		const [p0, p1, p2] = poly.pointOfFace(face0, edge);
		const p3 = poly.pointOfFace(face1, edge)[2];

		return !Triangle2.intersectPointCircumcircle(p0, p1, p2, p3);
	}


	/**
	 * Adds a point to the subdivision mesh
	 * @param {Vector2} point - The point
	 */
	addPoint(point) {
		const E0 = 0.01, E1 = 1.0 - E0;
		const poly = _poly.get(this), isect = this.intersectsPoint(point);

		if (isect === null || _hasFaceFlag.call(this, isect.face, FLAG_FACE_IMMUTABLE)) return;

		const [u, v] = isect.uv;
		let edges;

		if (u > E0 && v > E0 && u + v < E1) edges = _faceSubdivide.call(this, isect.face, point);
		else if (u === 1.0 || v === 1.0 || u + v === 0.0) return;
		else {
			const [v0, v1, v2] = poly.vertexOfFace(isect.face);
			let edge;

			if (u < E0) edge = poly.edgeOfFace(isect.face, v0)[0];
			else if (v < E0) edge = poly.edgeOfFace(isect.face, v2)[0];
			else edge = poly.edgeOfFace(isect.face, v1)[0];

			if (_hasEdgeFlag.call(this, edge, FLAG_EDGE_IMMUTABLE)) return;

			edges = _edgeSplit.call(this, edge, point);
		}

		for (let item = edges.pop(); item !== undefined; item = edges.pop()) {
			const { face, edge } = item;

			if (
				!_hasEdgeFlag.call(this, edge, FLAG_EDGE_IMMUTABLE) &&
				!this.testEdge(face, edge)
			) edges.push(..._edgeTurn.call(this, face, edge));
		}
	}

	/**
	 * Adds points to the subdivision mesh
	 * @param {Vector2[]} points - The points
	 */
	addPoints(points) {
		for (let p of points) this.addPoint(p);
	}


	/**
	 * Intersects outline with the subdivision mesh
	 * @param {PolyLine2} outline - The outline
	 */
	intersectOutline(outline) {
		const poly = _poly.get(this), point = outline.point;
		let v0 = -1;

		for (let i = point.length - 1; i > -1; i -= 1) {
			if (v0 === -1) {
				const p0 = point[i];

				this.addPoint(p0);
				v0 = poly.vertexOfPoint(p0);
			}
			else {
				const p1 = point[i];

				this.addPoint(p1);

				const v1 = poly.vertexOfPoint(p1);

				if (v1 !== -1) _setEdgeFlag.call(this, poly.edgeOfVertex(v1, [v0])[0], FLAG_EDGE_IMMUTABLE);

				v0 = v1;
			}
		}

		for (let face of poly.face) {
			const center = Triangle2.centroid(...poly.pointOfFace(face));

			if (!PolyLine2.intersectPoint(point, center)) _setFaceFlag.call(this, face, FLAG_FACE_IMMUTABLE | FLAG_FACE_INVALID);
		}
	}
}
