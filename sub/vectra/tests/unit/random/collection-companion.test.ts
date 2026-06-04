import { describe, expect, test } from 'vitest';
import { pickUnique } from '../../../src/random/pick-unique';
import { pickUniqueInto } from '../../../src/random/pick-unique-into';
import { rangePermutation } from '../../../src/random/range-permutation';
import { rangePermutationInto } from '../../../src/random/range-permutation-into';
import { shuffle } from '../../../src/random/shuffle';
import { shuffleInto } from '../../../src/random/shuffle-into';
import { uniqueIndices } from '../../../src/random/unique-indices';
import { uniqueIndicesInto } from '../../../src/random/unique-indices-into';

const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('random.pickUnique — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const rng = sequence([0.1, 0.2, 0.3]);
    const rng2 = sequence([0.1, 0.2, 0.3]);
    const out: number[] = [];
    pickUniqueInto(out, [1, 2, 3], 2, rng);
    expect(pickUnique([1, 2, 3], 2, rng2)).toEqual(out);
  });

  test('out과 items가 같은 배열이어도 입력 snapshot 기준으로 선택한다', () => {
    const items = [1, 2, 3];
    const result = pickUniqueInto(items, items, 2, sequence([0, 0]));

    expect(result).toBe(items);
    expect(result).toEqual([1, 2]);
  });
});

describe('random.shuffle — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const rng = sequence([0.1, 0.2, 0.3]);
    const rng2 = sequence([0.1, 0.2, 0.3]);
    const out: number[] = [];
    shuffleInto(out, [1, 2, 3], rng);
    expect(shuffle([1, 2, 3], rng2)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const input = [1, 2, 3];
    const result = shuffle(input, sequence([0.1, 0.5, 0.9]));
    expect(result).not.toBe(input);
  });

  test('input을 변경하지 않는다', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input, sequence([0.1, 0.2, 0.3, 0.4, 0.5]));
    expect(input).toEqual(copy);
  });

  test('모든 원소가 보존된다', () => {
    const result = shuffle([1, 2, 3, 4, 5], sequence([0.1, 0.2, 0.3, 0.4]));
    expect(result).toHaveLength(5);
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  test('빈 배열은 빈 배열을 반환한다', () => {
    expect(shuffle([], sequence([0]))).toEqual([]);
  });

  test('generic T를 보존한다', () => {
    const input: string[] = ['a', 'b', 'c'];
    const result: string[] = shuffle(input, sequence([0.1, 0.5]));
    expect(result.every((v) => typeof v === 'string')).toBe(true);
  });
});

describe('random.rangePermutation — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const rng = sequence([0.75, 0.5, 0]);
    const rng2 = sequence([0.75, 0.5, 0]);
    const out: number[] = [];
    rangePermutationInto(out, 4, rng);
    expect(rangePermutation(4, rng2)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = rangePermutation(4, sequence([0.1, 0.5, 0.9]));
    const result2 = rangePermutation(4, sequence([0.1, 0.5, 0.9]));
    expect(result1).not.toBe(result2);
  });

  test('0..length-1 범위의 모든 값을 포함한다', () => {
    const result = rangePermutation(5, sequence([0.1, 0.2, 0.3, 0.4]));
    expect(result).toHaveLength(5);
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });

  test('length 0은 빈 배열을 반환한다', () => {
    expect(rangePermutation(0, sequence([0]))).toEqual([]);
  });

  test('invalid length이면 RangeError를 던진다', () => {
    expect(() => rangePermutation(-1, sequence([0]))).toThrow(RangeError);
    expect(() => rangePermutation(1.5, sequence([0]))).toThrow(RangeError);
  });
});

describe('random.uniqueIndices — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const rng = sequence([0, 0.25, 0.5, 0.75]);
    const rng2 = sequence([0, 0.25, 0.5, 0.75]);
    const out: number[] = [];
    uniqueIndicesInto(out, 3, 5, rng);
    expect(uniqueIndices(3, 5, rng2)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = uniqueIndices(3, 5, sequence([0.1, 0.5, 0.9]));
    const result2 = uniqueIndices(3, 5, sequence([0.1, 0.5, 0.9]));
    expect(result1).not.toBe(result2);
  });

  test('count개의 unique index를 [0, max) 범위에서 반환한다', () => {
    const result = uniqueIndices(3, 5, sequence([0, 0.25, 0.5]));
    expect(result).toHaveLength(3);
    for (const idx of result) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
    }
    expect(new Set(result).size).toBe(3);
  });

  test('count 0이면 빈 배열을 반환한다', () => {
    expect(uniqueIndices(0, 5, sequence([0]))).toEqual([]);
  });

  test('count > max이면 RangeError를 던진다', () => {
    expect(() => uniqueIndices(5, 3, sequence([0]))).toThrow(RangeError);
  });

  test('invalid count이면 RangeError를 던진다', () => {
    expect(() => uniqueIndices(1.5, 5, sequence([0]))).toThrow(RangeError);
  });
});
