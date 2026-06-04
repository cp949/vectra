/**
 * statistics histogramBinEdges / histogram / histogramInto — S9-RM-011 unit tests.
 */

import { describe, expect, test } from 'vitest';
import { histogram } from '../../../src/statistics/histogram';
import { histogramBinEdges } from '../../../src/statistics/histogram-bin-edges';
import { histogramInto } from '../../../src/statistics/histogram-into';

// ---------------------------------------------------------------------------
// histogramBinEdges
// ---------------------------------------------------------------------------

describe('histogramBinEdges — uniform bin', () => {
  test('default bins = 10', () => {
    const edges = histogramBinEdges([0, 10]);
    expect(edges).toHaveLength(11);
    expect(edges[0]).toBe(0);
    expect(edges[10]).toBe(10);
    expect(edges[5]).toBe(5);
  });

  test('explicit bins count', () => {
    const edges = histogramBinEdges([0, 10], { bins: 5 });
    expect(edges).toEqual([0, 2, 4, 6, 8, 10]);
  });

  test('values 안 finite min/max를 사용한다', () => {
    const edges = histogramBinEdges([3, 1, 5, 2, 4], { bins: 4 });
    expect(edges[0]).toBe(1);
    expect(edges[4]).toBe(5);
    expect(edges).toEqual([1, 2, 3, 4, 5]);
  });

  test('explicit range가 values와 다르더라도 range를 우선한다', () => {
    const edges = histogramBinEdges([2, 3, 4], { bins: 4, range: [0, 8] });
    expect(edges).toEqual([0, 2, 4, 6, 8]);
  });
});

describe('histogramBinEdges — explicit edges', () => {
  test('explicit edge 배열을 fresh copy로 반환한다', () => {
    const input = [0, 1, 3, 7];
    const edges = histogramBinEdges([0.5, 2, 5], { bins: input });
    expect(edges).toEqual([0, 1, 3, 7]);
    expect(edges).not.toBe(input);
  });

  test('explicit edge와 range를 함께 지정하면 range는 silent ignore', () => {
    const edges = histogramBinEdges([0.5, 2, 5], { bins: [0, 1, 3, 7], range: [-100, 100] });
    expect(edges).toEqual([0, 1, 3, 7]);
  });

  test('strictly increasing 위반은 RangeError', () => {
    expect(() => histogramBinEdges([0], { bins: [0, 1, 1, 2] })).toThrow(RangeError);
    expect(() => histogramBinEdges([0], { bins: [0, 2, 1, 3] })).toThrow(RangeError);
  });

  test('length < 2는 RangeError', () => {
    expect(() => histogramBinEdges([0], { bins: [0] })).toThrow(RangeError);
    expect(() => histogramBinEdges([0], { bins: [] })).toThrow(RangeError);
  });

  test('entry non-finite는 RangeError', () => {
    expect(() => histogramBinEdges([0], { bins: [0, Number.NaN, 2] })).toThrow(RangeError);
    expect(() => histogramBinEdges([0], { bins: [0, Number.POSITIVE_INFINITY] })).toThrow(RangeError);
  });
});

describe('histogramBinEdges — degenerate range', () => {
  test('max === min은 [v - 0.5, v + 0.5]로 deterministic 확장', () => {
    const edges = histogramBinEdges([5, 5, 5], { bins: 2 });
    expect(edges).toEqual([4.5, 5, 5.5]);
  });

  test('single entry도 max === min과 동일', () => {
    const edges = histogramBinEdges([3], { bins: 1 });
    expect(edges).toEqual([2.5, 3.5]);
  });
});

describe('histogramBinEdges — empty input', () => {
  test('bins: number + 빈 입력 + range 미지정은 RangeError', () => {
    expect(() => histogramBinEdges([])).toThrow(RangeError);
    expect(() => histogramBinEdges([], { bins: 4 })).toThrow(RangeError);
  });

  test('bins: number + 빈 입력 + range 지정은 정상', () => {
    expect(histogramBinEdges([], { bins: 2, range: [0, 4] })).toEqual([0, 2, 4]);
  });

  test('explicit bins 배열 + 빈 입력은 정상', () => {
    expect(histogramBinEdges([], { bins: [0, 1, 2] })).toEqual([0, 1, 2]);
  });
});

