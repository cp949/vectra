/**
 * `createRandomState` facade의 인자 연결을 검증하는 표 기반 테스트.
 * facade method 67개(pass-through 7개 제외)가 동명 `Random.*` 함수와 같은 인자 순서, 같은 rng로 연결되는지 본다.
 *
 * 검증 항목:
 *  1. override 경로: `state.f(...args, rngA)`와 `Random.f(...args, rngB)`의 반환값과 호출 뒤 인자가 같다.
 *  2. state rng 경로: `createRandomState(seed).f(...args)`와 `Random.f(...args, createRng(seed))`가 같다.
 *  3. 누락 방지: pass-through 7개를 뺀 `RandomState`의 함수 키 집합이 표의 키 집합과 같다.
 *
 * 설계 메모:
 *  - 같은 타입 인자(min/max, mean/stddev, a/b/c 등)는 비대칭 값을 쓴다. 뒤바꿈이 결과에 드러나야 한다.
 *  - rng는 `sequence`가 아니라 시드 `createRng` 두 개를 쓴다. gamma/beta/dirichlet의 rejection loop가 멈추지 않게 한다.
 *  - state seed와 override seed를 다르게 둔다. `pick`이 override를 무시하는 변이가 같은 값을 내서 통과하지 않게 한다.
 *  - 기존 `random domain wrapper completeness` 테스트는 이름 집합만 본다. 이 파일은 인자 순서와 rng 전달을 본다.
 */
import { describe, expect, test } from 'vitest';
import * as Random from '../../../src/random';
import { createRng } from '../../../src/random/create-rng';
import { createRandomState } from '../../../src/random-state/create-random-state';

/** 인자 팩토리. 호출마다 새 `out`과 새 배열을 만들어 case끼리, 경로끼리 상태가 섞이지 않게 한다. */
type ArgsFactory = () => unknown[];

/** 표의 한 행. 같은 method의 오버로드는 `variant`로 구분한다. */
type WiringCase = {
  name: string;
  variant?: string;
  args: ArgsFactory;
};

/** `RandomState`와 `Random`을 이름으로 호출하기 위한 느슨한 타입. */
type Callable = Record<string, (...args: unknown[]) => unknown>;

// 첫 난수가 멀리 떨어진 seed 쌍이다(0.796 / 0.163). 결과 공간이 작은 sign, bernoulli, choice에서도 두 경로가 갈린다.
const STATE_SEED = 'state';
const OVERRIDE_SEED = 'override';

/** facade가 그대로 넘기는 함수. 표에 넣지 않고 참조 동일성으로 확인한다. */
const PASS_THROUGH = [
  'createRng',
  'randomUint32',
  'secureRandomSource',
  'haltonSequence',
  'haltonSequenceInto',
  'sobolSequence',
  'sobolSequenceInto',
] as const;

/** 호출 뒤에도 같은 참조여야 비교가 되는 weight 함수. 팩토리마다 새로 만들면 인자 `toEqual`이 깨진다. */
const rampWeight = (param: number): number => 0.25 + param * 0.5;

// 아래 fixture는 모두 팩토리다. 호출마다 새 객체를 만들어 `out`과 입력 변이가 경로 사이에서 섞이지 않게 한다.
// 같은 타입 인자(triangle a/b/c, outer/inner 등)는 서로 다른 값이라 뒤바꿈이 결과에 드러난다.
const makeOut = () => ({ x: 0, y: 0 });

const segment = () => ({ a: { x: 1, y: 2 }, b: { x: 9, y: -3 } });
const rect = () => ({ x: -5, y: 3, width: 30, height: 12 });
const outerRect = () => ({ x: 0, y: 0, width: 100, height: 80 });
const innerRect = () => ({ x: 25, y: 20, width: 50, height: 30 });
const bounds = () => ({ min: { x: -4, y: 2 }, max: { x: 11, y: 9 } });
const circle = () => ({ center: { x: 3, y: -2 }, radius: 7 });
const ellipse = () => ({ center: { x: 1, y: -1 }, radiusX: 6, radiusY: 2.5 });
const triangle = () => [
  { x: 0, y: 0 },
  { x: 10, y: 1 },
  { x: 2, y: 7 },
];
const polygon = () => [
  { x: 0, y: 0 },
  { x: 8, y: 0 },
  { x: 9, y: 5 },
  { x: 3, y: 7 },
  { x: -1, y: 4 },
];
const polyline = () => [
  { x: 0, y: 0 },
  { x: 5, y: 0 },
  { x: 5, y: 3 },
  { x: 9, y: 8 },
];
const pathCommands = () => [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'line', x: 6, y: 0 },
  { kind: 'line', x: 6, y: 4 },
  { kind: 'line', x: 1, y: 9 },
];
const segmentWeights = () => [1, 4, 2];
const items = () => Array.from({ length: 40 }, (_, i) => `item-${i}`);
const itemWeights = () => Array.from({ length: 40 }, (_, i) => 0.5 + ((i * 7) % 11));
const numbers = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const alpha = () => [1.5, 2.5, 4];
const mean = () => [1, -2];
const covariance = () => [
  [4, 1],
  [1, 3],
];

