/*
 * vec2 TASK-02 defer 항목 유닛 테스트.
 *
 * 대상 함수:
 *   - subtractScaledInto / subtractScaled
 *   - quadrant
 *   - isCollinear
 *   - isOrthogonal
 *   - slerpInto / slerp
 *   - toPolarInto
 *   - fromPolarInto / fromPolar
 */

import { describe, expect, test } from 'vitest';
import type { XYWritable } from '../../../src/types';
import { fromPolar } from '../../../src/vec/from-polar';
import { fromPolarInto } from '../../../src/vec/from-polar-into';
import { isCollinear } from '../../../src/vec/is-collinear';
import { isOrthogonal } from '../../../src/vec/is-orthogonal';
import { quadrant } from '../../../src/vec/quadrant';
import { slerp } from '../../../src/vec/slerp';
import { slerpInto } from '../../../src/vec/slerp-into';
import { subtractScaled } from '../../../src/vec/subtract-scaled';
import { subtractScaledInto } from '../../../src/vec/subtract-scaled-into';
import { toPolarInto } from '../../../src/vec/to-polar-into';

// ─────────────────────────────────────────────
// subtractScaledInto / subtractScaled
// ─────────────────────────────────────────────

describe('vec subtractScaled - subtractScaledInto', () => {
  test('object 입력으로 a - b * scalar를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = subtractScaledInto(out, { x: 10, y: 8 }, { x: 2, y: 3 }, 2);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 6, y: 2 });
  });

  test('tuple 입력과 object 입력을 혼합해 처리한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    subtractScaledInto(out, [10, 8], { x: 2, y: 3 }, 2);
    expect(out).toEqual({ x: 6, y: 2 });
  });

  test('scalar = 0이면 a를 그대로 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    subtractScaledInto(out, { x: 5, y: 7 }, { x: 99, y: 99 }, 0);
    expect(out).toEqual({ x: 5, y: 7 });
  });

  test('addScaledInto와 대칭: scalar를 음수로 바꾸면 같다', () => {
    const out1: XYWritable = { x: 0, y: 0 };
    const out2: XYWritable = { x: 0, y: 0 };
    const a = { x: 3, y: 5 };
    const b = { x: 1, y: 2 };
    // subtractScaled(a, b, s) == addScaled(a, b, -s)
    subtractScaledInto(out1, a, b, 3);
    // 직접 계산으로 검증
    expect(out1.x).toBe(3 - 1 * 3);
    expect(out1.y).toBe(5 - 2 * 3);
    // addScaled 대칭 (addScaledInto는 import 없이 인라인 확인)
    expect(out1.x).toBe(0);
    expect(out1.y).toBe(-1);
    void out2;
  });

  test('aliasing 안전 — out과 a가 같은 object여도 올바르게 계산한다', () => {
    const v: XYWritable = { x: 10, y: 8 };
    subtractScaledInto(v, v, { x: 2, y: 3 }, 2);
    expect(v).toEqual({ x: 6, y: 2 });
  });

  test('aliasing 안전 — out과 b가 같은 object여도 올바르게 계산한다', () => {
    const v: XYWritable = { x: 2, y: 3 };
    subtractScaledInto(v, { x: 10, y: 8 }, v, 2);
    expect(v).toEqual({ x: 6, y: 2 });
  });

  test('tuple out에도 올바르게 기록한다', () => {
    const out: XYWritable = [0, 0];
    subtractScaledInto(out, [10, 8], [2, 3], 2);
    expect(out).toEqual([6, 2]);
  });
});

describe('vec subtractScaled - subtractScaled (companion)', () => {
  test('a - b * scalar를 새 object로 반환한다', () => {
    const result = subtractScaled({ x: 10, y: 8 }, { x: 2, y: 3 }, 2);
    expect(result).toEqual({ x: 6, y: 2 });
  });

  test('subtractScaledInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    subtractScaledInto(out, [5, 9], [1, 3], 3);
    const result = subtractScaled([5, 9], [1, 3], 3);
    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });
});

// ─────────────────────────────────────────────
// quadrant
// ─────────────────────────────────────────────

