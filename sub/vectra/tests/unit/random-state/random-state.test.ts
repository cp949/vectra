/**
 * `createRandomState`와 `rand`를 검증하는 테스트.
 * seeded 재현성, rng override 우선순위, geometry/collection wrapper 동작,
 * module-level instance 존재, 유효하지 않은 seed 처리를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import * as Random from '../../../src/random';
import { createRandomState } from '../../../src/random-state/create-random-state';

import { rand } from '../../../src/random-state/rand';

/**
 * 순서가 고정된 난수 시퀀스를 반복 반환하는 테스트용 rng 생성 헬퍼.
 * 인덱스가 배열 끝을 넘으면 처음으로 돌아간다.
 */
const sequence = (values: readonly number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('createRandomState — seeded 재현성', () => {
  test('같은 string seed는 같은 float sequence를 만든다', () => {
    const stateA = createRandomState('demo');
    const stateB = createRandomState('demo');
    const a = Array.from({ length: 5 }, () => stateA.float(0, 10));
    const b = Array.from({ length: 5 }, () => stateB.float(0, 10));
    expect(a).toEqual(b);
  });

  test('같은 number seed는 같은 int sequence를 만든다', () => {
    const stateA = createRandomState(42);
    const stateB = createRandomState(42);
    const a = Array.from({ length: 5 }, () => stateA.int(0, 100));
    const b = Array.from({ length: 5 }, () => stateB.int(0, 100));
    expect(a).toEqual(b);
  });
});

describe('createRandomState — random domain wrapper completeness', () => {
  test('random domain의 function을 모두 노출한다', () => {
    const randomFunctionNames = Object.entries(Random)
      .filter(([, value]) => typeof value === 'function')
      .map(([name]) => name)
      .sort();
    const stateFunctionNames = Object.entries(createRandomState('complete'))
      .filter(([, value]) => typeof value === 'function')
      .map(([name]) => name)
      .sort();

    expect(stateFunctionNames).toEqual(randomFunctionNames);
  });
});

describe('createRandomState — rng override 우선순위', () => {
  test('override rng를 주면 float은 override 기준으로 계산된다', () => {
    const state = createRandomState('demo');
    const result = state.float(0, 10, () => 0);
    expect(result).toBe(0);
  });

  test('override 호출은 seeded instance 내부 RNG를 소비하지 않는다', () => {
    const stateWithOverride = createRandomState('demo');
    stateWithOverride.float(0, 10, () => 0);
    const afterOverride = stateWithOverride.float(0, 10);

    const freshState = createRandomState('demo');
    const firstCall = freshState.float(0, 10);

    expect(afterOverride).toBe(firstCall);
  });

  test('override rng가 0.999999999999를 반환하면 int(0, 9)는 9를 반환한다', () => {
    const state = createRandomState('demo');
    const result = state.int(0, 9, () => 0.999999999999);
    expect(result).toBe(9);
  });

  test('distribution wrapper override는 seeded 내부 RNG를 소비하지 않는다', () => {
    const stateWithOverride = createRandomState('demo');
    stateWithOverride.bernoulli(0.5, () => 0);
    const afterOverride = stateWithOverride.float(0, 10);

    const freshState = createRandomState('demo');
    const firstCall = freshState.float(0, 10);

    expect(afterOverride).toBe(firstCall);
  });

  test('geometry wrapper override는 seeded 내부 RNG를 소비하지 않는다', () => {
    const stateWithOverride = createRandomState('demo');
    const out = { x: 0, y: 0 };
    const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
    stateWithOverride.pointInBoundsInto(out, bounds, sequence([0, 0]));
    const afterOverride = stateWithOverride.float(0, 10);

    const freshState = createRandomState('demo');
    const firstCall = freshState.float(0, 10);

    expect(afterOverride).toBe(firstCall);
  });

  test('collection wrapper override는 seeded 내부 RNG를 소비하지 않는다', () => {
    const stateWithOverride = createRandomState('demo');
    stateWithOverride.shuffle([1, 2, 3], sequence([0, 0.5, 0.999999999999]));
    const afterOverride = stateWithOverride.float(0, 10);

    const freshState = createRandomState('demo');
    const firstCall = freshState.float(0, 10);

    expect(afterOverride).toBe(firstCall);
  });
});

describe('createRandomState — geometry wrapper', () => {
  test('pointInBoundsInto는 min x와 max 직전 y mapping을 기록한다', () => {
    const state = createRandomState('demo');
    const out = { x: 0, y: 0 };
    const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
    const result = state.pointInBoundsInto(out, bounds, sequence([0, 0.999999999999]));
    expect(result).toBe(true);
    expect(out.x).toBe(0);
    expect(out.y).toBeCloseTo(9.99999999999);
  });

  test('inverted bounds에서 pointInBoundsInto는 false를 반환하고 out을 수정하지 않는다', () => {
    const state = createRandomState('demo');
    const out = { x: 5, y: 5 };
    const bounds = { min: { x: 10, y: 0 }, max: { x: 0, y: 10 } };
    const result = state.pointInBoundsInto(out, bounds);
    expect(result).toBe(false);
    expect(out.x).toBe(5);
    expect(out.y).toBe(5);
  });

  test('pointInRectOutsideInto는 slab 선택 좌표를 기록하고 inner를 덮으면 false다', () => {
    const state = createRandomState('demo');
    const out = { x: 0, y: 0 };
    const outer = { x: 0, y: 0, width: 100, height: 80 };
    const inner = { x: 25, y: 20, width: 50, height: 30 };
    // u=0 → top slab, fx=0.5 → x=50, fy=0.5 → y=10
    const result = state.pointInRectOutsideInto(out, outer, inner, sequence([0, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 50, y: 10 });

    const covered = { x: 5, y: 5 };
    const coveredResult = state.pointInRectOutsideInto(covered, outer, outer, () => 0.5);
    expect(coveredResult).toBe(false);
    expect(covered).toEqual({ x: 5, y: 5 });
  });

  test('pointInRectOutside override는 seeded 내부 RNG를 소비하지 않는다', () => {
    const stateWithOverride = createRandomState('demo');
    stateWithOverride.pointInRectOutside(
      { x: 0, y: 0, width: 100, height: 80 },
      { x: 25, y: 20, width: 50, height: 30 },
      sequence([0, 0.5, 0.5])
    );
    const afterOverride = stateWithOverride.float(0, 10);

    const freshState = createRandomState('demo');
    const firstCall = freshState.float(0, 10);

    expect(afterOverride).toBe(firstCall);
  });

  test('directionInto는 length를 생략하면 단위 벡터를 기록한다', () => {
    const state = createRandomState('demo');
    const out = { x: 0, y: 0 };
    state.directionInto(out, undefined, () => 0);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(0);
  });

  test('weightedPointOnPolylineInto는 weight 비례 segment를 선택한다', () => {
    const state = createRandomState('demo');
    const out = { x: 0, y: 0 };
    // polyline (0,0)-(1,0)-(4,0), weights [4,0.25] → rng=0.5 → seg0 (0.59375,0)
    const result = state.weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 4, y: 0 },
      ],
      [4, 0.25],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0.59375);
    expect(out.y).toBeCloseTo(0);
  });

  test('weightedPointOnPolyline override는 seeded 내부 RNG를 소비하지 않는다', () => {
    const stateWithOverride = createRandomState('demo');
    stateWithOverride.weightedPointOnPolyline(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [1],
      () => 0.5
    );
    const afterOverride = stateWithOverride.float(0, 10);

    const freshState = createRandomState('demo');
    const firstCall = freshState.float(0, 10);

    expect(afterOverride).toBe(firstCall);
  });

  test('weightedPointOnPath override는 weight 비례 drawing segment를 선택한다', () => {
    const state = createRandomState('demo');
    // move(0,0) line(2,0) line(2,1), weights [1,8] → rng=0.5 → seg1 (2,0.375)
    const result = state.weightedPointOnPath(
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 2, y: 0 },
        { kind: 'line', x: 2, y: 1 },
      ],
      [1, 8],
      () => 0.5
    );
    expect(result).toBeDefined();
    if (result !== undefined) {
      expect(result.x).toBeCloseTo(2);
      expect(result.y).toBeCloseTo(0.375);
    }
  });
});

