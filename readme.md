#twodee

Two dimensional geometry manipulation

##Install

```sh
$ npm install twodee
```

##Use

###Creating a simple Triangle

twodee uses xyzw for vector manipulation.

```sh
$ npm install xyzw
```

```js
import Vector2 from 'xyzw/source/Vector2';
import Triangle2 from 'twodee/source/Triangle2';
```

To get es5 safe versions of all files replace /source with /es5

```js
const triangleA = new Triangle2(
	new Vector2([0.0, 0.0]),
	new Vector2([0.0, 1.0]),
	new Vector2([1.0, 0.0])
);

const point0 = triangleA.p0;
const point1 = triangleA.p1;
const point2 = triangleA.p2;
const orientation = triangleA.orientation;
const centroid = triangleA.centroid;
const circumcenter = triangleA.circumcenter
const area = triangleA.area;
```

####Factory constructors

All primitives come with convenient factory constructors:

```js
const center = new Vector2([0.0, 0.0]);
const radius = 1.0;
const rotation = Math.PI;

const triangleB = Triangle2.Equilateral(center, radius, rotation);
```

####Collision testing

Triangles can test for collisions with points, segments and other triangles:

```js
const intersections = [];
const collision = triangleA.intersects(triangleB, intersections);
```

All intersection tests have static versions that do not require actual objects:

```js
const intersections = [];
const collision = Triangle2.intersect(
	triangleA.p0, triangleA.p1, triangleA.p2,
	triangleB.p0, triangleB.p1, triangleB.p2,
	intersections
)
```



###Creating a Bounding Box
```js
import Vector2 from 'xyzw/source/Vector2';
import Rectangle2 from 'twodee/source/Rectangle2';


const box = Rectangle2.AABB([
	new Vector2([0.0, 0.0]),
	new Vector2([0.0, 1.0]),
	new Vector2([1.0, 0.0])
]);

const center = box.center;
const width = box.width;
const height = box.height;
const aspect = box.aspect;
const area = box.area;
```

Rectangles can test for collisions with points, segments and other rectangles 



###Creating a Poly Line
```js
import PolyLine2 from 'twodee/source/PolyLine2';


const lineA = PolyLine2.Rectangle2(box);

const points = lineA.point;
const segments = lineA.segments;
const closed = lineA.closed;
```

Poly lines can test for collisions with other poly lines

```js
const lineB = PolyLine2.ConvexHullGraham([
	new Vector2([0.0, 0.0]),
	new Vector2([0.0, 1.0]),
	new Vector2([1.0, 0.0]),
	new Vector2([1.0, 1.0])
]);

const intersections = [];
const collision = lineB.intersects(lineA, intersections);
```



###Creating a Polygon

```js
import Polygon2 from 'twodee/source/Polygon2';

const poly = new Polygon2();

const v0 = poly.createVertex(new Vector2([0.0, 0.0]));
const v1 = poly.createVertex(new Vector2([0.0, 1.0]));
const v2 = poly.createVertex(new Vector2([1.0, 0.0]));
const v3 = poly.createVertex(new Vector2([1.0, 1.0]));

const f0 = poly.createFace(v0, v1, v2);
const f1 = poly.createFace(v1, v3, v2);

const vertices = poly.vertex;
const edges = poly.edge;
const faces = poly.face;
```

###Manipulating a Polygon

Polygons expose a rich api for geometry manipulations:

```js
const [e0] = poly.edgeOfVertex(v1, [v2]);
const e1 = poly.turnEdge(e0);

const [f2, f3] = poly.faceOfEdge(e1);
const [f4, f5, f6] = poly.subdivideFace(f3);
```
