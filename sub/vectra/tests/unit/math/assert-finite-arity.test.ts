/**
 * 고정 인자 finite guard(`assertFinite1`–`assertFinite5`)를 확인하는 테스트.
 *
 * - math, interpolation 두 internal 파일의 helper를 직접 검증한다.
 *   - 정상 값은 통과한다.
 *   - NaN, +Infinity, -Infinity는 인자 위치마다 domain별 메시지의 RangeError를 던진다.
 * - helper를 쓰는 public 함수의 비유한 입력 동작을 회귀로 고정한다.
 *   - math(lerp, clamp, inverseLerp), angle(complement), interpolation(unclampedLerp)
 *   - 6개(springLerp)와 10개(bilerpPointInto) 호출은 helper 조합이라 인자 위치별로 확인한다.
 *   - angle은 math 메시지를 쓰는 cross-domain import라 import 출처 실수도 잡는다.
 */
import { describe, expect, test } from 'vitest';
import { complement } from '../../../src/angle/complement';
import { bilerpPointInto } from '../../../src/interpolation/bilerp-point-into';
import {
  assertFinite1 as interpolationAssertFinite1,
  assertFinite2 as interpolationAssertFinite2,
  assertFinite3 as interpolationAssertFinite3,
  assertFinite4 as interpolationAssertFinite4,
  assertFinite5 as interpolationAssertFinite5,
} from '../../../src/interpolation/interpolation.internal';
import { springLerp } from '../../../src/interpolation/spring-lerp';
import { unclampedLerp } from '../../../src/interpolation/unclamped-lerp';
import { clamp } from '../../../src/math/clamp';
import { inverseLerp } from '../../../src/math/inverse-lerp';
import { lerp } from '../../../src/math/lerp';
import {
  assertFinite1 as mathAssertFinite1,
  assertFinite2 as mathAssertFinite2,
  assertFinite3 as mathAssertFinite3,
  assertFinite4 as mathAssertFinite4,
  assertFinite5 as mathAssertFinite5,
} from '../../../src/math/range.internal';

const MATH_MESSAGE = 'math arguments must be finite numbers';
const INTERPOLATION_MESSAGE = 'interpolation arguments must be finite numbers';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

type FiniteGuard = (...values: number[]) => void;

const domains: ReadonlyArray<{
  name: string;
  message: string;
  guards: readonly FiniteGuard[];
}> = [
  {
    name: 'math',
    message: MATH_MESSAGE,
    guards: [
      mathAssertFinite1,
      mathAssertFinite2,
      mathAssertFinite3,
      mathAssertFinite4,
      mathAssertFinite5,
    ] as FiniteGuard[],
  },
  {
    name: 'interpolation',
    message: INTERPOLATION_MESSAGE,
    guards: [
      interpolationAssertFinite1,
      interpolationAssertFinite2,
      interpolationAssertFinite3,
      interpolationAssertFinite4,
      interpolationAssertFinite5,
    ] as FiniteGuard[],
  },
];

describe.each(domains)('$name 고정 인자 finite guard', ({ message, guards }) => {
  guards.forEach((guard, index) => {
    const arity = index + 1;
    const finiteValues = Array.from({ length: arity }, (_, i) => i - 1.5);

    test(`assertFinite${arity}는 유한한 값이면 예외 없이 반환한다`, () => {
      expect(guard(...finiteValues)).toBeUndefined();
    });

    for (let position = 0; position < arity; position += 1) {
      test(`assertFinite${arity}는 ${position + 1}번째 인자가 NaN, +Infinity, -Infinity이면 RangeError를 던진다`, () => {
        for (const bad of nonFiniteValues) {
          const values = [...finiteValues];
          values[position] = bad;

          expect(() => guard(...values)).toThrow(RangeError);
          expect(() => guard(...values)).toThrow(message);
        }
      });
    }

    test(`assertFinite${arity}는 비유한 값이 여러 개여도 같은 메시지로 던진다`, () => {
      const values = finiteValues.map(() => Number.NaN);

      expect(() => guard(...values)).toThrowError(new RangeError(message));
    });
  });
});

