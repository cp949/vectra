/**
 * applyMatrix / applyMatrixInto 단위 테스트.
 * 직사각 matrix-vector product, 빈 matrix/vector,
 * length mismatch, non-finite 입력, overflow,
 * out capacity 부족 + 원자성, out === vector aliasing을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { applyMatrix } from '../../../src/linalg/apply-matrix';
import { applyMatrixInto } from '../../../src/linalg/apply-matrix-into';

describe('applyMatrixInto — matrix-vector product (Into)', () => {
  test('rectangular matrix-vector product를 out에 기록한다', () => {
    const out: number[] = [9, 9];
    const result = applyMatrixInto(
      out,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      [10, 20, 30]
    );
    expect(result).toBe(out);
    expect(out).toEqual([140, 320]);
  });

  test('빈 matrix와 빈 vector는 out.length = 0만 설정한다', () => {
    const out: number[] = [9, 9];
    applyMatrixInto(out, [], []);
    expect(out).toEqual([]);
  });

  test('matrix.columns !== vector.length는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    expect(() => applyMatrixInto(out, [[1, 2, 3]], [1, 2])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('matrix non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[] = [9];
    expect(() => applyMatrixInto(out, [[Number.NaN]], [1])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('vector non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[] = [9];
    expect(() => applyMatrixInto(out, [[1]], [Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('누적 합 overflow(Infinity)는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[] = [9];
    expect(() => applyMatrixInto(out, [[Number.MAX_VALUE, Number.MAX_VALUE]], [1, 1])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('out capacity가 부족하면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[] = [9];
    expect(() =>
      applyMatrixInto(
        out,
        [
          [1, 2],
          [3, 4],
        ],
        [10, 20]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('out capacity가 더 크면 target length로 truncate한다', () => {
    const out: number[] = [9, 9, 9, 9];
    applyMatrixInto(out, [[1, 2, 3]], [10, 20, 30]);
    expect(out).toEqual([140]);
  });

  test('out === vector aliasing이 허용된다 (rows <= vector.length)', () => {
    const vector: number[] = [10, 20, 30];
    const result = applyMatrixInto(
      vector,
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      vector
    );
    expect(result).toBe(vector);
    // matrix=[[1,2,3],[4,5,6]] · vector=[10,20,30] = [140, 320]
    expect(vector).toEqual([140, 320]);
  });
});

describe('applyMatrix — matrix-vector product (companion)', () => {
  test('새 number[] 배열을 반환한다', () => {
    expect(
      applyMatrix(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [10, 20, 30]
      )
    ).toEqual([140, 320]);
  });

  test('빈 matrix와 빈 vector는 빈 배열을 반환한다', () => {
    expect(applyMatrix([], [])).toEqual([]);
  });

  test('length mismatch는 RangeError', () => {
    expect(() => applyMatrix([[1, 2, 3]], [1, 2])).toThrow(RangeError);
  });

  test('non-finite 입력은 RangeError', () => {
    expect(() => applyMatrix([[1]], [Number.NaN])).toThrow(RangeError);
  });

  test('누적 합 overflow는 RangeError', () => {
    expect(() => applyMatrix([[Number.MAX_VALUE, Number.MAX_VALUE]], [1, 1])).toThrow(RangeError);
  });
});
