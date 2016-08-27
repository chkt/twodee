'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

var _Triangle = require('./Triangle2');

var _Triangle2 = _interopRequireDefault(_Triangle);

var _Rectangle = require('./Rectangle2');

var _Rectangle2 = _interopRequireDefault(_Rectangle);

var _TriangleSubdivisionTree = require('./TriangleSubdivisionTree');

var _TriangleSubdivisionTree2 = _interopRequireDefault(_TriangleSubdivisionTree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _face = new WeakMap(),
    _faceFree = new WeakMap();
var _edge = new WeakMap(),
    _edgeFree = new WeakMap();
var _vertex = new WeakMap(),
    _vertexFree = new WeakMap();

var _vertexEdge = new WeakMap();
var _vertexEdgeDirty = new WeakMap();

var _point = new WeakMap();

function _getFreeFace() {
	var ff = _faceFree.get(this);
	var index = ff.shift();

	if (index === undefined) {
		var f = _face.get(this);

		index = f.length / 6;
		f.push(-1, -1, -1, -1, -1, -1);
	}

	return index;
}

function _getFreeEdge() {
	var ef = _edgeFree.get(this);
	var index = ef.shift();

	if (index === undefined) {
		var e = _edge.get(this);

		index = e.length / 4;
		e.push(-1, -1, -1, -1);
	}

	return index;
}

function _getFreeVertex() {
	var vf = _vertexFree.get(this);
	var index = vf.shift();

	if (index === undefined) {
		var v = _vertex.get(this);

		index = v.length / 2;
		v.push(-1, -1);
	}

	return index;
}

function _createEdge(vertex0, vertex1) {
	var e = _edge.get(this);
	var index = _getFreeEdge.call(this);

	var v0 = index * 4 + 2;
	e[v0] = vertex0, e[v0 + 1] = vertex1;

	_addVertexEdge.call(this, vertex0, index);
	_addVertexEdge.call(this, vertex1, index);

	return index;
}

function _removeEdge(edge) {
	var e = _edge.get(this),
	    f0 = edge * 4;
	var v0 = f0 + 2,
	    v1 = f0 + 3;

	_removeVertexEdge.call(this, e[v0], edge);
	_removeVertexEdge.call(this, e[v1], edge);

	e[f0] = e[f0 + 1] = e[v0] = e[v1] = -1;

	_edgeFree.get(this).push(edge);
}

function _addVertexEdge(vertex, edge) {
	var v = _vertex.get(this),
	    vE = _vertexEdge.get(this);
	var dirty = _vertexEdgeDirty.get(this);

	var e0 = vertex * 2,
	    eN = e0 + 1;
	var l = vE.length,
	    n = v[eN] - v[e0],
	    tot = l + n + 1;

	vE.push.apply(vE, _toConsumableArray(vE.slice(v[e0], v[eN]).concat(edge))), dirty += n;
	v[e0] = l, v[eN] = tot;
	_vertexEdgeDirty.set(this, dirty);

	if (dirty / tot > 0.33) _updateVertexEdge.call(this);
}

function _removeVertexEdge(vertex, edge) {
	var v = _vertex.get(this),
	    vE = _vertexEdge.get(this);
	var dirty = _vertexEdgeDirty.get(this);

	var e0 = vertex * 2,
	    eN = e0 + 1;
	var l = vE.length,
	    n = v[eN] - v[e0],
	    tot = l + n - 1;

	var edges = vE.slice(v[e0], v[eN]);

	edges.splice(edges.indexOf(edge), 1);
	vE.push.apply(vE, _toConsumableArray(edges)), dirty += n;
	v[e0] = l, v[eN] = tot;
	_vertexEdgeDirty.set(this, dirty);

	if (dirty / tot > 0.33) _updateVertexEdge.call(this);
}

function _updateVertexEdge() {
	var v = _vertex.get(this),
	    vE = [],
	    source = _vertexEdge.get(this);

	for (var i = 0, e = 0, l = v.length; i < l; i += 2) {
		if (v[i] === -1) continue;

		vE.push.apply(vE, _toConsumableArray(source.slice(v[i], v[i + 1])));

		v[i] = e, v[i + 1] = e = vE.length;
	}

	_vertexEdge.set(this, vE), _vertexEdgeDirty.set(this, 0);
}

/**
 * Planar triangle mesh
 */

var Polygon2 = function () {
	_createClass(Polygon2, null, [{
		key: 'Points',


		/**
   * Returns an instance from points
   * Using Delaunay Triangulation
   * @constructor
   * @param {Vector2[]} points - The points
   * @param {Polygon2} [target] - The target instance
   * @returns {Polygon2}
   */
		value: function Points(points, target) {
			if (target === undefined) target = new Polygon2();else target.define();

			var aabb = _Rectangle2.default.AABB(points);
			var bound = _Triangle2.default.Equilateral(aabb.center, aabb.extend.norm, 0.0, 1.1);

			var mesh = new _TriangleSubdivisionTree2.default(bound);

			mesh.addPoints(points);

			return mesh.poly;
		}

		/**
   * Returns a copy of poly
   * @constructor
   * @param {Polygon2} poly - The source
   * @param {Polygon2} [target] - The target instance
   * @returns {Polygon2}
   */

	}, {
		key: 'Copy',
		value: function Copy(poly, target) {
			if (target === undefined) target = new Polygon2();else target.define();

			_face.set(target, _face.get(poly).slice(0));
			_faceFree.set(target, _faceFree.get(poly).slice(0));
			_edge.set(target, _edge.get(poly).slice(0));
			_edgeFree.set(target, _edgeFree.get(poly).slice(0));
			_vertex.set(target, _vertex.get(poly).slice(0));
			_vertexFree.set(target, _vertexFree.get(poly).slice(0));

			_vertexEdge.set(target, _vertexEdge.get(poly).slice(0));
			_vertexEdgeDirty.set(target, _vertexEdgeDirty.get(poly));

			var p = _point.get(poly);
			var q = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = p[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var point = _step.value;
					q.push(_Vector2.default.Copy(point));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			_point.set(target, q);

			return target;
		}

		/**
   * Creates a new instance
   */

	}]);

	function Polygon2() {
		_classCallCheck(this, Polygon2);

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


	_createClass(Polygon2, [{
		key: 'define',
		value: function define() {
			this.constructor.call(this);

			return this;
		}

		/**
   * The dereferenced defined face indices of the instance
   * @type int[]
   */

	}, {
		key: 'hasFace',


		/**
   * Returns true if face is a defined face index, false otherwise
   * @param {int} face - The face index
   * @returns {boolean}
   */
		value: function hasFace(face) {
			return _face.get(this)[face * 6] > -1;
		}

		/**
   * Returns a ccw-ordered Array of edge indices associated with face
   * @param {int} face - The face index
   * @param {int} [vertex] - The first ccw vertex index of the first edge index
   * @returns {int[]}
   */

	}, {
		key: 'edgeOfFace',
		value: function edgeOfFace(face, vertex) {
			var f = _face.get(this),
			    e0 = 6 * face;

			if (vertex === undefined) return [f[e0], f[e0 + 1], f[e0 + 2]];

			var v0 = face * 6 + 3;

			if (f[v0] === vertex) return [f[e0], f[e0 + 1], f[e0 + 2]];else if (f[v0 + 1] === vertex) return [f[e0 + 1], f[e0 + 2], f[e0]];else return [f[e0 + 2], f[e0], f[e0 + 1]];
		}

		/**
   * Returns a ccw-ordered Array of vertex indices associated with face
   * @param {int} face - The face index
   * @param {int} [edge] - The edge index of the first ccw vertex index
   * @returns {int[]}
   */

	}, {
		key: 'vertexOfFace',
		value: function vertexOfFace(face, edge) {
			var f = _face.get(this),
			    v0 = face * 6 + 3;

			if (edge === undefined) return [f[v0], f[v0 + 1], f[v0 + 2]];

			var e0 = face * 6;

			if (f[e0] === edge) return [f[v0], f[v0 + 1], f[v0 + 2]];else if (f[e0 + 1] === edge) return [f[v0 + 1], f[v0 + 2], f[v0]];else return [f[v0 + 2], f[v0], f[v0 + 1]];
		}

		/**
   * Returns true if edge is a defined edge index, false otherwise
   * @param {int} edge - The edge index
   * @returns {boolean}
   */

	}, {
		key: 'hasEdge',
		value: function hasEdge(edge) {
			return _edge.get(this)[edge * 4] > -1;
		}

		/**
   * Returns a front,back sorted Array of face indices associated with edge
   * @param {int} edge - The edge index
   * @param {int} [face] - The second face index
   * @returns {int[]}
   */

	}, {
		key: 'faceOfEdge',
		value: function faceOfEdge(edge, face) {
			var e = _edge.get(this),
			    f0 = 4 * edge;

			if (face === undefined || e[f0] !== face) return [e[f0], e[f0 + 1]];else return [e[f0 + 1], e[f0]];
		}

		/**
   * Returns a from,to sorted Array of vertex indices associated with edge
   * @param {int} edge - The edge index
   * @param {int} [vertex] - The second vertex index
   * @returns {int[]}
   */

	}, {
		key: 'vertexOfEdge',
		value: function vertexOfEdge(edge, vertex) {
			var e = _edge.get(this),
			    v0 = 4 * edge + 2;

			if (vertex === undefined || e[v0] !== vertex) return [e[v0], e[v0 + 1]];else return [e[v0 + 1], e[v0]];
		}

		/**
   * Returns true if vertex is a defined vertex index, false otherwise
   * @param {int} vertex - The vertex index
   * @returns {boolean}
   */

	}, {
		key: 'hasVertex',
		value: function hasVertex(vertex) {
			return _vertex.get(this)[vertex * 2] > -1;
		}

		/**
   * Returns an Array of face indices associated with vertex
   * @param {int} vertex - The vertex index
   * @param {int[]} [constraint] - Array of complementary face vertex indices
   * @returns {int[]}
   */

	}, {
		key: 'faceOfVertex',
		value: function faceOfVertex(vertex, constraint) {
			var e = _edge.get(this);
			var edge = this.edgeOfVertex(vertex, constraint),
			    res = [];

			for (var i = edge.length - 1; i > -1; i -= 1) {
				//REVIEW reverse iteration sorts resulting facelist in reverse order of edge creation
				var f0 = edge[i] * 4;
				var face0 = e[f0],
				    face1 = e[f0 + 1];

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

	}, {
		key: 'edgeOfVertex',
		value: function edgeOfVertex(vertex, constraint) {
			var v = _vertex.get(this),
			    e0 = vertex * 2;
			var eN = _vertexEdge.get(this).slice(v[e0], v[e0 + 1]);

			if (constraint === undefined) return eN;

			var e = _edge.get(this),
			    res = Array(constraint.length).fill(-1);

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = eN[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var edge = _step2.value;

					var v0 = edge * 4 + 2;
					var index = constraint.indexOf(e[v0] !== vertex ? e[v0] : e[v0 + 1]);

					if (index !== -1) res[index] = edge;
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return res;
		}

		/**
   * Returns the ccw ordered points associated with face
   * Proxies {@link Polygon2#vertexOfFace}
   * @param {int} face - The face index
   * @param {Int} [edge] - The edge index of the first ccw vertex index
   * @returns {Vector2[]}
   */

	}, {
		key: 'pointOfFace',
		value: function pointOfFace(face, edge) {
			var point = _point.get(this);

			var _vertexOfFace = this.vertexOfFace(face, edge);

			var _vertexOfFace2 = _slicedToArray(_vertexOfFace, 3);

			var vertex0 = _vertexOfFace2[0];
			var vertex1 = _vertexOfFace2[1];
			var vertex2 = _vertexOfFace2[2];


			return [point[vertex0], point[vertex1], point[vertex2]];
		}

		/**
   * Returns the from, to ordered points associated with edge
   * Proxies {@link Polygon2#vertexOfEdge}
   * @param {int} edge - The edge
   * @param {int} [vertex] - The second vertex
   * @returns {Vector2[]}
   */

	}, {
		key: 'pointOfEdge',
		value: function pointOfEdge(edge, vertex) {
			var point = _point.get(this);

			var _vertexOfEdge = this.vertexOfEdge(edge, vertex);

			var _vertexOfEdge2 = _slicedToArray(_vertexOfEdge, 2);

			var vertex0 = _vertexOfEdge2[0];
			var vertex1 = _vertexOfEdge2[1];


			return [point[vertex0], point[vertex1]];
		}

		/**
   * Returns the point associated with vertex
   * @param {int} vertex - The vertex
   * @returns {Vector2}
   */

	}, {
		key: 'pointOfVertex',
		value: function pointOfVertex(vertex) {
			return _point.get(this)[vertex];
		}

		/**
   * Returns the index of the face created between vertex0, vertex1 and vertex2
   * @param {int} vertex0 - The first vertex
   * @param {int} vertex1 - The second vertex
   * @param {int} vertex2 - The third vertex
   * @returns {int}
   */

	}, {
		key: 'createFace',
		value: function createFace(vertex0, vertex1, vertex2) {
			var f = _face.get(this),
			    e = _edge.get(this);

			var edge = this.edgeOfVertex(vertex0, [vertex1, vertex2]);
			var edge0 = edge[0] > -1 ? edge[0] : _createEdge.call(this, vertex0, vertex1);
			var edge2 = edge[1] > -1 ? edge[1] : _createEdge.call(this, vertex2, vertex0);

			edge = this.edgeOfVertex(vertex1, [vertex2]);
			var edge1 = edge[0] > -1 ? edge[0] : _createEdge.call(this, vertex1, vertex2);

			var index = _getFreeFace.call(this),
			    e0 = index * 6;
			var e0f0 = edge0 * 4,
			    e1f0 = edge1 * 4,
			    e2f0 = edge2 * 4;

			f[e0] = edge0, f[e0 + 1] = edge1, f[e0 + 2] = edge2;
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

	}, {
		key: 'removeFace',
		value: function removeFace(face) {
			var f = _face.get(this),
			    e = _edge.get(this);
			var e0 = face * 6,
			    e1 = e0 + 1,
			    e2 = e0 + 2;
			var edge0 = f[e0],
			    edge1 = f[e1],
			    edge2 = f[e2];

			f[e0] = f[e1] = f[e2] = f[e0 + 3] = f[e0 + 4] = f[e0 + 5] = -1;

			var e0fA = edge0 * 4,
			    e1fA = edge1 * 4,
			    e2fA = edge2 * 4;
			var e0fB = e[e0fA] === face ? e0fA + 1 : e0fA++;
			var e1fB = e[e1fA] === face ? e1fA + 1 : e1fA++;
			var e2fB = e[e2fA] === face ? e2fA + 1 : e2fA++;

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

	}, {
		key: 'createVertex',
		value: function createVertex(p) {
			var v = _vertex.get(this),
			    point = _point.get(this);
			var index = _getFreeVertex.call(this),
			    e0 = index * 2;

			v[e0] = v[e0 + 1] = 0;
			point[index] = p;

			return index;
		}

		/**
   * Removes vertex and all associated faces
   * @param {int} vertex
   */

	}, {
		key: 'removeVertex',
		value: function removeVertex(vertex) {
			var face = this.faceOfVertex(vertex);

			for (var i = face.length - 1; i > -1; i -= 1) {
				this.removeFace(face[i]);
			}var v = _vertex.get(this),
			    e0 = vertex * 2;

			v[e0] = v[e0 + 1] = -1;

			_vertexFree.get(this).push(vertex);
			_point.get(this)[vertex] = null;
		}

		/**
   * Returns the subdivision vertex index of the faces created by subdividing face
   * @param {int} face - The source face index
   * @param {Vector2} [point] - The subdivision point
   * @returns {int}
   */

	}, {
		key: 'subdivideFace',
		value: function subdivideFace(face, point) {
			var f = _face.get(this),
			    v0 = face * 6 + 3;
			var vertex0 = f[v0],
			    vertex1 = f[v0 + 1],
			    vertex2 = f[v0 + 2];

			this.removeFace(face);

			if (point === undefined) {
				var p = _point.get(this);

				point = _Triangle2.default.centroid(p[vertex0], p[vertex1], p[vertex2]);
			}

			var vertex3 = this.createVertex(point);

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

	}, {
		key: 'splitEdge',
		value: function splitEdge(edge, point) {
			var e = _edge.get(this),
			    f0 = edge * 4;

			if (point === undefined) {
				var p = _point.get(this);

				point = _Vector2.default.Add(p[e[f0 + 2]], p[e[f0 + 3]]).multiplyScalarEQ(0.5);
			}

			var vertex = this.createVertex(point);

			if (e[f0] !== -1) {
				var vertexN = this.vertexOfFace(e[f0], edge);

				this.removeFace(e[f0]);
				this.createFace(vertexN[0], vertex, vertexN[2]);
				this.createFace(vertex, vertexN[1], vertexN[2]);
			}

			if (e[f0 + 1] !== -1) {
				var _vertexN = this.vertexOfFace(e[f0], edge);

				this.removeFace(e[f0]);
				this.createFace(_vertexN[0], vertex, _vertexN[2]);
				this.createFace(vertex, _vertexN[1], _vertexN[2]);
			}

			return vertex;
		}

		/**
   * Returns the index of the edge created by turning edge
   * @param {int} edge - The edge
   * @returns {int}
   */

	}, {
		key: 'turnEdge',
		value: function turnEdge(edge) {
			var e = _edge.get(this),
			    f0 = edge * 4,
			    f1 = f0 + 1;

			var _vertexOfFace3 = this.vertexOfFace(e[f0], edge);

			var _vertexOfFace4 = _slicedToArray(_vertexOfFace3, 3);

			var f0v0 = _vertexOfFace4[0];
			var f0v1 = _vertexOfFace4[1];
			var f0v2 = _vertexOfFace4[2];

			var _vertexOfFace5 = this.vertexOfFace(e[f1], edge);

			var _vertexOfFace6 = _slicedToArray(_vertexOfFace5, 3);

			var f1v0 = _vertexOfFace6[0];
			var f1v1 = _vertexOfFace6[1];
			var f1v2 = _vertexOfFace6[2];


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

	}, {
		key: 'intersectsPoint',
		value: function intersectsPoint(q, fuv) {
			var f = _face.get(this),
			    point = _point.get(this);

			var uv = fuv !== undefined ? [] : undefined;

			for (var i = f.length - 1; i > -1; i -= 1) {
				var v0 = i * 6 + 3;
				var p0 = point[f[v0]],
				    p1 = point[f[v0 + 1]],
				    p2 = point[f[v0 + 2]];

				if (!_Triangle2.default.intersectPoint(p0, p1, p2, q, uv)) continue;

				if (fuv !== undefined) fuv.splice.apply(fuv, [0, fuv.length, i].concat(_toConsumableArray(uv)));

				return true;
			}

			return false;
		}

		/**
   * The copy of poly
   * @param {Polygon2} poly - The source polygon
   * @returns {Polygon2}
   */

	}, {
		key: 'copyOf',
		value: function copyOf(poly) {
			return Polygon2.Copy(poly, this);
		}
	}, {
		key: 'face',
		get: function get() {
			var f = _face.get(this),
			    res = [];

			for (var i = 0, e0 = 0, l = f.length; e0 < l; i += 1, e0 += 6) {
				if (f[e0] !== -1) res.push(i);
			}

			return res;
		}

		/**
   * The dereferenced defined edge indices of the instance
   * @type int[]
   */

	}, {
		key: 'edge',
		get: function get() {
			var e = _edge.get(this),
			    res = [];

			for (var i = 0, f0 = 0, l = e.length; f0 < l; i += 1, f0 += 4) {
				if (e[f0] !== -1 || e[f0 + 1] !== -1) res.push(i);
			}

			return res;
		}

		/**
   * The dereferenced defined vertex indices of the instance
   * @type int[]
   */

	}, {
		key: 'vertex',
		get: function get() {
			var v = _vertex.get(this),
			    res = [];

			for (var i = 0, e0 = 0, l = v.length; e0 < l; i += 1, e0 += 2) {
				if (v[e0] !== -1) res.push(i);
			}

			return res;
		}
	}]);

	return Polygon2;
}();

exports.default = Polygon2;