/**
 * facade method 67개의 인자 표. 한 줄에 한 method다. `permutation`만 오버로드 두 개라 68행이다.
 * `Random`에 같은 이름이 있는 함수 중 pass-through 7개를 뺀 전부가 들어간다.
 */
const CASES: readonly WiringCase[] = [
  { name: 'random', args: () => [] },
  { name: 'float', args: () => [2.5, 17.25] },
  { name: 'int', args: () => [-30, 1000] },
  { name: 'sign', args: () => [] },
  { name: 'angle', args: () => [] },

  { name: 'directionInto', args: () => [makeOut(), 3.5] },
  { name: 'direction', args: () => [3.5] },
  { name: 'pointOnSegmentInto', args: () => [makeOut(), segment()] },
  { name: 'pointOnSegment', args: () => [segment()] },
  { name: 'pointInRectInto', args: () => [makeOut(), rect()] },
  { name: 'pointInRect', args: () => [rect()] },
  { name: 'pointInRectOutsideInto', args: () => [makeOut(), outerRect(), innerRect()] },
  { name: 'pointInRectOutside', args: () => [outerRect(), innerRect()] },
  { name: 'pointInBoundsInto', args: () => [makeOut(), bounds()] },
  { name: 'pointInBounds', args: () => [bounds()] },
  { name: 'pointInCircleInto', args: () => [makeOut(), circle()] },
  { name: 'pointInCircle', args: () => [circle()] },
  { name: 'pointOnCircleInto', args: () => [makeOut(), circle()] },
  { name: 'pointOnCircle', args: () => [circle()] },
  { name: 'pointInTriangleInto', args: () => [makeOut(), ...triangle()] },
  { name: 'pointInTriangle', args: () => triangle() },
  { name: 'pointInEllipseInto', args: () => [makeOut(), ellipse()] },
  { name: 'pointInEllipse', args: () => [ellipse()] },
  { name: 'pointInPolygonInto', args: () => [makeOut(), polygon()] },
  { name: 'pointInPolygon', args: () => [polygon()] },
  { name: 'pointOnPolylineInto', args: () => [makeOut(), polyline()] },
  { name: 'pointOnPolyline', args: () => [polyline()] },
  { name: 'pointOnPathInto', args: () => [makeOut(), pathCommands()] },
  { name: 'pointOnPath', args: () => [pathCommands()] },
  { name: 'weightedPointOnPolylineInto', args: () => [makeOut(), polyline(), segmentWeights()] },
  { name: 'weightedPointOnPolyline', args: () => [polyline(), segmentWeights()] },
  { name: 'weightedPointOnPathInto', args: () => [makeOut(), pathCommands(), segmentWeights()] },
  { name: 'weightedPointOnPath', args: () => [pathCommands(), segmentWeights()] },

  { name: 'choice', args: () => [items()] },
  { name: 'weightedChoice', args: () => [items(), itemWeights()] },
  { name: 'weightedRandomIndex', args: () => [itemWeights()] },
  { name: 'weightedProbability', args: () => [rampWeight] },
  { name: 'shuffleInPlace', args: () => [numbers()] },
  { name: 'shuffleInto', args: () => [[], numbers()] },
  { name: 'shuffle', args: () => [numbers()] },
  { name: 'randomIndex', args: () => [1000] },
  { name: 'sample', args: () => [numbers(), 4] },
  { name: 'sampleInto', args: () => [[], numbers(), 4] },
  { name: 'rangePermutationInto', args: () => [[], 12] },
  { name: 'rangePermutation', args: () => [12] },
  { name: 'uniqueIndicesInto', args: () => [[], 4, 20] },
  { name: 'uniqueIndices', args: () => [4, 20] },
  { name: 'pickUniqueInto', args: () => [[], items(), 4] },
  { name: 'pickUnique', args: () => [items(), 4] },
  { name: 'permutation', variant: 'number', args: () => [9] },
  { name: 'permutation', variant: 'array', args: () => [items()] },
  { name: 'weightedShuffle', args: () => [items(), itemWeights()] },

  { name: 'uniform', args: () => [1.5, 8.25] },
  { name: 'bernoulli', args: () => [0.5] },
  { name: 'standardNormal', args: () => [] },
  { name: 'normal', args: () => [10, 2.5] },
  { name: 'exponential', args: () => [3.5] },
  { name: 'triangular', args: () => [1, 2, 9] },
  { name: 'poisson', args: () => [37.5] },
  { name: 'binomial', args: () => [200, 0.35] },
  { name: 'geometric', args: () => [0.01] },
  { name: 'logNormal', args: () => [0.5, 0.75] },
  { name: 'gamma', args: () => [2.5, 3.5] },
  { name: 'beta', args: () => [2.5, 4.5] },

  { name: 'dirichletInto', args: () => [[], alpha()] },
  { name: 'dirichlet', args: () => [alpha()] },
  { name: 'multivariateNormalInto', args: () => [[], mean(), covariance()] },
  { name: 'multivariateNormal', args: () => [mean(), covariance()] },
];

