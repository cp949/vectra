import { describe, expect, test } from 'vitest';
import { choice } from '../../../src/random/choice';
import { permutation } from '../../../src/random/permutation';
import { pickUniqueInto } from '../../../src/random/pick-unique-into';
import { randomIndex } from '../../../src/random/random-index';
import { rangePermutation } from '../../../src/random/range-permutation';
import { rangePermutationInto } from '../../../src/random/range-permutation-into';
import { sample } from '../../../src/random/sample';
import { sampleInto } from '../../../src/random/sample-into';
import { shuffle } from '../../../src/random/shuffle';
import { shuffleInPlace } from '../../../src/random/shuffle-in-place';
import { shuffleInto } from '../../../src/random/shuffle-into';
import { uniqueIndicesInto } from '../../../src/random/unique-indices-into';
import { weightedChoice } from '../../../src/random/weighted-choice';
import { weightedProbability } from '../../../src/random/weighted-probability';
import { weightedRandomIndex } from '../../../src/random/weighted-random-index';
import { weightedShuffle } from '../../../src/random/weighted-shuffle';

// 미리 정해진 값을 순서대로 반환하는 테스트용 sequence generator
const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('choice — 배열에서 단일 항목 선택', () => {
  test('빈 배열은 undefined를 반환한다', () => {
    expect(choice([])).toBeUndefined();
  });

  test('sequence rng로 결정론적 항목을 반환한다', () => {
    const items = ['a', 'b', 'c'];
    const rng = sequence([0, 0.34, 0.99]);
    // 0 → floor(0 * 3) = 0 → 'a'
    expect(choice(items, rng)).toBe('a');
    // 0.34 → floor(0.34 * 3) = 1 → 'b'
    expect(choice(items, rng)).toBe('b');
    // 0.99 → floor(0.99 * 3) = 2 → 'c'
    expect(choice(items, rng)).toBe('c');
  });
});

describe('weightedChoice — 가중치 기반 항목 선택', () => {
  test('zero weight 항목은 건너뛴다', () => {
    // items: ['a', 'b', 'c'], weights: [0, 2, 1]
    // totalWeight = 3, 'a'는 선택되지 않음
    // threshold < 2 → 'b', threshold >= 2 → 'c'
    const rng = sequence([0, 0.5, 0.99]);
    // 0 * 3 = 0.0 → cumulative: 'a'=0, 'b'=2, 'c'=3 → threshold=0 < 2 → 'b'
    expect(weightedChoice(['a', 'b', 'c'], [0, 2, 1], rng)).toBe('b');
    // 0.5 * 3 = 1.5 → 'b'
    expect(weightedChoice(['a', 'b', 'c'], [0, 2, 1], rng)).toBe('b');
    // 0.99 * 3 = 2.97 → >= 2 → 'c'
    expect(weightedChoice(['a', 'b', 'c'], [0, 2, 1], rng)).toBe('c');
  });

  test('items와 weights 길이가 다르면 RangeError를 던진다', () => {
    expect(() => weightedChoice(['a', 'b'], [1], sequence([0]))).toThrow(RangeError);
    expect(() => weightedChoice(['a'], [1, 2], sequence([0]))).toThrow(RangeError);
  });

  test('negative weight는 RangeError를 던진다', () => {
    expect(() => weightedChoice(['a', 'b'], [-1, 1], sequence([0]))).toThrow(RangeError);
  });

  test('non-finite weight는 RangeError를 던진다', () => {
    expect(() => weightedChoice(['a', 'b'], [Infinity, 1], sequence([0]))).toThrow(RangeError);
    expect(() => weightedChoice(['a', 'b'], [Number.NaN, 1], sequence([0]))).toThrow(RangeError);
  });

  test('positive weight 합계가 0이면 undefined를 반환한다', () => {
    // 모든 weight가 0
    expect(weightedChoice(['a', 'b', 'c'], [0, 0, 0], sequence([0.5]))).toBeUndefined();
  });

  test('빈 배열은 undefined를 반환한다', () => {
    expect(weightedChoice([], [], sequence([0]))).toBeUndefined();
  });
});

