import { describe, expect, expectTypeOf, test } from 'vitest';
import { infiniteLineAngleBetween } from '../../../src/infinite-line/infinite-line-angle-between';
import { infiniteLineFrom } from '../../../src/infinite-line/infinite-line-from';
import { infiniteLineParallelDistance } from '../../../src/infinite-line/infinite-line-parallel-distance';
import { isCollinear } from '../../../src/infinite-line/is-collinear';
import { isParallel } from '../../../src/infinite-line/is-parallel';
import { principalAngle } from '../../../src/infinite-line/principal-angle';
import { singleIntersection } from '../../../src/infinite-line/single-intersection';
import { singleIntersectionInto } from '../../../src/infinite-line/single-intersection-into';
import type { XYObjectWritable } from '../../../src/types';

// 테스트 편의 헬퍼: 수평선 y=0 (origin 다름)
const horizA = infiniteLineFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
// 수평선 y=1 (평행 disjoint)
const horizB = infiniteLineFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
// 수직선 x=0
const vertA = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: 1 });
// collinear (같은 직선, origin만 다름)
const horizC = infiniteLineFrom({ x: 5, y: 0 }, { x: 1, y: 0 });
// degenerate (방향 벡터 = 0)
const degA = infiniteLineFrom({ x: 1, y: 2 }, { x: 0, y: 0 });
const degB = infiniteLineFrom({ x: 1, y: 2 }, { x: 0, y: 0 });
const degC = infiniteLineFrom({ x: 3, y: 4 }, { x: 0, y: 0 });