describe('math public 함수의 비유한 입력 회귀', () => {
  test('lerp는 세 인자 위치마다 비유한 값을 math 메시지로 거부한다', () => {
    for (const bad of nonFiniteValues) {
      expect(() => lerp(bad, 1, 0.5)).toThrowError(new RangeError(MATH_MESSAGE));
      expect(() => lerp(0, bad, 0.5)).toThrowError(new RangeError(MATH_MESSAGE));
      expect(() => lerp(0, 1, bad)).toThrowError(new RangeError(MATH_MESSAGE));
    }

    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  test('clamp는 세 인자 위치마다 비유한 값을 math 메시지로 거부한다', () => {
    for (const bad of nonFiniteValues) {
      expect(() => clamp(bad, 0, 10)).toThrowError(new RangeError(MATH_MESSAGE));
      expect(() => clamp(5, bad, 10)).toThrowError(new RangeError(MATH_MESSAGE));
      expect(() => clamp(5, 0, bad)).toThrowError(new RangeError(MATH_MESSAGE));
    }

    expect(clamp(11, 0, 10)).toBe(10);
  });

  test('inverseLerp는 세 인자 위치마다 비유한 값을 math 메시지로 거부한다', () => {
    for (const bad of nonFiniteValues) {
      expect(() => inverseLerp(bad, 10, 5)).toThrowError(new RangeError(MATH_MESSAGE));
      expect(() => inverseLerp(0, bad, 5)).toThrowError(new RangeError(MATH_MESSAGE));
      expect(() => inverseLerp(0, 10, bad)).toThrowError(new RangeError(MATH_MESSAGE));
    }

    expect(inverseLerp(0, 10, 5)).toBe(0.5);
  });
});

describe('angle public 함수의 비유한 입력 회귀', () => {
  test('complement는 비유한 값을 math 메시지로 거부한다', () => {
    for (const bad of nonFiniteValues) {
      expect(() => complement(bad)).toThrowError(new RangeError(MATH_MESSAGE));
    }

    expect(complement(Math.PI / 4)).toBeCloseTo(Math.PI / 4, 12);
  });
});

describe('interpolation public 함수의 비유한 입력 회귀', () => {
  test('unclampedLerp는 세 인자 위치마다 비유한 값을 interpolation 메시지로 거부한다', () => {
    for (const bad of nonFiniteValues) {
      expect(() => unclampedLerp(bad, 1, 0.5)).toThrowError(new RangeError(INTERPOLATION_MESSAGE));
      expect(() => unclampedLerp(0, bad, 0.5)).toThrowError(new RangeError(INTERPOLATION_MESSAGE));
      expect(() => unclampedLerp(0, 1, bad)).toThrowError(new RangeError(INTERPOLATION_MESSAGE));
    }

    expect(unclampedLerp(0, 10, 1.5)).toBe(15);
  });

  test('springLerp는 6개 인자 위치마다 비유한 값을 interpolation 메시지로 거부한다', () => {
    // [current, target, velocity, dt, angularFrequency, dampingRatio]
    const base = [0, 10, 0, 0.016, 12, 1] as const;

    for (let position = 0; position < base.length; position += 1) {
      for (const bad of nonFiniteValues) {
        const [current, target, velocity, dt, angularFrequency, dampingRatio] = base.map((value, i) =>
          i === position ? bad : value
        ) as [number, number, number, number, number, number];

        expect(() => springLerp(current, target, velocity, dt, { angularFrequency, dampingRatio })).toThrowError(
          new RangeError(INTERPOLATION_MESSAGE)
        );
      }
    }

    expect(() => springLerp(0, 10, 0, 0.016)).not.toThrow();
  });

  test('bilerpPointInto는 10개 인자 위치마다 비유한 값을 interpolation 메시지로 거부한다', () => {
    // [x00, y00, x10, y10, x01, y01, x11, y11, tx, ty]
    const base = [0, 0, 10, 0, 0, 10, 10, 10, 0.5, 0.5];

    for (let position = 0; position < base.length; position += 1) {
      for (const bad of nonFiniteValues) {
        const v = base.map((value, i) => (i === position ? bad : value));

        expect(() =>
          bilerpPointInto(
            { x: 0, y: 0 },
            { x: v[0] as number, y: v[1] as number },
            { x: v[2] as number, y: v[3] as number },
            { x: v[4] as number, y: v[5] as number },
            { x: v[6] as number, y: v[7] as number },
            v[8] as number,
            v[9] as number
          )
        ).toThrowError(new RangeError(INTERPOLATION_MESSAGE));
      }
    }

    expect(
      bilerpPointInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, 0.5, 0.5)
    ).toEqual({ x: 5, y: 5 });
  });
});
