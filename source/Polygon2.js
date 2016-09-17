import Vector2 from 'xyzw/es5/Vector2';

import Triangle2 from './Triangle2';
import Rectangle2 from './Rectangle2';
import TriangleSubdivisionTree from './TriangleSubdivisionTree';



const _face = new WeakMap(), _faceFree = new WeakMap();
const _edge = new WeakMap(), _edgeFree = new WeakMap();
const _vertex = new WeakMap(), _vertexFree = new WeakMap();

const _vertexEdge = new WeakMap();
const _vertexEdgeDirty = new WeakMap();

const _point = new WeakMap();


/**
 * Returns a free face index
 * @private
 * @returns {int}
 */
function _getFreeFace() {
	const ff = _faceFree.get(this);
	let index = ff.shift();

	if (index === undefined) {
		const f = _face.get(this);

		index = f.length / 6;
		f.push(-1, -1, -1, -1, -1, -1);
	}

	return index;
}

/**
 * Returns a free edge index
 * @private
 * @returns {int}
 */
function _getFreeEdge() {
	const ef = _edgeFree.get(this);
	let index = ef.shift();

	if (index === undefined) {
		const e = _edge.get(this);

		index = e.length / 4;
		e.push(-1, -1, -1, -1);
	}

	return index;
}

/**
 * Returns a free vertex index
 * @private
 * @returns {int}
 */
function _getFreeVertex() {
	const vf = _vertexFree.get(this);
	let index = vf.shift();

	if (index === undefined) {
		const v = _vertex.get(this);

		index = v.length / 2;
		v.push(-1, -1);
	}

	return index;
}


/**
 * Returns the index of the edge created from vertex0 and vertex1
 * @private
 * @param {int} vertex0 - The first vertex index
 * @param {int} vertex1 - the second vertex index
 * @returns {int}
 */
function _createEdge(vertex0, vertex1) {
	const e = _edge.get(this);
	const index = _getFreeEdge.call(this);

	const v0 = index * 4 + 2;

	e[v0] = vertex0, e[v0 + 1] = vertex1;

	_addVertexEdge.call(this, vertex0, index);
	_addVertexEdge.call(this, vertex1, index);

	return index;
}

/**
 * Removes the edge
 * @private
 * @param {int} edge - The edge index
 */
function _removeEdge(edge) {
	const e = _edge.get(this), f0 = edge * 4;
	const v0 = f0 + 2, v1 = f0 + 3;

	_removeVertexEdge.call(this, e[v0], edge);
	_removeVertexEdge.call(this, e[v1], edge);

	e[f0] = e[f0 + 1] = e[v0] = e[v1] = -1;

	_edgeFree.get(this).push(edge);
}


/**
 * Adds a vertex-edge relation to vertex
 * @private
 * @param {int} vertex - The vertex index
 * @param {int} edge - The edge index
 */
function _addVertexEdge(vertex, edge) {
	const v = _vertex.get(this), vE = _vertexEdge.get(this);
	let dirty = _vertexEdgeDirty.get(this);

	const e0 = vertex * 2, eN = e0 + 1;
	const l = vE.length, n = v[eN] - v[e0], tot = l + n + 1;

	vE.push(...vE.slice(v[e0], v[eN]).concat(edge)), dirty += n;
	v[e0] = l, v[eN] = tot;
	_vertexEdgeDirty.set(this, dirty);

	if (dirty / tot > 0.33) _updateVertexEdge.call(this);
}

/**
 * Removes a vertex-edge relation from vertex
 * @private
 * @param {int} vertex - The vertex index
 * @param {int} edge - The edge index
 */
function _removeVertexEdge(vertex, edge) {
	const v = _vertex.get(this), vE = _vertexEdge.get(this);
	let dirty = _vertexEdgeDirty.get(this);

	const e0 = vertex * 2, eN = e0 + 1;
	const l = vE.length, n = v[eN] - v[e0], tot = l + n - 1;

	const edges = vE.slice(v[e0], v[eN]);

	edges.splice(edges.indexOf(edge), 1);
	vE.push(...edges), dirty += n;
	v[e0] = l, v[eN] = tot;
	_vertexEdgeDirty.set(this, dirty);

	if (dirty / tot > 0.33) _updateVertexEdge.call(this);
}