// ─────────────────────────────────────────────
// isParallel
// ─────────────────────────────────────────────
describe('isParallel', () => {
  test('같은 방향 평행 직선 → true', () => {
    expect(isParallel(horizA, horizB)).toBe(true);
  });

  test('수직 직선 → false', () => {
    expect(isParallel(horizA, vertA)).toBe(false);
  });

  test('collinear(같은 직선)도 평행 → true', () => {
    expect(isParallel(horizA, horizC)).toBe(true);
  });

  test('반대 방향 벡터도 평행 → true', () => {
    const rev = infiniteLineFrom({ x: 0, y: 0 }, { x: -1, y: 0 });
    expect(isParallel(horizA, rev)).toBe(true);
  });

  test('degenerate input(direction=0) → cross=0 → true', () => {
    expect(isParallel(degA, horizA)).toBe(true);
    expect(isParallel(horizA, degA)).toBe(true);
    expect(isParallel(degA, degB)).toBe(true);
  });

  test('epsilon 경계: cross가 딱 epsilon이면 true', () => {
    // da=(1,0), db=(0,epsilon): cross = 1*epsilon - 0*0 = epsilon
    const lA = infiniteLineFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const lB = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: 1e-9 });
    expect(isParallel(lA, lB, 1e-9)).toBe(true);
  });

  test('epsilon 경계: cross가 epsilon을 초과하면 false', () => {
    const lA = infiniteLineFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const lB = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: 2e-9 });
    expect(isParallel(lA, lB, 1e-9)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// isCollinear
// ─────────────────────────────────────────────
describe('isCollinear', () => {
  test('같은 직선 위 두 line → true', () => {
    expect(isCollinear(horizA, horizC)).toBe(true);
  });

  test('평행 disjoint → false', () => {
    expect(isCollinear(horizA, horizB)).toBe(false);
  });

  test('수직 → false (non-parallel)', () => {
    expect(isCollinear(horizA, vertA)).toBe(false);
  });

  test('degenerate a, a.origin이 b 위 → true', () => {
    // degA origin=(1,2), horizA는 y=0 직선 → origin이 직선 밖
    expect(isCollinear(degA, horizA)).toBe(false);
    // a.origin이 b 직선(y=0) 위에 있는 경우
    const degOnHoriz = infiniteLineFrom({ x: 3, y: 0 }, { x: 0, y: 0 });
    expect(isCollinear(degOnHoriz, horizA)).toBe(true);
  });

  test('degenerate a, a.origin이 b 위 아님 → false', () => {
    expect(isCollinear(degA, horizA)).toBe(false);
  });

  test('degenerate b, b.origin이 a 위 → true', () => {
    const degOnHoriz = infiniteLineFrom({ x: 7, y: 0 }, { x: 0, y: 0 });
    expect(isCollinear(horizA, degOnHoriz)).toBe(true);
  });

  test('양쪽 degenerate — origin 일치 → true', () => {
    expect(isCollinear(degA, degB)).toBe(true);
  });

  test('양쪽 degenerate — origin 불일치 → false', () => {
    expect(isCollinear(degA, degC)).toBe(false);
  });

  test('epsilon 적용: origin이 epsilon 거리 이내이면 true', () => {
    const lA = infiniteLineFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    // b.origin이 y=5e-10으로 아주 가깝게 평행
    const lB = infiniteLineFrom({ x: 0, y: 5e-10 }, { x: 1, y: 0 });
    expect(isCollinear(lA, lB, 1e-9)).toBe(true);
    expect(isCollinear(lA, lB, 1e-12)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// singleIntersectionInto
// ─────────────────────────────────────────────
describe('singleIntersectionInto', () => {
  test('non-parallel 교점 기록 + true 반환', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    // horizA: y=0, origin=(0,0), dir=(1,0)
    // vertA: x=0, origin=(0,0), dir=(0,1)
    const result = singleIntersectionInto(out, horizA, vertA);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('일반 교차: (0,2)+(1,0) vs (2,0)+(0,1) → 교점 (2,2)', () => {
    const a = infiniteLineFrom({ x: 0, y: 2 }, { x: 1, y: 0 });
    const b = infiniteLineFrom({ x: 2, y: 0 }, { x: 0, y: 1 });
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, a, b)).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(2);
  });

  test('parallel disjoint → false, out 미수정', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(singleIntersectionInto(out, horizA, horizB)).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('collinear → false, out 미수정', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(singleIntersectionInto(out, horizA, horizC)).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('degenerate a, a.origin이 b 위 → true, a.origin 기록', () => {
    const degOnHoriz = infiniteLineFrom({ x: 3, y: 0 }, { x: 0, y: 0 });
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, degOnHoriz, horizA)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('degenerate a, a.origin이 b 위 아님 → false', () => {
    // degA origin=(1,2)는 horizA(y=0) 위에 없음
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, degA, horizA)).toBe(false);
  });

  test('degenerate b, b.origin이 a 위 → true, b.origin 기록', () => {
    const degOnHoriz = infiniteLineFrom({ x: 5, y: 0 }, { x: 0, y: 0 });
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, horizA, degOnHoriz)).toBe(true);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('양쪽 degenerate — origin 일치 → true, origin 기록', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, degA, degB)).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(2);
  });

  test('양쪽 degenerate — origin 불일치 → false', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    expect(singleIntersectionInto(out, degA, degC)).toBe(false);
  });

  test('반환 타입이 boolean', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    expectTypeOf(singleIntersectionInto(out, horizA, vertA)).toBeBoolean();
  });
});

// ─────────────────────────────────────────────
// singleIntersection (companion)
// ─────────────────────────────────────────────
describe('singleIntersection (companion)', () => {
  test('교점 있으면 { x, y } 반환', () => {
    const pt = singleIntersection(horizA, vertA);
    expect(pt).toBeDefined();
    expect(pt?.x).toBeCloseTo(0);
    expect(pt?.y).toBeCloseTo(0);
  });

  test('교점 없으면 undefined 반환', () => {
    expect(singleIntersection(horizA, horizB)).toBeUndefined();
  });

  test('collinear → undefined', () => {
    expect(singleIntersection(horizA, horizC)).toBeUndefined();
  });

  test('반환 타입이 XYObjectWritable | undefined', () => {
    expectTypeOf(singleIntersection(horizA, vertA)).toEqualTypeOf<XYObjectWritable | undefined>();
  });

  test('epsilon 인자 전달 시 동작', () => {
    // 매우 큰 epsilon으로 모든 것을 parallel로 처리 → collinear/parallel 분기
    const pt = singleIntersection(horizA, vertA, 1e10);
    // cross = 1*1 - 0*0 = 1, 1e10보다 작으므로 parallel 처리 → false
    expect(pt).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// principalAngle
// ─────────────────────────────────────────────
describe('principalAngle', () => {
  test('0 → 0', () => {
    expect(principalAngle(0)).toBe(0);
  });

  test('π → 0 (무방향 동치)', () => {
    expect(principalAngle(Math.PI)).toBe(0);
  });

  test('-π → 0', () => {
    expect(principalAngle(-Math.PI)).toBe(0);
  });

  test('2π → 0', () => {
    expect(principalAngle(2 * Math.PI)).toBe(0);
  });

  test('-π/4 → 3π/4', () => {
    expect(principalAngle(-Math.PI / 4)).toBeCloseTo((3 * Math.PI) / 4, 12);
  });

  test('3π/2 → π/2', () => {
    expect(principalAngle((3 * Math.PI) / 2)).toBeCloseTo(Math.PI / 2, 12);
  });

  test('결과는 [0, π) 범위이다', () => {
    for (const a of [-10, -3.3, -1, 0.2, 1, 2.9, 7, 100]) {
      const result = principalAngle(a);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(Math.PI);
    }
  });

  test('Infinity → NaN', () => {
    expect(principalAngle(Infinity)).toBeNaN();
  });

  test('-Infinity → NaN', () => {
    expect(principalAngle(-Infinity)).toBeNaN();
  });

  test('NaN → NaN', () => {
    expect(principalAngle(NaN)).toBeNaN();
  });
});

// ─────────────────────────────────────────────
// infiniteLineAngleBetween
// ─────────────────────────────────────────────
describe('infiniteLineAngleBetween', () => {
  test('수평 vs 수평 → 0', () => {
    expect(infiniteLineAngleBetween(horizA, horizB)).toBe(0);
  });

  test('수평 vs 반대 방향 수평 → 0 (방향 부호 무시)', () => {
    const rev = infiniteLineFrom({ x: 0, y: 0 }, { x: -1, y: 0 });
    expect(infiniteLineAngleBetween(horizA, rev)).toBe(0);
  });

  test('수평 vs 수직 → π/2', () => {
    expect(infiniteLineAngleBetween(horizA, vertA)).toBeCloseTo(Math.PI / 2, 12);
  });

  test('45도 대각 vs 수평 → π/4', () => {
    const diag = infiniteLineFrom({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(infiniteLineAngleBetween(diag, horizA)).toBeCloseTo(Math.PI / 4, 12);
  });

  test('non-normalized direction도 정확하다', () => {
    const longHoriz = infiniteLineFrom({ x: 0, y: 0 }, { x: 7, y: 0 });
    const longVert = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: 4 });
    expect(infiniteLineAngleBetween(longHoriz, longVert)).toBeCloseTo(Math.PI / 2, 12);
  });

  test('zero direction → NaN', () => {
    expect(infiniteLineAngleBetween(degA, horizA)).toBeNaN();
  });

  test('non-finite direction → NaN', () => {
    const nan = infiniteLineFrom({ x: 0, y: 0 }, { x: Infinity, y: 0 });
    expect(infiniteLineAngleBetween(nan, horizA)).toBeNaN();
  });

  test('b 위치 non-finite direction → NaN', () => {
    const nan = infiniteLineFrom({ x: 0, y: 0 }, { x: 0, y: Infinity });
    expect(infiniteLineAngleBetween(horizA, nan)).toBeNaN();
  });
});

// ─────────────────────────────────────────────
// infiniteLineParallelDistance
// ─────────────────────────────────────────────
describe('infiniteLineParallelDistance', () => {
  test('y=0 vs y=3 평행선 → 3', () => {
    const y3 = infiniteLineFrom({ x: 0, y: 3 }, { x: 1, y: 0 });
    expect(infiniteLineParallelDistance(horizA, y3)).toBe(3);
  });

  test('collinear → 0', () => {
    expect(infiniteLineParallelDistance(horizA, horizC)).toBe(0);
  });

  test('평행하지 않으면 NaN', () => {
    expect(Number.isNaN(infiniteLineParallelDistance(horizA, vertA))).toBe(true);
  });

  test('a만 degenerate → a.origin과 b line 사이 거리', () => {
    // a degenerate origin (1,2), b 수평선 y=0 → 거리 2
    const a = infiniteLineFrom({ x: 1, y: 2 }, { x: 0, y: 0 });
    expect(infiniteLineParallelDistance(a, horizA)).toBe(2);
  });

  test('b만 degenerate → b.origin과 a line 사이 거리', () => {
    const b = infiniteLineFrom({ x: 1, y: 2 }, { x: 0, y: 0 });
    expect(infiniteLineParallelDistance(horizA, b)).toBe(2);
  });

  test('양쪽 degenerate → 두 origin 사이 거리', () => {
    // (1,2) vs (3,4) → hypot(2,2) = 2√2
    expect(infiniteLineParallelDistance(degA, degC)).toBeCloseTo(Math.SQRT2 * 2, 12);
  });

  test('non-finite origin → NaN', () => {
    const bad = infiniteLineFrom({ x: Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isNaN(infiniteLineParallelDistance(bad, horizA))).toBe(true);
  });

  test('non-finite direction → NaN', () => {
    const bad = infiniteLineFrom({ x: 0, y: 5 }, { x: Infinity, y: 0 });
    expect(Number.isNaN(infiniteLineParallelDistance(bad, horizA))).toBe(true);
  });

  test('b 위치 non-finite origin → NaN', () => {
    const bad = infiniteLineFrom({ x: -Infinity, y: 0 }, { x: 1, y: 0 });
    expect(Number.isNaN(infiniteLineParallelDistance(horizA, bad))).toBe(true);
  });

  test('b 위치 non-finite direction → NaN', () => {
    const bad = infiniteLineFrom({ x: 0, y: 5 }, { x: 0, y: Infinity });
    expect(Number.isNaN(infiniteLineParallelDistance(horizA, bad))).toBe(true);
  });
});