describe('weightedRandomIndex — 가중치 기반 index 선택', () => {
  test('weight 비율에 따라 index를 반환한다', () => {
    const rng = sequence([0, 0.49, 0.5, 0.99]);

    expect(weightedRandomIndex([1, 2, 1], rng)).toBe(0);
    expect(weightedRandomIndex([1, 2, 1], rng)).toBe(1);
    expect(weightedRandomIndex([1, 2, 1], rng)).toBe(1);
    expect(weightedRandomIndex([1, 2, 1], rng)).toBe(2);
  });

  test('zero weight index는 선택하지 않는다', () => {
    const rng = sequence([0, 0.99]);

    expect(weightedRandomIndex([0, 3, 0], rng)).toBe(1);
    expect(weightedRandomIndex([0, 3, 0], rng)).toBe(1);
  });

  test('빈 배열, 합계 0, invalid weight는 RangeError를 던진다', () => {
    expect(() => weightedRandomIndex([], sequence([0]))).toThrow(RangeError);
    expect(() => weightedRandomIndex([0, 0], sequence([0]))).toThrow(RangeError);
    expect(() => weightedRandomIndex([1, -1], sequence([0]))).toThrow(RangeError);
    expect(() => weightedRandomIndex([1, Number.NaN], sequence([0]))).toThrow(RangeError);
    expect(() => weightedRandomIndex([1, Infinity], sequence([0]))).toThrow(RangeError);
  });

  test('finite weight 합계가 overflow되면 RangeError를 던진다', () => {
    expect(() => weightedRandomIndex([Number.MAX_VALUE, Number.MAX_VALUE], sequence([0.5]))).toThrow(RangeError);
  });
});

describe('weightedProbability — weight 함수 기반 accept/reject sampling', () => {
  test('param과 weight(param) 기준 성공 여부를 반환한다', () => {
    const rng = sequence([0.25, 0.1, 0.75, 0.9]);

    expect(weightedProbability((t) => t, rng)).toEqual([0.25, true]);
    expect(weightedProbability((t) => t, rng)).toEqual([0.75, false]);
  });

  test('weight 함수 결과가 [0, 1] 밖이거나 non-finite이면 RangeError를 던진다', () => {
    expect(() => weightedProbability(() => -0.1, sequence([0.1, 0.1]))).toThrow(RangeError);
    expect(() => weightedProbability(() => 1.1, sequence([0.1, 0.1]))).toThrow(RangeError);
    expect(() => weightedProbability(() => Number.NaN, sequence([0.1, 0.1]))).toThrow(RangeError);
    expect(() => weightedProbability(() => Infinity, sequence([0.1, 0.1]))).toThrow(RangeError);
  });
});