/**
 * Updates all vertex-edge indices
 * @private
 */
function _updateVertexEdge() {
	const v = _vertex.get(this), vE = [], source = _vertexEdge.get(this);

	for (let i = 0, e = 0, l = v.length; i < l; i += 2) {
		if (v[i] === -1) continue;

		vE.push(...source.slice(v[i], v[i + 1]));

		v[i] = e, v[i + 1] = e = vE.length;
	}

	_vertexEdge.set(this, vE), _vertexEdgeDirty.set(this, 0);
}



/**
 * Planar triangle mesh
 */
export default class Polygon2 {

	/**
	 * Returns a defined instance
	 * @constructor
	 * @param {Polygon2} [target] - The target instance
	 * @returns {Polygon2}
	 */
	static Define(target) {
		if (target === undefined) target = new this();
		else this.call(target);

		return target;
	}

	/**
	 * Returns an instance created from json
	 * @constructor
	 * @param {Object} json - The json representation of the instance
	 * @param {Polygon2} [target] - The target instance
	 * @returns {Polygon2}
	 */
	static JSON(json, target) {
		const { f, p } = json;

		target = this.Define(target);

		for (let x = 0, l = p.length; x < l; x += 2) target.createVertex(new Vector2(p.slice(x, x + 2)));

		for (let v0 = 0, l = f.length; v0 < l; v0 += 3) target.createFace(f[v0], f[v0 + 1], f[v0 + 2]);

		return target;
	}


	/**
	 * Returns an instance from points
	 * Using TriangleSubdivisionTree
	 * @constructor
	 * @param {Vector2[]} points - The points
	 * @returns {Polygon2}
	 */
	static Points(points) {
		const aabb = Rectangle2.AABB(points);
		const bound = Triangle2.Equilateral(aabb.center, aabb.extend.norm * 2.0, 0.0, 1.0);

		const mesh = new TriangleSubdivisionTree(bound);

		mesh.addPoints(points);

		return mesh.poly;
	}

	/**
	 * Returns an instance from outline
	 * Using TriangleSubdivisionTree
	 * @constructor
	 * @param {PolyLine2} outline - The outline
	 * @returns {Polygon2}
	 */
	static PolyLine2(outline) {
		const aabb = Rectangle2.AABB(outline.point);
		const bound = Triangle2.Equilateral(aabb.center, aabb.extend.norm * 2.0, 0.0, 1.0);

		const mesh = new TriangleSubdivisionTree(bound);

		mesh.intersectOutline(outline);

		return mesh.poly;
	}


	/**
	 * Returns a copy of poly
	 * @constructor
	 * @param {Polygon2} poly - The source
	 * @param {Polygon2} [target] - The target instance
	 * @returns {Polygon2}
	 */
	static Copy(poly, target) {
		if (target === undefined) target = new Polygon2();
		else target.define();

		_face.set(target, _face.get(poly).slice(0));
		_faceFree.set(target, _faceFree.get(poly).slice(0));
		_edge.set(target, _edge.get(poly).slice(0));
		_edgeFree.set(target, _edgeFree.get(poly).slice(0));
		_vertex.set(target, _vertex.get(poly).slice(0));
		_vertexFree.set(target, _vertexFree.get(poly).slice(0));

		_vertexEdge.set(target, _vertexEdge.get(poly).slice(0));
		_vertexEdgeDirty.set(target, _vertexEdgeDirty.get(poly));

		const p = _point.get(poly);
		const q = [];

		for (let i = p.length - 1; i > -1; i -= 1) {
			if (i in p) q[i] = Vector2.Copy(p[i]);
		}

		_point.set(target, q);

		return target;
	}



