import { describe, expect, test } from 'vitest';
import { haltonSequence } from '../../../src/random/halton-sequence';
import { haltonSequenceInto } from '../../../src/random/halton-sequence-into';
import { commitSequence2DInto } from '../../../src/random/low-discrepancy.internal';
import { sobolSequence } from '../../../src/random/sobol-sequence';
import { sobolSequenceInto } from '../../../src/random/sobol-sequence-into';

// 두 point 행렬을 entry별 근사 비교한다. radical inverse / Gray-code 결과의 float 표현 차이를 흡수한다.
const expectMatrixCloseTo = (actual: number[][], expected: number[][], precision = 12): void => {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    const actualRow = actual[i] as number[];
    const expectedRow = expected[i] as number[];
    expect(actualRow).toHaveLength(expectedRow.length);
    for (let j = 0; j < expectedRow.length; j++) {
      expect(actualRow[j]).toBeCloseTo(expectedRow[j] as number, precision);
    }
  }
};

describe('haltonSequenceInto — Halton low-discrepancy sequence', () => {
  test('count = 0이면 빈 sequence를 기록한다', () => {
    const out: number[][] = [[9, 9]];
    const result = haltonSequenceInto(out, 0, 2);
    expect(result).toBe(out);
    expect(result).toEqual([]);
  });

  test('count = 4, dimension = 2, 기본 bases에서 고정 좌표를 기록한다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 4, 2);
    expectMatrixCloseTo(out, [
      [0, 0],
      [0.5, 1 / 3],
      [0.25, 2 / 3],
      [0.75, 1 / 9],
    ]);
  });

  test('startIndex = 1이면 index 1부터 시작한다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 3, 2, { startIndex: 1 });
    expectMatrixCloseTo(out, [
      [0.5, 1 / 3],
      [0.25, 2 / 3],
      [0.75, 1 / 9],
    ]);
  });

  test('custom bases [2, 5]가 적용된다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 3, 2, { bases: [2, 5] });
    expectMatrixCloseTo(out, [
      [0, 0],
      [0.5, 1 / 5],
      [0.25, 2 / 5],
    ]);
  });

  test('dimension보다 긴 bases는 앞에서부터 dimension개만 사용한다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 2, 1, { bases: [3, 7] });
    expectMatrixCloseTo(out, [[0], [1 / 3]]);
  });

  test('각 entry는 [0, 1) 범위 finite number다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 16, 3);
    for (const row of out) {
      expect(row).toHaveLength(3);
      for (const value of row) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    }
  });

  test('invalid count는 RangeError', () => {
    expect(() => haltonSequenceInto([], -1, 2)).toThrow(RangeError);
    expect(() => haltonSequenceInto([], 1.5, 2)).toThrow(RangeError);
    expect(() => haltonSequenceInto([], 0x1_0000_0000, 2)).toThrow(RangeError);
    expect(() => haltonSequenceInto([], Number.NaN, 2)).toThrow(RangeError);
  });

  test('invalid dimension은 RangeError', () => {
    expect(() => haltonSequenceInto([], 4, 0)).toThrow(RangeError);
    expect(() => haltonSequenceInto([], 4, -1)).toThrow(RangeError);
    expect(() => haltonSequenceInto([], 4, 1.5)).toThrow(RangeError);
  });

  test('invalid startIndex는 RangeError', () => {
    expect(() => haltonSequenceInto([], 4, 2, { startIndex: -1 })).toThrow(RangeError);
    expect(() => haltonSequenceInto([], 4, 2, { startIndex: 1.5 })).toThrow(RangeError);
    expect(() => haltonSequenceInto([], 4, 2, { startIndex: 0x1_0000_0000 })).toThrow(RangeError);
  });

  test('startIndex + count - 1이 uint32 상한을 넘으면 RangeError', () => {
    expect(() => haltonSequenceInto([], 2, 1, { startIndex: 0xffffffff })).toThrow(RangeError);
  });

  test('startIndex + count - 1이 정확히 0xffffffff면 성공한다', () => {
    const out: number[][] = [];
    expect(() => haltonSequenceInto(out, 2, 1, { startIndex: 0xfffffffe })).not.toThrow();
    expect(out).toHaveLength(2);
  });

  test('invalid bases는 RangeError', () => {
    // length < dimension
    expect(() => haltonSequenceInto([], 4, 2, { bases: [2] })).toThrow(RangeError);
    // base < 2
    expect(() => haltonSequenceInto([], 4, 2, { bases: [2, 1] })).toThrow(RangeError);
    // non-integer base
    expect(() => haltonSequenceInto([], 4, 2, { bases: [2, 3.5] })).toThrow(RangeError);
    // duplicate base
    expect(() => haltonSequenceInto([], 4, 2, { bases: [2, 2] })).toThrow(RangeError);
  });

  test('invalid input에서 pre-populated out은 변경되지 않는다', () => {
    const out: number[][] = [[1, 2]];
    expect(() => haltonSequenceInto(out, 4, 0)).toThrow(RangeError);
    expect(out).toEqual([[1, 2]]);
    // commit 직전 마지막 validation인 resolveBases throw에서도 out이 보존되는지 확인한다.
    expect(() => haltonSequenceInto(out, 4, 2, { bases: [2, 2] })).toThrow(RangeError);
    expect(out).toEqual([[1, 2]]);
    expect(() => haltonSequenceInto(out, 4, 2, { bases: [2] })).toThrow(RangeError);
    expect(out).toEqual([[1, 2]]);
  });

  // radicalInverse는 +0에서 비음수 항만 누적하므로 -0을 만들지 않는다. 공개 sequence가 -0을 노출하지
  // 않음을 고정한다. commit helper의 canonicalize 분기 자체는 아래 별도 describe에서 직접 검증한다.
  test('공개 sequence는 -0을 노출하지 않는다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 1, 1);
    expect(Object.is(out[0]?.[0], -0)).toBe(false);
    expect(out[0]?.[0]).toBe(0);
  });
});

