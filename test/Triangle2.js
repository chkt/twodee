import assert from 'assert';

import { describe, it } from 'mocha';

import Vector2 from 'xyzw/es5/Vector2';

import Triangle2 from '../source/Triangle2';



function _createRightTriangle(len = 1.0) {
	const p0 = new Vector2([0.0, 0.0]);
	const p1 = new Vector2([0.0, len]);
	const p2 = new Vector2([len, 0.0]);

	return new Triangle2(p0, p1, p2);
}

function _createEquilateralTriangle(r = 1.0) {
	return Triangle2.Equilateral(new Vector2([0.0, 0.0]), 1.0);
}


function _areaOfEquilateralTriangle(p0, p1) {
	return Math.sqrt(3) / 4 * Math.pow(Vector2.Subtract(p1, p0).norm, 2);
}



describe('Triangle2', () => {
	describe('#area', () => {
		it("should return the correct area", () => {
			let tri = _createRightTriangle();

			assert.strictEqual(tri.area, 0.5);

			tri = _createRightTriangle(10.0);

			assert.strictEqual(tri.area, 50.0);

			tri = _createEquilateralTriangle();

			assert(Math.abs(tri.area - _areaOfEquilateralTriangle(tri.p1, tri.p0)) < 1.0e-10);

			tri = _createEquilateralTriangle(10.0);

			assert(Math.abs(tri.area - _areaOfEquilateralTriangle(tri.p1, tri.p0)) < 1.0e-10);

			tri = _createEquilateralTriangle(33.0);

			assert(Math.abs(tri.area - _areaOfEquilateralTriangle(tri.p1, tri.p0)) < 1.0e-10);
		});
	});
});