	/**
	 * Creates a new instance
	 */
	constructor() {
		_face.set(this, []), _faceFree.set(this, []);
		_edge.set(this, []), _edgeFree.set(this, []);
		_vertex.set(this, []), _vertexFree.set(this, []);

		_vertexEdge.set(this, []);
		_vertexEdgeDirty.set(this, 0);

		_point.set(this, []);
	}


	/**
	 * Redefines the instance
	 * @returns {Polygon2}
	 */
	define() {
		this.constructor.call(this);

		return this;
	}


	/**
	 * The dereferenced defined face indices of the instance
	 * @type int[]
	 */
	get face() {
		const f = _face.get(this), res = [];

		for (let i = 0, e0 = 0, l = f.length; e0 < l; i += 1, e0 += 6) {
			if (f[e0] !== -1) res.push(i);
		}

		return res;
	}

	/**
	 * The dereferenced defined edge indices of the instance
	 * @type int[]
	 */
	get edge() {
		const e = _edge.get(this), res = [];

		for (let i = 0, f0 = 0, l = e.length; f0 < l; i += 1, f0 += 4) {
			if (e[f0] !== -1 || e[f0 + 1] !== -1) res.push(i);
		}

		return res;
	}

	/**
	 * The dereferenced defined vertex indices of the instance
	 * @type int[]
	 */
	get vertex() {
		const v = _vertex.get(this), res = [];

		for (let i = 0, e0 = 0, l = v.length; e0 < l; i += 1, e0 += 2) {
			if (v[e0] !== -1) res.push(i);
		}

		return res;
	}

	/**
	 * The deferenced list of points of the instance
	 * @type Vector2[]
	 */
	get point() {
		return _point.get(this).slice(0);
	}


	/**
	 * The dereferenced display list of vertex indices of the instance
	 * @type number[]
	 */
	get indexList() {
		const face = _face.get(this), res = [];

		for (let v0 = 3, l = face.length; v0 < l; v0 += 6) {
			if (face[v0] !== -1) res.push(face[v0], face[v0 + 1], face[v0 + 2]);
		}

		return res;
	}


	/**
	 * The dereferenced centroid point
	 * @returns {Vector2}
	 */
	get centroid() {
		const face = _face.get(this), point = _point.get(this), THIRD = 1.0 / 3.0;
		const tri = new Triangle2(), res = new Vector2();

		let atot = 0;

		for (let v0 = face.length - 3; v0 > -1; v0 -= 6) {
			tri.define(point[face[v0]], point[face[v0 + 1]], point[face[v0 + 2]]);

			const a = tri.area;

			res.addEQ(tri.centroid.multiplyScalarEQ(a));
			atot += a;
		}

		return res.multiplyScalarEQ(1 / atot);
	}

	/**
	 * The area sum((1/2)|AB x AC|)
	 * @returns {number}
	 */
	get area() {
		const face = _face.get(this), point = _point.get(this);
		const tri = new Triangle2();

		let res = 0.0;

		for (let v0 = face.length - 3; v0 > -1; v0 -= 6) {
			tri.define(point[face[v0]], point[face[v0 + 1]], point[face[v0 + 2]]);

			res += tri.area;
		}

		return res;
	}


	/**
	 * Returns true if face is a defined face index, false otherwise
	 * @param {int} face - The face index
	 * @returns {boolean}
	 */
	hasFace(face) {
		return _face.get(this)[face * 6] > -1;
	}

	/**
	 * Returns a ccw-ordered Array of edge indices associated with face
	 * @param {int} face - The face index
	 * @param {int} [vertex] - The first ccw vertex index of the first edge index
	 * @returns {int[]}
	 */
	edgeOfFace(face, vertex) {
		const f = _face.get(this), e0 = 6 * face;

		if (vertex === undefined) return [f[e0], f[e0 + 1], f[e0 + 2]];

		const v0 = face * 6 + 3;

		if (f[v0] === vertex) return [f[e0], f[e0 + 1], f[e0 + 2]];
		else if (f[v0 + 1] === vertex) return [f[e0 + 1], f[e0 + 2], f[e0]];
		else return [f[e0 + 2], f[e0], f[e0 + 1]];
	}