describe('haltonSequence — allocating companion', () => {
  test('새 number[][]를 반환한다', () => {
    const result = haltonSequence(4, 2);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
  });

  test('haltonSequenceInto와 같은 좌표를 반환한다', () => {
    const out: number[][] = [];
    haltonSequenceInto(out, 5, 3, { startIndex: 2 });
    expect(haltonSequence(5, 3, { startIndex: 2 })).toEqual(out);
  });

  test('invalid input은 RangeError를 전파한다', () => {
    expect(() => haltonSequence(4, 0)).toThrow(RangeError);
    expect(() => haltonSequence(-1, 2)).toThrow(RangeError);
    expect(() => haltonSequence(4, 2, { bases: [2, 2] })).toThrow(RangeError);
  });
});

describe('sobolSequenceInto — Sobol low-discrepancy sequence', () => {
  test('count = 0이면 빈 sequence를 기록한다', () => {
    const out: number[][] = [[9]];
    const result = sobolSequenceInto(out, 0, 1);
    expect(result).toBe(out);
    expect(result).toEqual([]);
  });

  // Sobol 좌표는 acc / 2^32로 분모가 2의 거듭제곱이라 float64에 정확히 표현된다. direction table은 public
  // observable sequence이므로 toEqual로 비트 단위 고정해 1비트 회귀까지 잡는다.
  test('dimension = 1의 첫 4개 row를 고정한다', () => {
    const out: number[][] = [];
    sobolSequenceInto(out, 4, 1);
    expect(out).toEqual([[0], [0.5], [0.75], [0.25]]);
  });

  test('dimension = 2의 첫 4개 row를 고정한다', () => {
    const out: number[][] = [];
    sobolSequenceInto(out, 4, 2);
    expect(out).toEqual([
      [0, 0],
      [0.5, 0.5],
      [0.75, 0.25],
      [0.25, 0.75],
    ]);
  });

  test('startIndex = 1이면 index 1부터 시작한다', () => {
    const out: number[][] = [];
    sobolSequenceInto(out, 3, 1, { startIndex: 1 });
    expect(out).toEqual([[0.5], [0.75], [0.25]]);
  });

  test('각 entry는 [0, 1) 범위 finite number다', () => {
    const out: number[][] = [];
    sobolSequenceInto(out, 32, 2);
    for (const row of out) {
      expect(row).toHaveLength(2);
      for (const value of row) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    }
  });

  test('지원 상한보다 큰 dimension은 RangeError', () => {
    expect(() => sobolSequenceInto([], 4, 3)).toThrow(RangeError);
  });

  test('invalid count는 RangeError', () => {
    expect(() => sobolSequenceInto([], -1, 1)).toThrow(RangeError);
    expect(() => sobolSequenceInto([], 1.5, 1)).toThrow(RangeError);
    expect(() => sobolSequenceInto([], 0x1_0000_0000, 1)).toThrow(RangeError);
  });

  test('invalid dimension은 RangeError', () => {
    expect(() => sobolSequenceInto([], 4, 0)).toThrow(RangeError);
    expect(() => sobolSequenceInto([], 4, -1)).toThrow(RangeError);
    expect(() => sobolSequenceInto([], 4, 1.5)).toThrow(RangeError);
  });

  test('invalid startIndex는 RangeError', () => {
    expect(() => sobolSequenceInto([], 4, 1, { startIndex: -1 })).toThrow(RangeError);
    expect(() => sobolSequenceInto([], 4, 1, { startIndex: 1.5 })).toThrow(RangeError);
    expect(() => sobolSequenceInto([], 4, 1, { startIndex: 0x1_0000_0000 })).toThrow(RangeError);
  });

  test('startIndex + count - 1이 uint32 상한을 넘으면 RangeError', () => {
    expect(() => sobolSequenceInto([], 2, 1, { startIndex: 0xffffffff })).toThrow(RangeError);
  });

  test('startIndex + count - 1이 정확히 0xffffffff면 성공한다', () => {
    const out: number[][] = [];
    expect(() => sobolSequenceInto(out, 2, 1, { startIndex: 0xfffffffe })).not.toThrow();
    expect(out).toHaveLength(2);
  });

  test('invalid input에서 pre-populated out은 변경되지 않는다', () => {
    const out: number[][] = [[0.1]];
    expect(() => sobolSequenceInto(out, 4, 3)).toThrow(RangeError);
    expect(out).toEqual([[0.1]]);
    expect(() => sobolSequenceInto(out, -1, 1)).toThrow(RangeError);
    expect(out).toEqual([[0.1]]);
  });
});

