import { describe, expect, test } from 'vitest';
import { appendRotateInto } from '../../../src/matrix/append-rotate-into';
import { copy } from '../../../src/matrix/copy';
import { identity } from '../../../src/matrix/identity';
import { invert } from '../../../src/matrix/invert';
import { matrixCompose } from '../../../src/matrix/matrix-compose';
import { multiply } from '../../../src/matrix/multiply';
import { preMultiply } from '../../../src/matrix/pre-multiply';
import { rotate } from '../../../src/matrix/rotate';
import { rotationMatrix } from '../../../src/matrix/rotation-matrix';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { scale } from '../../../src/matrix/scale';
import { scaling } from '../../../src/matrix/scaling';
import { transformBounds } from '../../../src/matrix/transform-bounds';
import { transformPoint } from '../../../src/matrix/transform-point';
import { transformRect } from '../../../src/matrix/transform-rect';
import { transformVector } from '../../../src/matrix/transform-vector';
import { translate } from '../../../src/matrix/translate';
import { translation } from '../../../src/matrix/translation';
import type { MatrixLike } from '../../../src/types';

describe('matrix lifecycle/factory companions', () => {
  test('copy(source)는 source와 다른 새 plain matrix를 반환한다', () => {
    const source: MatrixLike = { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 };
    const result = copy(source);
    expect(result).toEqual({ a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 });
    expect(result).not.toBe(source);
  });

  test('copy(a, b, c, d, tx, ty)는 6개 component를 기록한다', () => {
    expect(copy(2, 3, 4, 5, 6, 7)).toEqual({ a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 });
  });

  test('identity()는 identity matrix를 반환한다', () => {
    expect(identity()).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('translation(offset)은 translation-only matrix를 반환한다', () => {
    expect(translation({ x: 3, y: 4 })).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 4 });
  });

  test('scaling(sx, sy)는 scaling-only matrix를 반환한다', () => {
    expect(scaling(2, 3)).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
  });

  test('rotationMatrix(angle)은 rotation-only matrix를 반환한다', () => {
    const result = rotationMatrix(Math.PI / 2);
    expect(result.a).toBeCloseTo(0, 12);
    expect(result.b).toBeCloseTo(1, 12);
    expect(result.c).toBeCloseTo(-1, 12);
    expect(result.d).toBeCloseTo(0, 12);
    expect(result.tx).toBe(0);
    expect(result.ty).toBe(0);
  });

  test('rotationMatrix(angle)은 rotationMatrixInto 결과와 일치한다', () => {
    const angle = 0.7;
    const expected = rotationMatrixInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, angle);
    expect(rotationMatrix(angle)).toEqual(expected);
  });
});