	/**
	 * Returns a ccw-ordered Array of vertex indices associated with face
	 * @param {int} face - The face index
	 * @param {int} [edge] - The edge index of the first ccw vertex index
	 * @returns {int[]}
	 */
	vertexOfFace(face, edge) {
		const f = _face.get(this), v0 = face * 6 + 3;

		if (edge === undefined) return [f[v0], f[v0 + 1], f[v0 + 2]];

		const e0 = face * 6;

		if (f[e0] === edge) return [f[v0], f[v0 + 1], f[v0 + 2]];
		else if (f[e0 + 1] === edge) return [f[v0 + 1], f[v0 + 2], f[v0]];
		else return [f[v0 + 2], f[v0], f[v0 + 1]];
	}

	/**
	 * Returns the ccw ordered points associated with face
	 * Proxies {@link Polygon2#vertexOfFace}
	 * @param {int} face - The face index
	 * @param {Int} [edge] - The edge index of the first ccw vertex index
	 * @returns {Vector2[]}
	 */
	pointOfFace(face, edge) {
		const point = _point.get(this);
		const [vertex0, vertex1, vertex2] = this.vertexOfFace(face, edge);

		return [point[vertex0], point[vertex1], point[vertex2]];
	}


	/**
	 * Returns true if edge is a defined edge index, false otherwise
	 * @param {int} edge - The edge index
	 * @returns {boolean}
	 */
	hasEdge(edge) {
		return _edge.get(this)[edge * 4] > -1;
	}

	/**
	 * Returns a front,back sorted Array of face indices associated with edge
	 * @param {int} edge - The edge index
	 * @param {int} [face] - The second face index
	 * @returns {int[]}
	 */
	faceOfEdge(edge, face) {
		const e = _edge.get(this), f0 = 4 * edge;

		if (face === undefined || e[f0] !== face) return [e[f0], e[f0 + 1]];
		else return [e[f0 + 1], e[f0]];
	}

	/**
	 * Returns a from,to sorted Array of vertex indices associated with edge
	 * @param {int} edge - The edge index
	 * @param {int} [vertex] - The second vertex index
	 * @returns {int[]}
	 */
	vertexOfEdge(edge, vertex) {
		const e = _edge.get(this), v0 = 4 * edge + 2;

		if (vertex === undefined || e[v0] !== vertex) return [e[v0], e[v0 + 1]];
		else return [e[v0 + 1], e[v0]];
	}

	/**
	 * Returns the from, to ordered points associated with edge
	 * Proxies {@link Polygon2#vertexOfEdge}
	 * @param {int} edge - The edge
	 * @param {int} [vertex] - The second vertex
	 * @returns {Vector2[]}
	 */
	pointOfEdge(edge, vertex) {
		const point = _point.get(this);
		const [vertex0, vertex1] = this.vertexOfEdge(edge, vertex);

		return [point[vertex0], point[vertex1]];
	}


	/**
	 * Returns true if vertex is a defined vertex index, false otherwise
	 * @param {int} vertex - The vertex index
	 * @returns {boolean}
	 */
	hasVertex(vertex) {
		return _vertex.get(this)[vertex * 2] > -1;
	}

	/**
	 * Returns an Array of face indices associated with vertex
	 * @param {int} vertex - The vertex index
	 * @param {int[]} [constraint] - Array of complementary face vertex indices
	 * @returns {int[]}
	 */
	faceOfVertex(vertex, constraint) {
		const e = _edge.get(this);
		const edge = this.edgeOfVertex(vertex, constraint), res = [];

		for (let i = edge.length - 1; i > -1; i -= 1) {		//REVIEW reverse iteration sorts resulting facelist in reverse order of edge creation
			const f0 = edge[i] * 4;
			const face0 = e[f0], face1 = e[f0 + 1];

			if (face0 !== -1 && res.indexOf(face0) === -1) res.push(face0);
			if (face1 !== -1 && res.indexOf(face1) === -1) res.push(face1);
		}

		return res;
	}