describe('sobolSequence — allocating companion', () => {
  test('새 number[][]를 반환한다', () => {
    const result = sobolSequence(4, 2);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
  });

  test('sobolSequenceInto와 같은 좌표를 반환한다', () => {
    const out: number[][] = [];
    sobolSequenceInto(out, 6, 2, { startIndex: 3 });
    expect(sobolSequence(6, 2, { startIndex: 3 })).toEqual(out);
  });

  test('invalid input은 RangeError를 전파한다', () => {
    expect(() => sobolSequence(4, 0)).toThrow(RangeError);
    expect(() => sobolSequence(4, 3)).toThrow(RangeError);
    expect(() => sobolSequence(-1, 1)).toThrow(RangeError);
  });
});

describe('commitSequence2DInto — 공유 commit helper', () => {
  test('-0 entry를 0으로 canonicalize한다', () => {
    const out: number[][] = [];
    commitSequence2DInto(out, [
      [-0, 0.5],
      [0.25, -0],
    ]);
    expect(Object.is(out[0]?.[0], -0)).toBe(false);
    expect(out[0]?.[0]).toBe(0);
    expect(Object.is(out[1]?.[1], -0)).toBe(false);
    expect(out[1]?.[1]).toBe(0);
    // -0이 아닌 entry는 그대로 둔다.
    expect(out[0]?.[1]).toBe(0.5);
    expect(out[1]?.[0]).toBe(0.25);
  });

  test('기존 out 내용을 비우고 row를 push하며 같은 참조를 반환한다', () => {
    const out: number[][] = [[9, 9, 9]];
    const result = commitSequence2DInto(out, [[1], [2]]);
    expect(result).toBe(out);
    expect(out).toEqual([[1], [2]]);
  });
});
