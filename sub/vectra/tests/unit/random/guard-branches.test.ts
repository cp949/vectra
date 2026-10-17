/**
 * random의 경계·overflow·사용자 정의 rng 분기 테스트.
 *
 * 검증 항목:
 *  1. gamma 계열(`gamma`, `dirichletInto`)의 overflow와 `-0` 정리.
 *  2. Marsaglia-Tsang의 정확한 acceptance 경로.
 *  3. `int` 범위 초과, `multivariateNormalInto`의 타입·non-finite·`-0` 처리.
 *  4. `pointInPolygonInto`의 너비 0 polygon.
 *  5. 가중 선택 함수가 rng가 1 이상을 돌려줄 때 마지막 양수 항목을 고른다.
 *  6. `weightedSegmentOffset`의 boundary nudge.
 *
 * 설계 메모:
 *  - `RandomSource`의 반환값은 clamp하지 않는다. 그래서 1, NaN, -0을 돌려주는 rng를 쓸 수 있다.
 */
import { describe, expect, test } from 'vitest';
import { dirichletInto } from '../../../src/random/dirichlet-into';
import { gamma } from '../../../src/random/gamma';
import { int } from '../../../src/random/int';
import { multivariateNormalInto } from '../../../src/random/multivariate-normal-into';
import { pointInPolygonInto } from '../../../src/random/point-in-polygon-into';
import { weightedChoice } from '../../../src/random/weighted-choice';
import { weightedSegmentOffset } from '../../../src/random/weighted-geometry.internal';
import { weightedRandomIndex } from '../../../src/random/weighted-random-index';

/**
 * 주어진 값을 차례로 돌려주는 rng를 만든다.
 * 값이 모자라면 예외를 던져 소비 횟수가 예상과 다른 경우를 드러낸다.
 */
function sequence(values: readonly number[]): () => number {
  let index = 0;
  return () => {
    if (index >= values.length) throw new Error('rng 값이 모자란다');
    return values[index++] as number;
  };
}

/** Marsaglia-Tsang가 첫 시도에서 곧바로 accept하는 rng 값 세 개. x ≈ 0, u = 0.5이다. */
const ACCEPT_AT_ONCE = [0.5, 0.25, 0.5] as const;

describe('gamma overflow', () => {
  test('gamma는 결과가 overflow하면 RangeError를 던진다', () => {
    expect(() => gamma(10, 1e308, sequence(ACCEPT_AT_ONCE))).toThrow(/non-finite/);
  });

  test('dirichletInto는 gamma 합이 0이면 RangeError를 던진다', () => {
    // shape가 매우 작으면 u ** (1 / shape)가 0이 되어 sample이 0이다.
    expect(() => dirichletInto([], [1e-300], sequence([...ACCEPT_AT_ONCE, 0.5]))).toThrow(/gamma 합/);
  });

  test('dirichletInto는 gamma 합이 overflow하면 RangeError를 던진다', () => {
    expect(() => dirichletInto([], [1e308, 1e308], sequence([...ACCEPT_AT_ONCE, ...ACCEPT_AT_ONCE]))).toThrow(
      /gamma 합/
    );
  });

  test('dirichletInto는 sample이 -0이어도 결과를 +0으로 정리한다', () => {
    // alpha 1/3은 boost 변환으로 u ** 3을 곱한다. rng가 -0을 돌려주면 sample이 -0이다.
    const out = dirichletInto([], [1 / 3, 1], sequence([...ACCEPT_AT_ONCE, -0, ...ACCEPT_AT_ONCE]));
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(1);
  });
});

describe('Marsaglia-Tsang 정확한 acceptance', () => {
  test('빠른 squeeze를 통과하지 못해도 로그 비교로 accept한다', () => {
    // u1 = exp(-4.5), u2 = 0이면 x = 3이다. x가 커서 squeeze 조건 `u < 1 - 0.0331 x^4`가 거짓이다.
    const u1 = Math.exp(-4.5);
    const shape = 2;
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    const expected = d * (1 + c * 3) ** 3;
    expect(gamma(shape, 1, sequence([u1, 0, 0.3]))).toBeCloseTo(expected, 9);
  });
});