	/**
	 * Returns an Array of edge indices associated with vertex
	 * @param {int} vertex - The vertex index
	 * @param {int[]} [constraint] - Array of complementary edge vertex indices
	 * @returns {int[]}
	 */
	edgeOfVertex(vertex, constraint) {
		const v = _vertex.get(this), e0 = vertex * 2;
		const eN = _vertexEdge.get(this).slice(v[e0], v[e0 + 1]);

		if (constraint === undefined) return eN;

		const e = _edge.get(this), res = Array(constraint.length).fill(-1);

		for (let edge of eN) {
			const v0 = edge * 4 + 2;
			const index = constraint.indexOf(e[v0] !== vertex ? e[v0] : e[v0 + 1]);

			if (index !== -1) res[index] = edge;
		}

		return res;
	}

	/**
	 * Returns the point associated with vertex
	 * @param {int} vertex - The vertex
	 * @returns {Vector2}
	 */
	pointOfVertex(vertex) {
		return _point.get(this)[vertex];
	}


	/**
	 * Returns true if point is a defined point, false otherwise
	 * @param {Vector2} point - The point
	 * @returns {boolean}
	 */
	hasPoint(point) {
		return _point.get(this).indexOf(point) !== 0;
	}

	/**
	 * Returns the point at coordinates of point if found, null otherwise
	 * @param {Vector2} point - The point
	 * @returns {Vector2|null}
	 */
	pointAt(point) {
		const points = _point.get(this);

		for (let p of points) {
			if (Vector2.isEQ(p, point)) return p;
		}

		return null;
	}

	/**
	 * Returns the vertex index associated with point
	 * @param {Vector2} point - The point
	 * @returns {int}
	 */
	vertexOfPoint(point) {
		return _point.get(this).indexOf(point);
	}


	/**
	 * Returns the index of the face created between vertex0, vertex1 and vertex2
	 * @param {int} vertex0 - The first vertex
	 * @param {int} vertex1 - The second vertex
	 * @param {int} vertex2 - The third vertex
	 * @returns {int}
	 */
	createFace(vertex0, vertex1, vertex2) {
		const f = _face.get(this), e = _edge.get(this);

		let edge = this.edgeOfVertex(vertex0, [vertex1, vertex2]);
		const edge0 = edge[0] > -1 ? edge[0] : _createEdge.call(this, vertex0, vertex1);
		const edge2 = edge[1] > -1 ? edge[1] : _createEdge.call(this, vertex2, vertex0);

		edge = this.edgeOfVertex(vertex1, [vertex2]);
		const edge1 = edge[0] > -1 ? edge[0] : _createEdge.call(this, vertex1, vertex2);

		const index = _getFreeFace.call(this), e0 = index * 6;
		const e0f0 = edge0 * 4, e1f0 = edge1 * 4, e2f0 = edge2 * 4;

		f[e0]     = edge0  , f[e0 + 1] = edge1  , f[e0 + 2] = edge2;
		f[e0 + 3] = vertex0, f[e0 + 4] = vertex1, f[e0 + 5] = vertex2;

		e[e0f0 + 2] === vertex0 ? e[e0f0] = index : e[e0f0 + 1] = index;
		e[e1f0 + 2] === vertex1 ? e[e1f0] = index : e[e1f0 + 1] = index;
		e[e2f0 + 2] === vertex2 ? e[e2f0] = index : e[e2f0 + 1] = index;

		return index;
	}

