/**
 * linalg subspace.internal 단위 테스트.
 *
 * extractRrefPivotInfo: full rank, rank deficient, zero matrix, epsilon threshold.
 * buildRrefNullSpaceBasis: free column별 canonical basis vector,
 *   non-finite intermediate → RangeError, -0 cleanup.
 * computeRrefPivotInfo: deepCopy temp에 RREF 적용 후 pivot/free column 반환.
 */

import { describe, expect, test } from 'vitest';
import { deepCopyMatrix } from '../../../src/linalg/elimination.internal';
import {
  buildRrefNullSpaceBasis,
  computeRrefPivotInfo,
  extractRrefPivotInfo,
} from '../../../src/linalg/subspace.internal';

const DEFAULT_EPSILON = 1e-9;

// ---------------------------------------------------------------------------
// extractRrefPivotInfo
// ---------------------------------------------------------------------------

describe('extractRrefPivotInfo — RREF pivot/free column 추출', () => {
  test('full rank 2x2 identity에서 pivot 2개 / free 0개', () => {
    const rref = [
      [1, 0],
      [0, 1],
    ];
    const info = extractRrefPivotInfo(rref, 2, 2, DEFAULT_EPSILON);
    expect(info.pivotRows).toEqual([0, 1]);
    expect(info.pivotColumns).toEqual([0, 1]);
    expect(info.freeColumns).toEqual([]);
  });

  test('wide rank-deficient RREF에서 free column을 ascending으로 모은다', () => {
    // [[1, 2, 0, 3], [0, 0, 1, 4]] 형태의 RREF.
    const rref = [
      [1, 2, 0, 3],
      [0, 0, 1, 4],
    ];
    const info = extractRrefPivotInfo(rref, 2, 4, DEFAULT_EPSILON);
    expect(info.pivotRows).toEqual([0, 1]);
    expect(info.pivotColumns).toEqual([0, 2]);
    expect(info.freeColumns).toEqual([1, 3]);
  });

  test('zero matrix는 pivot 0개 / 모든 column이 free', () => {
    const rref = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const info = extractRrefPivotInfo(rref, 2, 3, DEFAULT_EPSILON);
    expect(info.pivotRows).toEqual([]);
    expect(info.pivotColumns).toEqual([]);
    expect(info.freeColumns).toEqual([0, 1, 2]);
  });

  test('epsilon 이하 entry는 pivot으로 보지 않는다', () => {
    const rref = [
      [5e-10, 1, 0],
      [0, 0, 1],
    ];
    const info = extractRrefPivotInfo(rref, 2, 3, 1e-9);
    expect(info.pivotColumns).toEqual([1, 2]);
    expect(info.freeColumns).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// buildRrefNullSpaceBasis
// ---------------------------------------------------------------------------

describe('buildRrefNullSpaceBasis — RREF canonical nullspace basis', () => {
  test('단일 row [1, 2, 3]에서 dimension 2 basis (free column 1, 2)', () => {
    const rref = [[1, 2, 3]];
    const info = extractRrefPivotInfo(rref, 1, 3, DEFAULT_EPSILON);
    expect(info.pivotColumns).toEqual([0]);
    expect(info.freeColumns).toEqual([1, 2]);
    const basis = buildRrefNullSpaceBasis(rref, 3, info, DEFAULT_EPSILON);
    // free column 1: [-2, 1, 0], free column 2: [-3, 0, 1].
    expect(basis).toEqual([
      [-2, 1, 0],
      [-3, 0, 1],
    ]);
  });

  test('full column rank이면 free column이 없어 빈 basis', () => {
    const rref = [
      [1, 0],
      [0, 1],
    ];
    const info = extractRrefPivotInfo(rref, 2, 2, DEFAULT_EPSILON);
    const basis = buildRrefNullSpaceBasis(rref, 2, info, DEFAULT_EPSILON);
    expect(basis).toEqual([]);
  });

  test('zero matrix는 column 수만큼 standard basis를 반환', () => {
    const rref = [[0, 0, 0]];
    const info = extractRrefPivotInfo(rref, 1, 3, DEFAULT_EPSILON);
    const basis = buildRrefNullSpaceBasis(rref, 3, info, DEFAULT_EPSILON);
    expect(basis).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('결과 entry의 -0은 +0으로 canonicalize한다', () => {
    const rref = [[1, -0, 2]];
    const info = extractRrefPivotInfo(rref, 1, 3, DEFAULT_EPSILON);
    const basis = buildRrefNullSpaceBasis(rref, 3, info, DEFAULT_EPSILON);
    // free column 1 vector entry 0 = -(-0) = 0. signed zero가 남으면 안 된다.
    expect(Object.is(basis[0][0], 0)).toBe(true);
    expect(Object.is(basis[0][0], -0)).toBe(false);
  });

  test('back-substitution intermediate에 NaN/Infinity가 섞이면 RangeError', () => {
    const rref = [[1, Number.NaN, 2]];
    const info = extractRrefPivotInfo(rref, 1, 3, DEFAULT_EPSILON);
    expect(() => buildRrefNullSpaceBasis(rref, 3, info, DEFAULT_EPSILON)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// computeRrefPivotInfo
// ---------------------------------------------------------------------------

describe('computeRrefPivotInfo — deepCopy temp에 RREF 적용 후 pivot 정보 반환', () => {
  test('full rank 2x3 wide matrix에서 free column 1개', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const temp = deepCopyMatrix(matrix, 2, 3);
    const info = computeRrefPivotInfo(temp, 2, 3, DEFAULT_EPSILON);
    expect(info.pivotColumns.length).toBe(2);
    expect(info.freeColumns.length).toBe(1);
  });

  test('zero matrix는 pivot 0 / free n', () => {
    const matrix = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const temp = deepCopyMatrix(matrix, 2, 3);
    const info = computeRrefPivotInfo(temp, 2, 3, DEFAULT_EPSILON);
    expect(info.pivotColumns).toEqual([]);
    expect(info.freeColumns).toEqual([0, 1, 2]);
  });
});