describe('shuffleInPlace — 배열 in-place 셔플', () => {
  test('input을 mutate하고 같은 reference를 반환한다', () => {
    const items = [1, 2, 3, 4, 5];
    const rng = sequence([0.1, 0.2, 0.3, 0.4, 0.5]);
    const result = shuffleInPlace(items, rng);
    // 같은 reference여야 한다
    expect(result).toBe(items);
    // 항목 수가 보존되어야 한다
    expect(result).toHaveLength(5);
    // 모든 원소가 보존되어야 한다
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('빈 배열은 그대로 반환한다', () => {
    const items: number[] = [];
    const result = shuffleInPlace(items);
    expect(result).toBe(items);
    expect(result).toHaveLength(0);
  });
});

describe('shuffleInto — 새 배열로 셔플 복사', () => {
  test('output을 clear하고 input은 변경하지 않는다', () => {
    const input = [1, 2, 3];
    const out: number[] = [99, 100]; // 기존 값이 있는 output
    const rng = sequence([0.1, 0.5, 0.9]);
    const result = shuffleInto(out, input, rng);
    // 반환값은 out reference여야 한다
    expect(result).toBe(out);
    // out은 input과 같은 항목을 가져야 한다
    expect([...out].sort()).toEqual([1, 2, 3]);
    // input은 변경되지 않아야 한다
    expect(input).toEqual([1, 2, 3]);
  });

  test('out === input aliasing에서도 항목을 잃지 않는다', () => {
    const items = [1, 2, 3, 4, 5];
    const rng = sequence([0.1, 0.2, 0.3, 0.4, 0.5]);
    // out과 input이 같은 배열을 가리킴
    const result = shuffleInto(items, items, rng);
    expect(result).toBe(items);
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('빈 배열은 빈 output을 반환한다', () => {
    const out: number[] = [];
    const result = shuffleInto(out, [] as number[], sequence([0]));
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });
});

describe('randomIndex — collection index 선택', () => {
  test('빈 range는 undefined를 반환한다', () => {
    expect(randomIndex(0, sequence([0]))).toBeUndefined();
  });

  test('sequence rng로 결정론적 index를 반환한다', () => {
    const rng = sequence([0, 0.34, 0.99]);
    expect(randomIndex(3, rng)).toBe(0);
    expect(randomIndex(3, rng)).toBe(1);
    expect(randomIndex(3, rng)).toBe(2);
  });

  test('유효하지 않은 length는 RangeError를 던진다', () => {
    for (const length of [-1, 1.5, Number.NaN, Infinity, 0x100000000 + 1]) {
      expect(() => randomIndex(length, sequence([0]))).toThrow(RangeError);
    }
  });
});

describe('sample — replacement 없는 부분 샘플', () => {
  test('새 배열을 반환하고 input은 변경하지 않는다', () => {
    const items = ['a', 'b', 'c', 'd'];
    const result = sample(items, 2, sequence([0.5, 0]));

    expect(result).toEqual(['c', 'b']);
    expect(result).not.toBe(items);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  test('count가 items 길이를 초과하면 가능한 모든 항목을 반환한다', () => {
    const result = sample([1, 2, 3], 5, sequence([0.99, 0, 0]));

    expect(result).toHaveLength(3);
    expect([...result].sort()).toEqual([1, 2, 3]);
  });

  test('빈 input 또는 count 0은 빈 배열을 반환한다', () => {
    expect(sample([], 3, sequence([0]))).toEqual([]);
    expect(sample(['a', 'b'], 0, sequence([0]))).toEqual([]);
  });

  test('유효하지 않은 count는 RangeError를 던진다', () => {
    for (const count of [-1, 1.5, Number.NaN, Infinity, 0x100000000 + 1]) {
      expect(() => sample(['a'], count, sequence([0]))).toThrow(RangeError);
    }
  });
});

describe('sampleInto — replacement 없는 부분 샘플을 output에 기록', () => {
  test('output을 clear하고 선택된 항목을 push한다', () => {
    const out = ['old'];
    const result = sampleInto(out, ['a', 'b', 'c', 'd'], 2, sequence([0.5, 0]));

    expect(result).toBe(out);
    expect(out).toEqual(['c', 'b']);
  });

  test('out === items aliasing에서도 snapshot 기준으로 항목을 잃지 않는다', () => {
    const items = [1, 2, 3, 4];
    const result = sampleInto(items, items, 3, sequence([0.5, 0, 0]));

    expect(result).toBe(items);
    expect(items).toHaveLength(3);
    expect([...items].sort()).toEqual([1, 2, 3]);
  });

  test('유효하지 않은 count는 output을 수정하지 않고 RangeError를 던진다', () => {
    const out = ['keep'];

    expect(() => sampleInto(out, ['a'], -1, sequence([0]))).toThrow(RangeError);
    expect(out).toEqual(['keep']);
  });
});

describe('rangePermutationInto — integer range 순열', () => {
  test('output을 clear하고 range 순열을 기록한다', () => {
    const out = [99, 100];
    const result = rangePermutationInto(out, 4, sequence([0.75, 0.5, 0]));

    expect(result).toBe(out);
    expect(out).toEqual([2, 0, 1, 3]);
  });

  test('length 0은 빈 output을 반환한다', () => {
    const out = [1, 2, 3];
    const result = rangePermutationInto(out, 0, sequence([0]));

    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('유효하지 않은 length는 output을 수정하지 않고 RangeError를 던진다', () => {
    const out = [7];

    for (const length of [-1, 1.5, Number.NaN, Infinity, 0x100000000 + 1]) {
      expect(() => rangePermutationInto(out, length, sequence([0]))).toThrow(RangeError);
      expect(out).toEqual([7]);
    }
  });
});

describe('uniqueIndicesInto — [0, max) 범위에서 unique index 선택', () => {
  test('count개의 unique index를 out에 기록한다', () => {
    const out: number[] = [];
    const result = uniqueIndicesInto(out, 3, 5, sequence([0, 0.25, 0.5, 0.75]));

    expect(result).toBe(out);
    expect(out).toHaveLength(3);
    // 모든 값이 [0, 5) 범위여야 한다
    for (const idx of out) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
    }
    // unique해야 한다
    expect(new Set(out).size).toBe(3);
  });

  test('count === 0이면 빈 out을 반환한다', () => {
    const out = [1, 2, 3];
    const result = uniqueIndicesInto(out, 0, 5, sequence([0]));

    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('count === max이면 전체 range의 순열을 반환한다', () => {
    const out: number[] = [];
    uniqueIndicesInto(out, 4, 4, sequence([0, 0, 0, 0]));

    expect(out).toHaveLength(4);
    expect([...out].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  test('count > max이면 RangeError를 던진다', () => {
    expect(() => uniqueIndicesInto([], 5, 3, sequence([0]))).toThrow(RangeError);
  });

  test('비정수 count 또는 max이면 RangeError를 던진다', () => {
    expect(() => uniqueIndicesInto([], 1.5, 5, sequence([0]))).toThrow(RangeError);
    expect(() => uniqueIndicesInto([], 2, 5.5, sequence([0]))).toThrow(RangeError);
  });
});

describe('pickUniqueInto — 배열에서 정확히 count개 unique 항목 선택', () => {
  test('count개 항목을 out에 기록한다', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const out: string[] = [];
    const result = pickUniqueInto(out, items, 3, sequence([0, 0.25, 0.5]));

    expect(result).toBe(out);
    expect(out).toHaveLength(3);
    // 모든 값이 items에 포함되어야 한다
    for (const item of out) {
      expect(items).toContain(item);
    }
    // unique해야 한다
    expect(new Set(out).size).toBe(3);
  });

  test('count === 0이면 빈 out을 반환한다', () => {
    const out = ['x'];
    const result = pickUniqueInto(out, ['a', 'b', 'c'], 0, sequence([0]));

    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('count > items.length이면 RangeError를 던진다', () => {
    expect(() => pickUniqueInto([], ['a', 'b'], 3, sequence([0]))).toThrow(RangeError);
  });

  test('sample과 달리 clamp하지 않고 RangeError를 던진다', () => {
    // sample은 count > length → clamp하지만 pickUniqueInto는 RangeError
    expect(() => pickUniqueInto([], [1, 2, 3], 10, sequence([0]))).toThrow(RangeError);
  });

  test('비정수 count이면 RangeError를 던진다', () => {
    expect(() => pickUniqueInto([], ['a', 'b', 'c'], 1.5, sequence([0]))).toThrow(RangeError);
  });
});

describe('weightedShuffle — 가중치 기반 without-replacement 순서 반환', () => {
  test('weight가 큰 항목이 앞에 오는 결정론적 순서를 반환한다', () => {
    // weights: [1, 3, 2], rng: [0.5, 0.2, 0.8]
    // key: ln(0.5)/1 ≈ -0.693, ln(0.2)/3 ≈ -0.536, ln(0.8)/2 ≈ -0.112
    // 내림차순: 'c' > 'b' > 'a'
    const rng = sequence([0.5, 0.2, 0.8]);
    const result = weightedShuffle(['a', 'b', 'c'], [1, 3, 2], rng);
    expect(result).toEqual(['c', 'b', 'a']);
  });

  test('zero weight 항목은 positive weight 항목 뒤에 input 순서 그대로 추가된다', () => {
    // weights: [2, 0, 1, 0], rng 소비: [0.5, 0.9] (index 0, 2만 positive)
    const rng = sequence([0.5, 0.9]);
    // key: ln(0.5)/2 ≈ -0.347, ln(0.9)/1 ≈ -0.105 → index 2 먼저, index 0 다음
    // zero: index 1, index 3 → input 순서
    const result = weightedShuffle(['a', 'b', 'c', 'd'], [2, 0, 1, 0], rng);
    expect(result).toEqual(['c', 'a', 'b', 'd']);
  });

  test('모든 weight가 0이면 input 순서 copy를 반환한다', () => {
    const items = ['x', 'y', 'z'];
    const result = weightedShuffle(items, [0, 0, 0], sequence([0.5]));
    expect(result).toEqual(['x', 'y', 'z']);
    // copy여야 한다
    expect(result).not.toBe(items);
  });

  test('빈 배열은 빈 배열을 반환한다', () => {
    const result = weightedShuffle([], [], sequence([0]));
    expect(result).toEqual([]);
  });

  test('input items와 weights를 mutate하지 않는다', () => {
    const items = ['a', 'b', 'c'];
    const weights = [1, 2, 3];
    const rng = sequence([0.1, 0.5, 0.9]);
    weightedShuffle(items, weights, rng);
    expect(items).toEqual(['a', 'b', 'c']);
    expect(weights).toEqual([1, 2, 3]);
  });

  test('길이 불일치는 RangeError를 던진다', () => {
    expect(() => weightedShuffle(['a', 'b'], [1], sequence([0]))).toThrow(RangeError);
    expect(() => weightedShuffle(['a'], [1, 2], sequence([0]))).toThrow(RangeError);
  });

  test('음수 weight는 RangeError를 던진다', () => {
    expect(() => weightedShuffle(['a', 'b'], [-1, 1], sequence([0]))).toThrow(RangeError);
  });

  test('NaN weight는 RangeError를 던진다', () => {
    expect(() => weightedShuffle(['a', 'b'], [Number.NaN, 1], sequence([0]))).toThrow(RangeError);
  });

  test('Infinity weight는 RangeError를 던진다', () => {
    expect(() => weightedShuffle(['a', 'b'], [Infinity, 1], sequence([0]))).toThrow(RangeError);
  });

  test('-Infinity weight는 RangeError를 던진다', () => {
    expect(() => weightedShuffle(['a', 'b'], [-Infinity, 1], sequence([0]))).toThrow(RangeError);
  });

  test('generic T 타입을 보존한다', () => {
    const items: { id: string }[] = [{ id: 'x' }, { id: 'y' }, { id: 'z' }];
    const result = weightedShuffle(items, [1, 2, 3], sequence([0.3, 0.6, 0.9]));
    expect(result).toHaveLength(3);
    expect(result.map((v) => v.id).sort()).toEqual(['x', 'y', 'z']);
  });

  test('rng가 0을 반환하면 key=-Infinity이므로 해당 항목은 positive 항목 중 마지막에 위치한다', () => {
    // u=0 → Math.log(0)/w = -Infinity → 내림차순 정렬에서 맨 뒤
    const rng = sequence([0, 0.5]);
    const result = weightedShuffle(['a', 'b'], [1, 1], rng);
    expect(result).toEqual(['b', 'a']);
  });
});

describe('permutation — array 또는 range 순열 copy 반환', () => {
  test('number input: 0..length-1 항목을 모두 포함하는 새 배열을 반환한다', () => {
    const rng = sequence([0.75, 0.5, 0]);
    const result = permutation(4, rng);

    expect(result).toHaveLength(4);
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  test('number input: length 0은 빈 배열을 반환한다', () => {
    const result = permutation(0, sequence([0]));

    expect(result).toEqual([]);
  });

  test('number input: invalid length는 RangeError를 던진다', () => {
    for (const length of [-1, 1.5, Number.NaN, Infinity, 0x100000000 + 1]) {
      expect(() => permutation(length, sequence([0]))).toThrow(RangeError);
    }
  });

  test('array input: input을 변경하지 않고 모든 원소를 보존한다', () => {
    const input = [10, 20, 30, 40];
    const rng = sequence([0.75, 0.5, 0]);
    const result = permutation(input, rng);

    expect(result).not.toBe(input);
    expect(input).toEqual([10, 20, 30, 40]);
    expect([...result].sort((a, b) => a - b)).toEqual([10, 20, 30, 40]);
  });

  test('array input: 빈 배열은 빈 배열 copy를 반환한다', () => {
    const input: number[] = [];
    const result = permutation(input, sequence([0]));

    expect(result).not.toBe(input);
    expect(result).toEqual([]);
  });

  test('array input: generic type을 보존한다 (string[])', () => {
    const input = ['x', 'y', 'z'];
    const rng = sequence([0.9, 0.5]);
    const result = permutation(input, rng);

    expect(result).toHaveLength(3);
    expect([...result].sort()).toEqual(['x', 'y', 'z']);
  });

  test('readonly tuple input (as const)도 컴파일 통과하고 정상 동작한다', () => {
    const input = [1, 2, 3] as const;
    const rng = sequence([0.9, 0.5]);
    const result = permutation(input, rng);

    expect(result).toHaveLength(3);
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  test('number input 결과가 같은 rng로 호출한 rangePermutation과 일치한다', () => {
    const values = [0.75, 0.5, 0.25, 0];
    const result = permutation(4, sequence(values));
    const expected = rangePermutation(4, sequence(values));

    expect(result).toEqual(expected);
  });

  test('array input 결과가 같은 rng로 호출한 shuffle과 일치한다', () => {
    const items = ['a', 'b', 'c', 'd'];
    const values = [0.75, 0.5, 0.25, 0];
    const result = permutation(items, sequence(values));
    const expected = shuffle(items, sequence(values));

    expect(result).toEqual(expected);
  });
});
