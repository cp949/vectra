/**
 * 행렬 복사와 입력·출력 참조 처리를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { copyInto } from '../../../src/matrix/copy-into';
import type { MatrixWritable } from '../../../src/types';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix lifecycle - copyInto', () => {
  test('0과 음수 component를 기록한다', () => {
    const zero = makeMatrix();
    const negative = makeMatrix();
    copyInto(zero, { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    copyInto(negative, { a: -1, b: -2, c: -3, d: -4, tx: -5, ty: -6 });
    expect(zero).toEqual({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    expect(negative).toEqual({ a: -1, b: -2, c: -3, d: -4, tx: -5, ty: -6 });
  });

  test('소스 component를 기록하고 out을 반환한다', () => {
    const out = makeMatrix();
    const src = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
  });

  test('소스를 mutate하지 않는다', () => {
    const out = makeMatrix();
    const src = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    copyInto(out, src);
    expect(src).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
  });

  test('copyInto(out, out) self-aliasing에서 component를 유지한다', () => {
    const out: MatrixWritable = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    copyInto(out, out);
    expect(out).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
  });
});