/** 테스트 제목에 쓸 표시 이름을 만든다. 오버로드 구분이 있으면 괄호로 덧붙인다. */
const titleOf = ({ name, variant }: WiringCase): string => (variant === undefined ? name : `${name} (${variant})`);

/** `Random.*`를 이름으로 호출하는 view다. */
const RANDOM = Random as unknown as Callable;

/** `test.each`에 넘기는 `[제목, case]` 행이다. */
const CASE_ROWS = CASES.map((c) => [titleOf(c), c] as const);

/** facade를 이름으로 호출하는 view를 돌려준다. */
const stateApi = (seed: string | number): Callable => createRandomState(seed) as unknown as Callable;

/**
 * 한 case를 facade와 `Random`에서 각각 호출해 반환값과 호출 뒤 인자를 모은다.
 * 두 쪽이 인자 팩토리를 따로 호출하므로 `out`이나 배열을 공유하지 않는다.
 * - override: facade에는 `OVERRIDE_SEED` rng를 넘기고 state seed는 다르게 둔다.
 * - state: facade에는 rng를 생략하고 `Random`에는 같은 seed의 rng를 넘긴다.
 */
function callBoth(
  testCase: WiringCase,
  mode: 'override' | 'state'
): { actual: unknown; expected: unknown; actualArgs: unknown[]; expectedArgs: unknown[] } {
  const actualArgs = testCase.args();
  const expectedArgs = testCase.args();
  if (mode === 'override') {
    // state 내부 seed와 다른 seed를 넘겨 override 우선순위를 구분한다.
    const actual = stateApi(STATE_SEED)[testCase.name](...actualArgs, createRng(OVERRIDE_SEED));
    const expected = RANDOM[testCase.name](...expectedArgs, createRng(OVERRIDE_SEED));
    return { actual, expected, actualArgs, expectedArgs };
  }
  const actual = stateApi(STATE_SEED)[testCase.name](...actualArgs);
  const expected = RANDOM[testCase.name](...expectedArgs, createRng(STATE_SEED));
  return { actual, expected, actualArgs, expectedArgs };
}

describe('createRandomState facade - override rng 경로', () => {
  test.each(CASE_ROWS)('%s은 override rng로 동명 Random 함수와 같은 결과를 만든다', (_title, testCase) => {
    const { actual, expected, actualArgs, expectedArgs } = callBoth(testCase, 'override');
    expect(actual).toEqual(expected);
    // Into 계열과 shuffleInPlace는 호출 뒤 인자(out, items)까지 같아야 한다.
    expect(actualArgs).toEqual(expectedArgs);
  });
});

describe('createRandomState facade - state rng 경로', () => {
  test.each(CASE_ROWS)(
    '%s은 rng를 생략하면 state seed rng로 동명 Random 함수와 같은 결과를 만든다',
    (_title, testCase) => {
      const { actual, expected, actualArgs, expectedArgs } = callBoth(testCase, 'state');
      expect(actual).toEqual(expected);
      expect(actualArgs).toEqual(expectedArgs);
    }
  );
});

describe('createRandomState facade - 표 입력의 변별력', () => {
  test.each(CASE_ROWS)('%s은 override rng와 state rng에서 서로 다른 결과를 만든다', (_title, testCase) => {
    const override = callBoth(testCase, 'override');
    const state = callBoth(testCase, 'state');
    // 반환값과 호출 뒤 인자(out 등)를 함께 본다. Into 계열은 반환값이 true로 같고 out만 다르다.
    // 둘 다 같으면 pick이 override를 무시하는 변이를 이 case가 잡지 못한다.
    expect([override.actual, override.actualArgs]).not.toEqual([state.actual, state.actualArgs]);
  });

  test.each(CASE_ROWS.filter(([, c]) => c.name !== 'bernoulli'))(
    '%s의 입력은 undefined나 false 같은 퇴화 결과를 만들지 않는다',
    (_title, testCase) => {
      const { actual } = callBoth(testCase, 'override');
      expect(actual).not.toBeUndefined();
      expect(actual).not.toBe(false);
    }
  );
});

describe('createRandomState facade - 누락 방지', () => {
  test('표의 키는 중복이 없다', () => {
    const keys = CASES.map((c) => (c.variant === undefined ? c.name : `${c.name}:${c.variant}`));
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('pass-through를 뺀 RandomState 함수 키는 표의 키와 같다', () => {
    const passThrough = new Set<string>(PASS_THROUGH);
    const facadeKeys = Object.entries(createRandomState(STATE_SEED))
      .filter(([, value]) => typeof value === 'function')
      .map(([name]) => name)
      .filter((name) => !passThrough.has(name))
      .sort();
    const tableKeys = [...new Set(CASES.map((c) => c.name))].sort();

    expect(tableKeys).toEqual(facadeKeys);
    expect(tableKeys).toHaveLength(67);
  });

  test.each(PASS_THROUGH)('%s는 Random의 같은 이름 함수를 그대로 노출한다', (name) => {
    expect(stateApi(STATE_SEED)[name]).toBe(RANDOM[name]);
  });
});