	/**
	 * Removes face
	 * @param {int} face - The face index
	 */
	removeFace(face) {
		const f = _face.get(this), e = _edge.get(this);
		const e0 = face * 6, e1 = e0 + 1, e2 = e0 + 2;
		const edge0 = f[e0], edge1 = f[e1], edge2 = f[e2];

		f[e0] = f[e1] = f[e2] = f[e0 + 3] = f[e0 + 4] = f[e0 + 5] = -1;

		let e0fA = edge0 * 4, e1fA = edge1 * 4, e2fA = edge2 * 4;
		const e0fB = e[e0fA] === face ? e0fA + 1 : e0fA++;
		const e1fB = e[e1fA] === face ? e1fA + 1 : e1fA++;
		const e2fB = e[e2fA] === face ? e2fA + 1 : e2fA++;

		e[e0fA] = e[e1fA] = e[e2fA] = -1;

		_faceFree.get(this).push(face);

		if (e[e0fB] === -1) _removeEdge.call(this, edge0);
		if (e[e1fB] === -1) _removeEdge.call(this, edge1);
		if (e[e2fB] === -1) _removeEdge.call(this, edge2);
	}

	/**
	 * Returns the index of the vertex created from p
	 * @param {Vector2} p - The point
	 * @returns {int}
	 */
	createVertex(p) {
		const v = _vertex.get(this), point = _point.get(this);
		const index = _getFreeVertex.call(this), e0 = index * 2;

		v[e0] = v[e0 + 1] = 0;
		point[index] = p;

		return index;
	}

	/**
	 * Removes vertex and all associated faces
	 * @param {int} vertex
	 */
	removeVertex(vertex) {
		const face = this.faceOfVertex(vertex);

		for (let i = face.length - 1; i > -1; i -= 1) this.removeFace(face[i]);

		const v = _vertex.get(this), e0 = vertex * 2;

		v[e0] = v[e0 + 1] = -1;

		_vertexFree.get(this).push(vertex);

		delete _point.get(this)[vertex];
	}

	/**
	 * Removes all isolated vertices
	 * @returns {Polygon2}
	 */
	clearIsolatedVertices() {
		for (let v of this.vertex) {
			if (this.faceOfVertex(v).length === 0) this.removeVertex(v);
		}

		return this;
	}


	/**
	 * Returns the subdivision vertex index of the faces created by subdividing face
	 * @param {int} face - The source face index
	 * @param {Vector2} [point] - The subdivision point
	 * @returns {int}
	 */
	subdivideFace(face, point) {
		const f = _face.get(this), v0 = face * 6 + 3;
		const vertex0 = f[v0], vertex1 = f[v0 + 1], vertex2 = f[v0 + 2];

		this.removeFace(face);

		if (point === undefined) {
			const p = _point.get(this);

			point = Triangle2.centroid(p[vertex0], p[vertex1], p[vertex2]);
		}

		const vertex3 = this.createVertex(point);

		this.createFace(vertex0, vertex1, vertex3);
		this.createFace(vertex1, vertex2, vertex3);
		this.createFace(vertex2, vertex0, vertex3);

		return vertex3;
	}

	/**
	 * Returns the split vertex index of the edges created by splitting edge
	 * @param {int} edge - The source edge index
	 * @param {Vector2} [point] - The splitting point
	 * @returns {int}
	 */
	splitEdge(edge, point) {
		const e = _edge.get(this), f0 = edge * 4, f1 = f0 + 1, ef1 = e[f1];

		if (point === undefined) {
			var p = _point.get(this);

			point = Vector2.Add(p[e[f0 + 2]], p[e[f0 + 3]]).multiplyScalarEQ(0.5);
		}

		const v3 = this.createVertex(point);

		if (e[f0] !== -1) {
			const [v0, v1, v2] = this.vertexOfFace(e[f0], edge);

			this.removeFace(e[f0]);
			this.createFace(v0, v3, v2);
			this.createFace(v3, v1, v2);
		}

		if (ef1 !== -1) {
			const [v0, v1, v2] = this.vertexOfFace(e[f1], edge);

			this.removeFace(e[f1]);
			this.createFace(v0, v3, v2);
			this.createFace(v3, v1, v2);
		}

		return v3;
	}