describe('matrix operation companions', () => {
  test('translate(identity, offset)은 matrix * T(offset)을 반환한다', () => {
    const identityMatrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(translate(identityMatrix, { x: 3, y: 4 })).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 4 });
  });

  test('translate는 input matrix와 다른 새 object를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(translate(matrix, { x: 1, y: 2 })).not.toBe(matrix);
  });

  test('translate는 non-identity base에서 matrix * T 곱 방향을 적용한다', () => {
    // tx = a*ox + c*oy + tx, ty = b*ox + d*oy + ty. naive tx+=ox이면 깨진다.
    const matrix: MatrixLike = { a: 2, b: 0, c: 1, d: 3, tx: 1, ty: 1 };
    expect(translate(matrix, { x: 5, y: 7 })).toEqual({ a: 2, b: 0, c: 1, d: 3, tx: 18, ty: 22 });
  });

  test('scale(matrix, sx, sy)는 matrix * S(sx, sy)를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 6 };
    expect(scale(matrix, 2, 3)).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 5, ty: 6 });
  });

  test('scale은 input matrix와 다른 새 object를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 6 };
    expect(scale(matrix, 2, 3)).not.toBe(matrix);
  });

  test('scale은 off-diagonal에서 matrix * S 곱 방향을 적용한다', () => {
    // a/b는 sx로, c/d는 sy로 스케일된다. S*matrix면 b/c가 뒤바뀐다.
    const matrix: MatrixLike = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    expect(scale(matrix, 2, 3)).toEqual({ a: 2, b: 4, c: 9, d: 12, tx: 5, ty: 6 });
  });

  test('rotate(matrix, angle)은 appendRotateInto과 같은 결과를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const expected = appendRotateInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, matrix, Math.PI / 2);
    expect(rotate(matrix, Math.PI / 2)).toEqual(expected);
  });

  test('rotate은 non-identity base에서 matrix * R 방향을 적용한다(translation 불변)', () => {
    // matrix * R은 tx/ty를 회전시키지 않는다. R*matrix면 tx/ty가 회전한다.
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 0 };
    const result = rotate(matrix, Math.PI / 2);
    expect(result.a).toBeCloseTo(0, 10);
    expect(result.b).toBeCloseTo(1, 10);
    expect(result.c).toBeCloseTo(-1, 10);
    expect(result.d).toBeCloseTo(0, 10);
    expect(result.tx).toBe(10);
    expect(result.ty).toBe(0);
  });

  test('rotate는 input matrix와 다른 새 object를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(rotate(matrix, Math.PI / 2)).not.toBe(matrix);
  });

  test('preMultiply(matrix, left)는 left * matrix를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 4 };
    const left: MatrixLike = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    expect(preMultiply(matrix, left)).toEqual({ a: 2, b: 0, c: 0, d: 2, tx: 6, ty: 8 });
  });

  test('preMultiply는 input matrix와 다른 새 object를 반환한다', () => {
    const matrix: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 4 };
    const left: MatrixLike = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    expect(preMultiply(matrix, left)).not.toBe(matrix);
  });
});

describe('matrix allocating companions', () => {
  test('multiply는 left * right plain matrix를 반환한다', () => {
    const result = multiply({ a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 4 }, { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expect(result).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 3, ty: 4 });
  });

  test('invert는 invertible matrix에서 plain matrix를 반환한다', () => {
    const result = invert({ a: 2, b: 0, c: 0, d: 4, tx: 6, ty: 8 });
    expect(result).toEqual({ a: 0.5, b: -0, c: -0, d: 0.25, tx: -3, ty: -2 });
  });

  test('invert는 singular matrix에서 undefined를 반환한다', () => {
    expect(invert({ a: 1, b: 2, c: 2, d: 4, tx: 0, ty: 0 })).toBeUndefined();
  });

  test('transformPoint는 translation을 포함한 plain point를 반환한다', () => {
    const matrix: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 20 };
    expect(transformPoint(matrix, { x: 1, y: 2 })).toEqual({ x: 12, y: 26 });
  });

  test('transformVector는 translation을 제외한 plain vector를 반환한다', () => {
    const matrix: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 20 };
    expect(transformVector(matrix, { x: 1, y: 2 })).toEqual({ x: 2, y: 6 });
  });

  test('transformRect는 transformed corner AABB plain rect를 반환한다', () => {
    const matrix: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: 2 };
    expect(transformRect(matrix, { x: 1, y: 2, width: 3, height: 4 })).toEqual({
      x: 3,
      y: 8,
      width: 6,
      height: 12,
    });
  });

  test('transformBounds는 transformed corner AABB plain bounds를 반환한다', () => {
    const matrix: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: 2 };
    expect(transformBounds(matrix, { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } })).toEqual({
      min: { x: 3, y: 8 },
      max: { x: 9, y: 20 },
    });
  });

  test('matrixCompose는 합성한 plain matrix를 반환하고 input nested object를 반환하지 않는다', () => {
    const decomposition = {
      translation: { x: 4, y: 5 },
      scaling: { x: 2, y: 3 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    };
    const result = matrixCompose(decomposition);
    expect(result).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 4, ty: 5 });
    expect(result).not.toBe(decomposition.translation);
    expect(result).not.toBe(decomposition.scaling);
    expect(result).not.toBe(decomposition.skewing);
  });
});
