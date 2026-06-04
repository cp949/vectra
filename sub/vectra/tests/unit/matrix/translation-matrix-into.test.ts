import { describe, expect, test } from 'vitest';
import { translationMatrixInto } from '../../../src/matrix/translation-matrix-into';
import type { MatrixWritable } from '../../../src/types';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix factory - translationMatrixInto', () => {
  test('object offset으로 translation matrix를 기록한다', () => {
    const out = makeMatrix();
    const result = translationMatrixInto(out, { x: 3, y: 7 });
    expect(result).toBe(out);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 7 });
  });

  test('tuple offset으로 translation matrix를 기록한다', () => {
    const out = makeMatrix();
    translationMatrixInto(out, [5, -2]);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 5, ty: -2 });
  });

  test('zero offset은 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    translationMatrixInto(out, { x: 0, y: 0 });
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 't' };
    const result = translationMatrixInto(out, { x: 1, y: 2 });
    expect(result).toBe(out);
    expect(result.tag).toBe('t');
  });
});