	/**
	 * Returns the index of the edge created by turning edge
	 * @param {int} edge - The edge
	 * @returns {int}
	 */
	turnEdge(edge) {
		const e = _edge.get(this), f0 = edge * 4, f1 = f0 + 1;
		const [f0v0, f0v1, f0v2] = this.vertexOfFace(e[f0], edge);
		const [f1v0, f1v1, f1v2] = this.vertexOfFace(e[f1], edge);

		this.removeFace(e[f0]);
		this.removeFace(e[f1]);

		this.createFace(f1v2, f0v2, f0v0);
		this.createFace(f0v2, f1v2, f0v1);

		return this.edgeOfVertex(f0v2, [f1v2])[0];
	}

	/**
	 * Returns true if the instance intersects with q, false otherwise
	 * @param {Vector2} q - The antagonist
	 * @param {number[]} [fuv] - The face index and barycentric (u,v) coordindates
	 * @returns {boolean}
	 */
	intersectsPoint(q, fuv) {
		const f = _face.get(this), point = _point.get(this);

		const uv = fuv !== undefined ? [] : undefined;

		for (let v0 = f.length - 3; v0 > -1; v0 -= 6) {
			if (f[v0] === -1) continue;

			const p0 = point[f[v0]], p1 = point[f[v0 + 1]], p2 = point[f[v0 + 2]];

			if (!Triangle2.intersectPoint(p0, p1, p2, q, uv)) continue;

			if (fuv !== undefined) fuv.splice(0, fuv.length, (v0 - 3) / 6, ...uv);

			return true;
		}

		return false;
	}

	/**
	 * Returns true if the instance intersects with poly, false otherwise
	 * @param {Polygon2} poly - The antagonist
	 * @returns {boolean}
	 */
	intersects(poly) {
		const fA = _face.get(this), fB = _face.get(poly);
		const pA = _point.get(this), pB = _point.get(poly);

		for (let vA0 = fA.length - 3; vA0 > -1; vA0 -= 6) {
			if (fA[vA0] === -1) continue;

			const pA0 = pA[fA[vA0]], pA1 = pA[fA[vA0 + 1]], pA2 = pA[fA[vA0 + 2]];

			for (let vB0 = fB.length - 3; vB0 > -1; vB0 -= 6) {
				if (fB[vB0] === -1) continue;

				const pB0 = pB[fB[vB0]], pB1 = pB[fB[vB0 + 1]], pB2 = pB[fB[vB0 + 2]];

				if (Triangle2.intersect(pA0, pA1, pA2, pB0, pB1, pB2)) return true;
			}
		}

		return false;
	}


	/**
	 * The transformation of poly
	 * @param {Polygon2} poly - The source
	 * @param {Matrix3} transform - The transform
	 * @returns {Polygon2}
	 */
	transformationOf(poly, transform) {
		if (this !== poly) this.copyOf(poly);

		return this.transformation(transform);
	}

	/**
	 * The copy of poly
	 * @param {Polygon2} poly - The source polygon
	 * @returns {Polygon2}
	 */
	copyOf(poly) {
		return Polygon2.Copy(poly, this);
	}


	/**
	 * The transformation of the instance
	 * @param {Matrix3} transform - the transform
	 * @returns {Polygon2}
	 */
	transformation(transform) {
		const point = _point.get(this);

		for (let i = point.length - 1; i > -1; i -= 1) {
			if (!(i in point)) continue;

			const p = point[i];

			Vector2.Multiply2x3Matrix3(transform, p, p);
		}

		return this;
	}


	/**
	 * Returns a json reprentation of the instance
	 * @returns {{f: int[], p: float[]}}
	 */
	toJSON() {
		const face = _face.get(this);
		const point = _point.get(this);
		const map = {}, p = [], f = [];

		for (let v0 = 3, l = face.length; v0 < l; v0 += 6) {
			for (let i = 0; i < 3; i += 1) {
				const vertex = face[v0 + i];

				if (!(vertex in map)) {
					map[vertex] = p.length * 0.5;
					p.push(...point[vertex].n);
				}

				f.push(map[vertex]);
			}
		}

		return {
			f,
			p
		};
	}
}