describe('int 범위', () => {
  test('값 개수가 2^32를 넘으면 RangeError를 던진다', () => {
    expect(() => int(0, 2 ** 32)).toThrow(RangeError);
    // rng를 넘기면 별도 경로로 뽑으므로 범위 검사가 따로 필요하다.
    expect(() => int(0, 2 ** 33, () => 0)).toThrow(RangeError);
    expect(int(0, 2 ** 32 - 1, () => 0)).toBe(0);
  });
});

describe('multivariateNormalInto', () => {
  test('mean이 array가 아니면 TypeError를 던진다', () => {
    expect(() => multivariateNormalInto([], 1 as never, [[1]])).toThrow(TypeError);
  });

  test('covariance가 array가 아니면 TypeError를 던진다', () => {
    expect(() => multivariateNormalInto([], [0], 1 as never)).toThrow(TypeError);
  });

  test('rng가 NaN을 돌려주면 결과 entry가 non-finite라 RangeError를 던진다', () => {
    expect(() => multivariateNormalInto([], [0], [[1]], () => Number.NaN)).toThrow(/non-finite/);
  });

  test('결과가 -0이면 +0으로 정리한다', () => {
    // u1 = 1이면 sqrt(-2 ln 1) = -0이라 z = -0이다. mean이 -0이라 합도 -0이다.
    const out = multivariateNormalInto([], [-0], [[1]], sequence([1, 0]));
    expect(out[0]).toBe(0);
  });
});

describe('pointInPolygonInto 너비 0', () => {
  test('모든 꼭짓점의 x가 같으면 반올림으로 면적이 0이 아니어도 false를 돌려주고 rng를 쓰지 않는다', () => {
    // x가 모두 0.1이라 수학적으로 면적이 0이지만 shoelace 합이 -3.47e-18로 남는다.
    const polygon = [
      { x: 0.1, y: 0.5702449908813797 },
      { x: 0.1, y: 0.17794863347304668 },
      { x: 0.1, y: 0.1889123377209847 },
    ];
    const out = { x: 7, y: 7 };
    expect(
      pointInPolygonInto(out, polygon, () => {
        throw new Error('rng를 쓰면 안 된다');
      })
    ).toBe(false);
    expect(out).toEqual({ x: 7, y: 7 });
  });
});

describe('가중 선택의 마지막 양수 항목 보정', () => {
  test('weightedChoice는 rng가 1이면 마지막 양수 가중치 항목을 고른다', () => {
    expect(weightedChoice(['a', 'b', 'c'], [1, 2, 0], () => 1)).toBe('b');
  });

  test('weightedRandomIndex는 rng가 1이면 마지막 양수 가중치 index를 고른다', () => {
    expect(weightedRandomIndex([1, 2, 0], () => 1)).toBe(1);
  });
});

describe('weightedSegmentOffset boundary nudge', () => {
  test('앞 segment 길이가 모두 0이면 0 다음 representable 수를 돌려준다', () => {
    // 첫 segment는 길이 0이라 effective 0이다. rng 0은 둘째 segment 시작 경계에 정확히 닿는다.
    const offset = weightedSegmentOffset([0, 5], [1, 1], () => 0, 'test', true);
    expect(offset).toBe(Number.MIN_VALUE);
  });

  test('앞 segment 누적 길이의 하위 비트가 모두 1이면 올림이 상위 비트로 번진다', () => {
    // 2 - 2^-52는 하위 32비트가 0xffffffff다. 다음 representable 수는 2다.
    const x = 2 - 2 ** -52;
    expect(weightedSegmentOffset([x, x], [1, 1], () => 0.5, 'test', true)).toBe(2);
  });
});
