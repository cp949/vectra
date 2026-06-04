/**
 * linalg Gauss-Jordan alias unit test.
 *
 * gaussJordan(Into) — reducedRowEchelonForm와 동일 결과, aliasing 허용.
 * 공통              — invalid epsilon, 빈 matrix.
 */

import { describe, expect, test } from 'vitest';
import { gaussJordan } from '../../../src/linalg/gauss-jordan';
import { gaussJordanInto } from '../../../src/linalg/gauss-jordan-into';
import { reducedRowEchelonForm } from '../../../src/linalg/reduced-row-echelon-form';
import { reducedRowEchelonFormInto } from '../../../src/linalg/reduced-row-echelon-form-into';

describe('gaussJordanInto — Gauss-Jordan alias (Into)', () => {
  test('reducedRowEchelonFormInto와 동일 결과를 반환한다', () => {
    const a: number[][] = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    const outA: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const outB: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    gaussJordanInto(outA, a);
    reducedRowEchelonFormInto(outB, a);
    expect(outA).toEqual(outB);
  });

  test('out === matrix aliasing이 허용된다', () => {
    const m: number[][] = [
      [2, 0],
      [0, 3],
    ];
    gaussJordanInto(m, m);
    expect(m).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('invalid epsilon은 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expect(() =>
      gaussJordanInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        { epsilon: -1 }
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });
});

describe('gaussJordan — Gauss-Jordan alias (companion)', () => {
  test('reducedRowEchelonForm과 동일 결과를 반환한다', () => {
    const m: number[][] = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    expect(gaussJordan(m)).toEqual(reducedRowEchelonForm(m));
  });

  test('빈 matrix는 빈 배열', () => {
    expect(gaussJordan([])).toEqual([]);
  });
});