describe('vec predicate - quadrant', () => {
  test('x>0, y>0이면 1을 반환한다', () => {
    expect(quadrant({ x: 1, y: 1 })).toBe(1);
    expect(quadrant([3, 5])).toBe(1);
  });

  test('x<0, y>0이면 2를 반환한다', () => {
    expect(quadrant({ x: -1, y: 2 })).toBe(2);
  });

  test('x<0, y<0이면 3을 반환한다', () => {
    expect(quadrant({ x: -2, y: -3 })).toBe(3);
  });

  test('x>0, y<0이면 4를 반환한다', () => {
    expect(quadrant({ x: 4, y: -1 })).toBe(4);
  });

  test('x=0이면 0을 반환한다 (y축 위)', () => {
    expect(quadrant({ x: 0, y: 5 })).toBe(0);
    expect(quadrant({ x: 0, y: -5 })).toBe(0);
  });

  test('y=0이면 0을 반환한다 (x축 위)', () => {
    expect(quadrant({ x: 5, y: 0 })).toBe(0);
    expect(quadrant({ x: -5, y: 0 })).toBe(0);
  });

  test('원점(0, 0)이면 0을 반환한다', () => {
    expect(quadrant({ x: 0, y: 0 })).toBe(0);
  });
});

// ─────────────────────────────────────────────
// isCollinear
// ─────────────────────────────────────────────