describe('histogramBinEdges — option validation', () => {
  test('bins가 0/음수/non-integer/Infinity/NaN은 RangeError', () => {
    expect(() => histogramBinEdges([0, 1], { bins: 0 })).toThrow(RangeError);
    expect(() => histogramBinEdges([0, 1], { bins: -3 })).toThrow(RangeError);
    expect(() => histogramBinEdges([0, 1], { bins: 1.5 })).toThrow(RangeError);
    expect(() => histogramBinEdges([0, 1], { bins: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => histogramBinEdges([0, 1], { bins: Number.NaN })).toThrow(RangeError);
  });

  test('range가 length != 2이거나 min >= max는 RangeError', () => {
    expect(() => histogramBinEdges([0], { bins: 2, range: [0] as unknown as readonly [number, number] })).toThrow(
      RangeError
    );
    expect(() => histogramBinEdges([0], { bins: 2, range: [5, 5] })).toThrow(RangeError);
    expect(() => histogramBinEdges([0], { bins: 2, range: [5, 1] })).toThrow(RangeError);
  });

  test('range entry non-finite는 RangeError', () => {
    expect(() => histogramBinEdges([0], { bins: 2, range: [0, Number.POSITIVE_INFINITY] })).toThrow(RangeError);
    expect(() => histogramBinEdges([0], { bins: 2, range: [Number.NaN, 1] })).toThrow(RangeError);
  });

  test('values가 array가 아니면 TypeError', () => {
    expect(() => histogramBinEdges(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => histogramBinEdges('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('bins가 number도 array도 아니면 TypeError (타입 위반은 TypeError)', () => {
    expect(() => histogramBinEdges([0, 1], { bins: '5' as unknown as number })).toThrow(TypeError);
    expect(() => histogramBinEdges([0, 1], { bins: true as unknown as number })).toThrow(TypeError);
  });

  test('values entry non-finite는 RangeError(min/max scan)', () => {
    expect(() => histogramBinEdges([1, Number.NaN, 3], { bins: 3 })).toThrow(RangeError);
    expect(() => histogramBinEdges([Number.POSITIVE_INFINITY, 1], { bins: 3 })).toThrow(RangeError);
  });
});

describe('histogramBinEdges — signed zero', () => {
  test('explicit edges의 -0은 0으로 canonicalize', () => {
    const edges = histogramBinEdges([0], { bins: [-0, 1, 2] });
    expect(Object.is(edges[0], 0)).toBe(true);
    expect(Object.is(edges[0], -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// histogram & histogramInto
// ---------------------------------------------------------------------------

describe('histogram — count', () => {
  test('uniform bin counts', () => {
    const result = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], { bins: 5, range: [0, 10] });
    expect(result.binEdges).toEqual([0, 2, 4, 6, 8, 10]);
    // bin [0,2): 0,1 → 2 / [2,4): 2,3 → 2 / [4,6): 4,5 → 2 / [6,8): 6,7 → 2 / [8,10]: 8,9 → 2
    expect(result.counts).toEqual([2, 2, 2, 2, 2]);
  });

  test('half-open + last-bin inclusive', () => {
    const result = histogram([0, 1, 1.999, 2, 4], { bins: [0, 2, 4] });
    // [0,2): 0,1,1.999 → 3 / [2,4]: 2,4 → 2
    expect(result.counts).toEqual([3, 2]);
  });

  test('out-of-range value는 RangeError', () => {
    expect(() => histogram([-1, 0, 1], { bins: 2, range: [0, 1] })).toThrow(RangeError);
    expect(() => histogram([0, 1, 2], { bins: 2, range: [0, 1] })).toThrow(RangeError);
  });

  test('explicit edges 밖 entry도 RangeError', () => {
    expect(() => histogram([5], { bins: [0, 1, 2] })).toThrow(RangeError);
  });
});

describe('histogramInto — atomicity / aliasing', () => {
  test('validation 실패 시 out 미수정', () => {
    const out = [9, 8, 7];
    expect(() => histogramInto(out, [Number.NaN], { bins: 2, range: [0, 1] })).toThrow(RangeError);
    expect(out).toEqual([9, 8, 7]);
  });

  test('out === values aliasing 안전', () => {
    // values 자체는 mutate되지 않아야 함 — out과 같은 배열이면 commit이 out.length=0으로 비우므로
    // values와 out이 같으면 결과는 count만 남는다. 검증은 commit 후 결과가 정상인지.
    const arr = [0, 1, 2, 3];
    histogramInto(arr, arr, { bins: 2, range: [0, 4] });
    // [0,2): 0,1 → 2 / [2,4]: 2,3 → 2
    expect(arr).toEqual([2, 2]);
  });

  test('정상 호출은 out에 count 기록 후 out 반환', () => {
    const out: number[] = [];
    const ret = histogramInto(out, [0, 1, 2], { bins: 3, range: [0, 3] });
    expect(ret).toBe(out);
    expect(out).toEqual([1, 1, 1]);
  });
});
