'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Vector = require('xyzw/es5/Vector2');

var _Vector2 = _interopRequireDefault(_Vector);

var _Triangle = require('./Triangle2');

var _Triangle2 = _interopRequireDefault(_Triangle);

var _Polygon = require('./Polygon2');

var _Polygon2 = _interopRequireDefault(_Polygon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SIZE = 7;
var SUB0 = 0,
    SUB1 = 1,
    SUB2 = 2,
    P0 = 4,
    P1 = 5,
    P2 = 6,
    FACE = 3;

var _poly = new WeakMap();

var _tree = new WeakMap();
var _faceIndex = new WeakMap();

function _treeSubdivide(faces, subfaces) {
	var poly = _poly.get(this),
	    tree = _tree.get(this),
	    index = _faceIndex.get(this);

	if (faces.length === 0) return;

	var _subfaces = _slicedToArray(subfaces, 3);

	var f0 = _subfaces[0];
	var f1 = _subfaces[1];
	var f2 = _subfaces[2];

	var o0 = tree.length,
	    o1 = o0 + SIZE,
	    o2 = f2 !== undefined ? o1 + SIZE : -1;

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = faces[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var face = _step.value;
			tree.splice(index[face], 4, o0, o1, o2, -1);
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

	tree.push.apply(tree, [-1, -1, -1, f0].concat(_toConsumableArray(poly.pointOfFace(f0))));
	tree.push.apply(tree, [-1, -1, -1, f1].concat(_toConsumableArray(poly.pointOfFace(f1))));
	index[f0] = o0, index[f1] = o1;

	if (f2 !== undefined) {
		tree.push.apply(tree, [-1, -1, -1, f2].concat(_toConsumableArray(poly.pointOfFace(f2))));
		index[f2] = o2;
	}
}

var TriangleSubdivisionTree = function () {
	function TriangleSubdivisionTree(boundary) {
		_classCallCheck(this, TriangleSubdivisionTree);

		var poly = new _Polygon2.default();

		var v0 = poly.createVertex(boundary.p0);
		var v1 = poly.createVertex(boundary.p1);
		var v2 = poly.createVertex(boundary.p2);

		var f0 = poly.createFace(v0, v1, v2);

		_poly.set(this, poly);

		_tree.set(this, [-1, -1, -1, f0, boundary.p0, boundary.p1, boundary.p2]);
		_faceIndex.set(this, [0]);
	}

	_createClass(TriangleSubdivisionTree, [{
		key: 'intersectsPoint',
		value: function intersectsPoint(q) {
			var tree = _tree.get(this);
			var queue = [0];

			for (var offset = queue.pop(); offset !== undefined; offset = queue.pop()) {
				var t0 = tree[offset + SUB0],
				    t1 = tree[offset + SUB1],
				    t2 = tree[offset + SUB2];
				var p0 = tree[offset + P0],
				    p1 = tree[offset + P1],
				    p2 = tree[offset + P2];
				var face = tree[offset + FACE],
				    uv = [];

				if (!_Triangle2.default.intersectPoint(p0, p1, p2, q, uv)) continue;

				if (face === -1) {
					queue = [t0, t1];

					if (t2 !== -1) queue.push(t2);

					continue;
				}

				return {
					face: face,
					uv: uv
				};
			}

			return null;
		}
	}, {
		key: 'subdivideFace',
		value: function subdivideFace(face, q) {
			var poly = _poly.get(this);

			var v3 = poly.subdivideFace(face, q);

			var _poly$faceOfVertex = poly.faceOfVertex(v3);

			var _poly$faceOfVertex2 = _slicedToArray(_poly$faceOfVertex, 3);

			var f0 = _poly$faceOfVertex2[0];
			var f1 = _poly$faceOfVertex2[1];
			var f2 = _poly$faceOfVertex2[2];


			_treeSubdivide.call(this, [face], [f0, f1, f2]);

			return [{ face: f0, edge: poly.edgeOfFace(f0, v3)[1] }, { face: f1, edge: poly.edgeOfFace(f1, v3)[1] }, { face: f2, edge: poly.edgeOfFace(f2, v3)[1] }];
		}
	}, {
		key: 'splitEdge',
		value: function splitEdge(edge, q) {
			var poly = _poly.get(this);

			var _poly$faceOfEdge = poly.faceOfEdge(edge);

			var _poly$faceOfEdge2 = _slicedToArray(_poly$faceOfEdge, 2);

			var face0 = _poly$faceOfEdge2[0];
			var face1 = _poly$faceOfEdge2[1];

			var _poly$pointOfFace = poly.pointOfFace(face0, edge);

			var _poly$pointOfFace2 = _slicedToArray(_poly$pointOfFace, 3);

			var p0 = _poly$pointOfFace2[0];
			var p1 = _poly$pointOfFace2[1];
			var p2 = _poly$pointOfFace2[2];


			q = _Vector2.default.Subtract(p1, p0).projectEQ(_Vector2.default.Subtract(q, p0)).addEQ(p1);

			var v4 = poly.splitEdge(edge, q);

			var _poly$faceOfVertex3 = poly.faceOfVertex(v4);

			var _poly$faceOfVertex4 = _slicedToArray(_poly$faceOfVertex3, 4);

			var f0 = _poly$faceOfVertex4[0];
			var f1 = _poly$faceOfVertex4[1];
			var f2 = _poly$faceOfVertex4[2];
			var f3 = _poly$faceOfVertex4[3];


			_treeSubdivide.call(this, [face0], [f3, f2]);
			_treeSubdivide.call(this, [face1], [f1, f0]);

			return [{ face: f0, edge: poly.edgeOfFace(f0, v4)[1] }, { face: f1, edge: poly.edgeOfFace(f1, v4)[1] }, { face: f2, edge: poly.edgeOfFace(f2, v4)[1] }, { face: f3, edge: poly.edgeOfFace(f3, v4)[1] }];
		}
	}, {
		key: 'testEdge',
		value: function testEdge(face0, edge) {
			var poly = _poly.get(this);
			var face1 = poly.faceOfEdge(edge, face0)[0];

			if (face1 === -1) return true;

			var _poly$pointOfFace3 = poly.pointOfFace(face0, edge);

			var _poly$pointOfFace4 = _slicedToArray(_poly$pointOfFace3, 3);

			var p0 = _poly$pointOfFace4[0];
			var p1 = _poly$pointOfFace4[1];
			var p2 = _poly$pointOfFace4[2];

			var p3 = poly.pointOfFace(face1, edge)[2];

			return !_Triangle2.default.intersectPointCircumcircle(p0, p1, p2, p3);
		}
	}, {
		key: 'turnEdge',
		value: function turnEdge(face0, edge) {
			var poly = _poly.get(this),
			    tree = _tree.get(this);
			var face1 = poly.faceOfEdge(edge, face0)[0];

			var _poly$vertexOfFace = poly.vertexOfFace(face0, edge);

			var _poly$vertexOfFace2 = _slicedToArray(_poly$vertexOfFace, 3);

			var v0 = _poly$vertexOfFace2[0];
			var v1 = _poly$vertexOfFace2[1];
			var v2 = _poly$vertexOfFace2[2];


			var e0 = poly.turnEdge(edge);

			var _poly$faceOfEdge3 = poly.faceOfEdge(e0);

			var _poly$faceOfEdge4 = _slicedToArray(_poly$faceOfEdge3, 2);

			var f0 = _poly$faceOfEdge4[0];
			var f1 = _poly$faceOfEdge4[1];


			_treeSubdivide.call(this, [face0, face1], [f0, f1]);

			return [{ face: f0, edge: poly.edgeOfFace(f0, v2)[1] }, { face: f1, edge: poly.edgeOfFace(f1, v2)[1] }];
		}
	}, {
		key: 'addPoints',
		value: function addPoints(points) {
			var poly = _poly.get(this);
			var E0 = 0.01,
			    E1 = 1.0 - E0;

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = points[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var p = _step2.value;

					var isect = this.intersectsPoint(p);

					if (isect === null) continue;

					var _isect$uv = _slicedToArray(isect.uv, 2);

					var u = _isect$uv[0];
					var v = _isect$uv[1];

					var edges = void 0;

					if (u > E0 && v > E0 && u + v < E1) edges = this.subdivideFace(isect.face, p);else if (u === 1.0 || v === 1.0 || u + v === 0.0) continue;else {
						var _poly$vertexOfFace3 = poly.vertexOfFace(isect.face);

						var _poly$vertexOfFace4 = _slicedToArray(_poly$vertexOfFace3, 3);

						var v0 = _poly$vertexOfFace4[0];
						var v1 = _poly$vertexOfFace4[1];
						var v2 = _poly$vertexOfFace4[2];

						var edge = void 0;

						if (u < E0) edge = poly.edgeOfFace(isect.face, v0)[0];else if (v < E0) edge = poly.edgeOfFace(isect.face, v2)[0];else edge = poly.edgeOfFace(isect.face, v1)[0];

						edges = this.splitEdge(edge, p);
					}

					for (var item = edges.pop(); item !== undefined; item = edges.pop()) {
						var _edges;

						var _item = item;
						var face = _item.face;
						var _edge = _item.edge;


						if (!this.testEdge(face, _edge)) (_edges = edges).push.apply(_edges, _toConsumableArray(this.turnEdge(face, _edge)));
					}
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
		}
	}, {
		key: 'poly',
		get: function get() {
			var poly = _poly.get(this);
			var res = _Polygon2.default.Copy(poly);

			res.removeVertex(0);
			res.removeVertex(1);
			res.removeVertex(2);

			return res;
		}
	}]);

	return TriangleSubdivisionTree;
}();

exports.default = TriangleSubdivisionTree;