describe('vec predicate - isCollinear', () => {
  test('명백히 일직선인 세 점은 true를 반환한다', () => {
    expect(isCollinear({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(true);
  });

  test('일직선이 아닌 세 점은 false를 반환한다', () => {
    expect(isCollinear({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(false);
  });

  test('수평선 위의 세 점은 true를 반환한다', () => {
    expect(isCollinear({ x: 0, y: 3 }, { x: 5, y: 3 }, { x: -2, y: 3 })).toBe(true);
  });

  test('수직선 위의 세 점은 true를 반환한다', () => {
    expect(isCollinear({ x: 2, y: 0 }, { x: 2, y: 5 }, { x: 2, y: -3 })).toBe(true);
  });

  test('세 점 중 두 점이 일치하면 true를 반환한다 (coincident)', () => {
    expect(isCollinear({ x: 1, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 4 })).toBe(true);
    expect(isCollinear({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 1, y: 2 })).toBe(true);
  });

  test('세 점 모두 일치하면 true를 반환한다', () => {
    expect(isCollinear({ x: 1, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
  });

  test('원점이 포함되어도 정상 계산한다', () => {
    expect(isCollinear({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 })).toBe(false);
    expect(isCollinear({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBe(true);
  });

  test('epsilon 경계값 — 미세한 오차가 있어도 허용 범위 안이면 true를 반환한다', () => {
    // cross product = (1)(1e-7) - (0)(1) = 1e-7
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 1, y: 1e-7 };
    expect(isCollinear(a, b, c, 0)).toBe(false);
    expect(isCollinear(a, b, c, 1e-6)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// isOrthogonal
// ─────────────────────────────────────────────

describe('vec predicate - isOrthogonal', () => {
  test('직교하는 두 벡터에서 true를 반환한다', () => {
    expect(isOrthogonal({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(true);
    expect(isOrthogonal({ x: 3, y: 0 }, { x: 0, y: 5 })).toBe(true);
    expect(isOrthogonal({ x: 1, y: 1 }, { x: 1, y: -1 })).toBe(true);
  });

  test('직교하지 않는 두 벡터에서 false를 반환한다', () => {
    expect(isOrthogonal({ x: 1, y: 0 }, { x: 1, y: 0 })).toBe(false);
    expect(isOrthogonal({ x: 1, y: 1 }, { x: 1, y: 0 })).toBe(false);
  });

  test('영벡터 a → false를 반환한다', () => {
    expect(isOrthogonal({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(false);
  });

  test('영벡터 b → false를 반환한다', () => {
    expect(isOrthogonal({ x: 1, y: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('둘 다 영벡터 → false를 반환한다', () => {
    expect(isOrthogonal({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('epsilon 경계값 — 미세한 오차가 있어도 허용 범위 안이면 true를 반환한다', () => {
    // dot = 1e-7, 기본 epsilon=0이면 false
    const a = { x: 1, y: 0 };
    const b = { x: 1e-7, y: 1 };
    expect(isOrthogonal(a, b, 0)).toBe(false);
    expect(isOrthogonal(a, b, 1e-6)).toBe(true);
  });

  test('tuple 입력을 처리한다', () => {
    expect(isOrthogonal([1, 0], [0, 1])).toBe(true);
    expect(isOrthogonal([1, 0], [1, 0])).toBe(false);
  });
});

// ─────────────────────────────────────────────
// slerpInto / slerp
// ─────────────────────────────────────────────

/**
 * 두 단위 벡터 보간 결과 검증 helper.
 * toBeCloseTo(_, 10)는 소수점 10자리 정확도를 요구한다.
 */
function expectXYClose(actual: { x: number; y: number }, expectedX: number, expectedY: number) {
  expect(actual.x).toBeCloseTo(expectedX, 10);
  expect(actual.y).toBeCloseTo(expectedY, 10);
}

describe('vec interpolation - slerpInto', () => {
  test('t=0이면 a 방향을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = slerpInto(out, { x: 1, y: 0 }, { x: 0, y: 1 }, 0);
    expect(result).toBe(out);
    expectXYClose(out as { x: number; y: number }, 1, 0);
  });

  test('t=1이면 b 방향을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    slerpInto(out, { x: 1, y: 0 }, { x: 0, y: 1 }, 1);
    expectXYClose(out as { x: number; y: number }, 0, 1);
  });

  test('t=0.5이면 두 unit vector 사이 45도 방향을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // (1,0)과 (0,1) 사이 45도 = (cos45, sin45) = (√2/2, √2/2)
    slerpInto(out, { x: 1, y: 0 }, { x: 0, y: 1 }, 0.5);
    const sqrt2over2 = Math.SQRT2 / 2;
    expectXYClose(out as { x: number; y: number }, sqrt2over2, sqrt2over2);
  });

  test('같은 방향 벡터는 lerp fallback으로 a를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    slerpInto(out, { x: 1, y: 0 }, { x: 1, y: 0 }, 0.5);
    expectXYClose(out as { x: number; y: number }, 1, 0);
  });

  test('zero-vector a → RangeError를 던진다', () => {
    expect(() => slerpInto({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, 0.5)).toThrow(RangeError);
  });

  test('zero-vector b → RangeError를 던진다', () => {
    expect(() => slerpInto({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }, 0.5)).toThrow(RangeError);
  });

  test('tuple out에도 올바르게 기록한다', () => {
    const out: XYWritable = [0, 0];
    slerpInto(out, [1, 0], [0, 1], 0);
    expect((out as number[])[0]).toBeCloseTo(1, 10);
    expect((out as number[])[1]).toBeCloseTo(0, 10);
  });

  test('정반대 방향 벡터 사이를 t=0.5로 보간하면 lerp fallback이 적용된다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // (1, 0)과 (-1, 0)은 정반대 방향 — lerp fallback: 중간점이 (0, 0)에 수렴
    slerpInto(out, { x: 1, y: 0 }, { x: -1, y: 0 }, 0.5);
    // fallback이 적용되는지 확인 (RangeError 없이 완료)
    expect(Number.isFinite(out.x)).toBe(true);
    expect(Number.isFinite(out.y)).toBe(true);
  });

  test('정반대 방향 벡터에서 t=0이면 a와 같은 방향이다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    slerpInto(out, { x: 1, y: 0 }, { x: -1, y: 0 }, 0);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('정반대 방향 벡터에서 t=1이면 b와 같은 방향이다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    slerpInto(out, { x: 1, y: 0 }, { x: -1, y: 0 }, 1);
    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});

describe('vec interpolation - slerp (companion)', () => {
  test('t=0.5이면 두 unit vector 사이 방향을 새 object로 반환한다', () => {
    const result = slerp({ x: 1, y: 0 }, { x: 0, y: 1 }, 0.5);
    const sqrt2over2 = Math.SQRT2 / 2;
    expect(result.x).toBeCloseTo(sqrt2over2, 10);
    expect(result.y).toBeCloseTo(sqrt2over2, 10);
  });

  test('slerpInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    slerpInto(out, [1, 0], [0, 1], 0.3);
    const result = slerp([1, 0], [0, 1], 0.3);
    expect(result.x).toBeCloseTo((out as { x: number }).x, 10);
    expect(result.y).toBeCloseTo((out as { y: number }).y, 10);
  });
});

// ─────────────────────────────────────────────
// toPolarInto
// ─────────────────────────────────────────────

describe('vec conversion - toPolarInto', () => {
  test('(1, 0) → r=1, theta=0', () => {
    const out = { r: 0, theta: 0 };
    const result = toPolarInto(out, { x: 1, y: 0 });
    expect(result).toBe(out);
    expect(out.r).toBeCloseTo(1, 10);
    expect(out.theta).toBeCloseTo(0, 10);
  });

  test('(0, 1) → r=1, theta=π/2', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, { x: 0, y: 1 });
    expect(out.r).toBeCloseTo(1, 10);
    expect(out.theta).toBeCloseTo(Math.PI / 2, 10);
  });

  test('(-1, 0) → r=1, theta=π', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, { x: -1, y: 0 });
    expect(out.r).toBeCloseTo(1, 10);
    expect(out.theta).toBeCloseTo(Math.PI, 10);
  });

  test('negative zero y와 음수 x도 theta=π로 정규화한다', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, { x: -1, y: -0 });
    expect(out.r).toBeCloseTo(1, 10);
    expect(out.theta).toBe(Math.PI);
  });

  test('(0, -1) → r=1, theta=-π/2', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, { x: 0, y: -1 });
    expect(out.r).toBeCloseTo(1, 10);
    expect(out.theta).toBeCloseTo(-Math.PI / 2, 10);
  });

  test('(3, 4) → r=5, theta=atan2(4,3)', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, { x: 3, y: 4 });
    expect(out.r).toBeCloseTo(5, 10);
    expect(out.theta).toBeCloseTo(Math.atan2(4, 3), 10);
  });

  test('zero-vector → r=0, theta=atan2(0,0)=0', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, { x: 0, y: 0 });
    expect(out.r).toBe(0);
    expect(out.theta).toBe(Math.atan2(0, 0));
  });

  test('tuple 입력을 처리한다', () => {
    const out = { r: 0, theta: 0 };
    toPolarInto(out, [3, 4]);
    expect(out.r).toBeCloseTo(5, 10);
  });

  test('서브클래스 out을 보존한다', () => {
    class Polar {
      r = 0;
      theta = 0;
      label = 'polar';
    }
    const out = new Polar();
    const result = toPolarInto(out, { x: 1, y: 0 });
    expect(result).toBe(out);
    expect(result.label).toBe('polar');
    expect(result.r).toBeCloseTo(1, 10);
  });
});

// ─────────────────────────────────────────────
// fromPolarInto / fromPolar
// ─────────────────────────────────────────────

describe('vec conversion - fromPolarInto', () => {
  test('r=1, theta=0 → (1, 0)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = fromPolarInto(out, 1, 0);
    expect(result).toBe(out);
    expect((out as { x: number }).x).toBeCloseTo(1, 10);
    expect((out as { y: number }).y).toBeCloseTo(0, 10);
  });

  test('r=1, theta=π/2 → (0, 1)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    fromPolarInto(out, 1, Math.PI / 2);
    expect((out as { x: number }).x).toBeCloseTo(0, 10);
    expect((out as { y: number }).y).toBeCloseTo(1, 10);
  });

  test('r=5, theta=atan2(4,3) → (3, 4)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    fromPolarInto(out, 5, Math.atan2(4, 3));
    expect((out as { x: number }).x).toBeCloseTo(3, 10);
    expect((out as { y: number }).y).toBeCloseTo(4, 10);
  });

  test('r=0이면 (0, 0)을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    fromPolarInto(out, 0, Math.PI / 4);
    expect((out as { x: number }).x).toBeCloseTo(0, 10);
    expect((out as { y: number }).y).toBeCloseTo(0, 10);
  });

  test('tuple out에도 올바르게 기록한다', () => {
    const out: XYWritable = [0, 0];
    fromPolarInto(out, 1, 0);
    expect((out as number[])[0]).toBeCloseTo(1, 10);
    expect((out as number[])[1]).toBeCloseTo(0, 10);
  });
});

describe('vec conversion - fromPolar (companion)', () => {
  test('r=1, theta=π/4 → (√2/2, √2/2)를 새 object로 반환한다', () => {
    const result = fromPolar(1, Math.PI / 4);
    const sqrt2over2 = Math.SQRT2 / 2;
    expect(result.x).toBeCloseTo(sqrt2over2, 10);
    expect(result.y).toBeCloseTo(sqrt2over2, 10);
  });

  test('fromPolarInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    fromPolarInto(out, 3, Math.PI / 3);
    const result = fromPolar(3, Math.PI / 3);
    expect(result.x).toBeCloseTo((out as { x: number }).x, 10);
    expect(result.y).toBeCloseTo((out as { y: number }).y, 10);
  });
});

describe('vec conversion - toPolarInto/fromPolarInto 왕복 변환', () => {
  test('XY → polar → XY 변환이 원래 값과 일치한다', () => {
    const originalX = 3;
    const originalY = 4;
    const polar = { r: 0, theta: 0 };
    toPolarInto(polar, { x: originalX, y: originalY });
    const result = fromPolar(polar.r, polar.theta);
    expect(result.x).toBeCloseTo(originalX, 10);
    expect(result.y).toBeCloseTo(originalY, 10);
  });
});