describe('createRandomState — collection wrapper', () => {
  test('shuffle은 input을 변경하지 않는다', () => {
    const state = createRandomState('demo');
    const input = [1, 2, 3];
    const copy = [...input];
    state.shuffle(input, sequence([0, 0.999999999999]));
    expect(input).toEqual(copy);
  });

  test('weightedShuffle은 rng 경계값에서 deterministic한 결과를 반환한다', () => {
    const state = createRandomState('demo');
    const result = state.weightedShuffle(['a', 'b'], [1, 1], sequence([0, 0.5]));
    // u=0 → key=-Infinity for 'a'; u=0.5 → key≈-0.693 for 'b'; 높은 key 우선 → ['b', 'a']
    expect(result).toEqual(['b', 'a']);
  });
});

describe('rand — module-level instance', () => {
  test('rand.float은 override rng가 주어지면 그 값을 사용한다', () => {
    const result = rand.float(0, 1, () => 0);
    expect(result).toBe(0);
  });

  test('rand.int은 override rng가 주어지면 그 값을 사용한다', () => {
    const result = rand.int(0, 9, () => 0.999999999999);
    expect(result).toBe(9);
  });
});

describe('createRandomState — 유효하지 않은 seed', () => {
  test('NaN seed는 RangeError를 던진다', () => {
    expect(() => createRandomState(Number.NaN)).toThrow(RangeError);
  });

  test('Infinity seed는 RangeError를 던진다', () => {
    expect(() => createRandomState(Infinity)).toThrow(RangeError);
  });

  test('-Infinity seed는 RangeError를 던진다', () => {
    expect(() => createRandomState(-Infinity)).toThrow(RangeError);
  });
});
