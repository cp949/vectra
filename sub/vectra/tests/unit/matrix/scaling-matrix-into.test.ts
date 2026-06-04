import { describe, expect, test } from 'vitest';
import { scalingMatrixInto } from '../../../src/matrix/scaling-matrix-into';
import type { MatrixWritable } from '../../../src/types';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix factory - scalingMatrixInto', () => {
  test('sx, sy로 scaling matrix를 기록한다', () => {
    const out = makeMatrix();
    const result = scalingMatrixInto(out, 2, 3);
    expect(result).toBe(out);
    expect(out).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
  });

  test('uniform scale sx === sy를 기록한다', () => {
    const out = makeMatrix();
    scalingMatrixInto(out, 5, 5);
    expect(out).toEqual({ a: 5, b: 0, c: 0, d: 5, tx: 0, ty: 0 });
  });

  test('scale 1, 1은 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    scalingMatrixInto(out, 1, 1);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('sx = 0, sy = 0 (singular) matrix를 기록한다', () => {
    const out = makeMatrix();
    scalingMatrixInto(out, 0, 0);
    expect(out).toEqual({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
  });

  test('음수 scale을 기록한다', () => {
    const out = makeMatrix();
    scalingMatrixInto(out, -1, 2);
    expect(out).toEqual({ a: -1, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 's' };
    const result = scalingMatrixInto(out, 2, 3);
    expect(result).toBe(out);
    expect(result.tag).toBe('s');
  });
});
