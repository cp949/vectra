import { describe, expect, test } from 'vitest';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import type { MatrixWritable } from '../../../src/types';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix factory - rotationMatrixInto', () => {
  test('angle = 0이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const result = rotationMatrixInto(out, 0);
    expect(result).toBe(out);
    expect(out.a).toBeCloseTo(1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(1, 12);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('angle = π/2이면 90도 회전 matrix를 기록한다', () => {
    const out = makeMatrix();
    rotationMatrixInto(out, Math.PI / 2);
    // a = cos(π/2) ≈ 0, b = sin(π/2) = 1, c = -sin(π/2) = -1, d = cos(π/2) ≈ 0
    expect(out.a).toBeCloseTo(0, 12);
    expect(out.b).toBeCloseTo(1, 12);
    expect(out.c).toBeCloseTo(-1, 12);
    expect(out.d).toBeCloseTo(0, 12);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('angle = π이면 180도 회전 matrix를 기록한다', () => {
    const out = makeMatrix();
    rotationMatrixInto(out, Math.PI);
    // a = cos(π) = -1, b = sin(π) ≈ 0, c = -sin(π) ≈ 0, d = cos(π) = -1
    expect(out.a).toBeCloseTo(-1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(-1, 12);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('angle = 2π이면 identity matrix에 가까운 값을 기록한다', () => {
    const out = makeMatrix();
    rotationMatrixInto(out, 2 * Math.PI);
    expect(out.a).toBeCloseTo(1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(1, 12);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'r' };
    const result = rotationMatrixInto(out, 0);
    expect(result).toBe(out);
    expect(result.tag).toBe('r');
  });
});
