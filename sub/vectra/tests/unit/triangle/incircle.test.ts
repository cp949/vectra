/**
 * triangle inscribed circle 단위 테스트.
 *
 * incenter / incenterInto / incircle / incircleInto의 정확도, degenerate 처리,
 * output 계약을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { incenter } from '../../../src/triangle/incenter';
import { incenterInto } from '../../../src/triangle/incenter-into';
import { incircle } from '../../../src/triangle/incircle';
import { incircleInto } from '../../../src/triangle/incircle-into';

/** 3-4-5 직각삼각형: a(0,0) b(3,0) c(0,4) — CCW */
const right345 = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };

/** 변이 1인 정삼각형 */
const equilateral = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 0 },
  c: { x: 0.5, y: Math.sqrt(3) / 2 },
};

/** collinear(degenerate) triangle */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

/** 한 점으로 수렴(all same vertex) */
const point = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } };

describe('incenterInto', () => {
  test('3-4-5 직각삼각형: 내심을 계산해 out에 기록하고 out을 반환한다', () => {
    // 내심 좌표: inradius = area/semiperimeter = 6/6 = 1
    // 내심 x = (a*ax + b*bx + c*cx)/perimeter
    // a=BC=5, b=CA=4, c=AB=3
    // ix = (5*0 + 4*3 + 3*0)/12 = 12/12 = 1
    // iy = (5*0 + 4*0 + 3*4)/12 = 12/12 = 1
    const out = { x: 0, y: 0 };
    const result = incenterInto(out, right345);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('정삼각형: 내심은 centroid와 같다', () => {
    const out = { x: 0, y: 0 };
    const result = incenterInto(out, equilateral);
    expect(result).not.toBe(false);
    if (result !== false) {
      expect(result.x).toBeCloseTo((0 + 1 + 0.5) / 3, 8);
    }
  });

  test('point triangle(perimeter=0): false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const result = incenterInto(out, point);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('내심은 세 변에서 등거리다', () => {
    const out = { x: 0, y: 0 };
    incenterInto(out, right345);
    // 3-4-5: inradius = 1, 내심(1,1)에서 각 변까지 거리 = 1
    // AB(y=0)까지 거리: out.y = 1
    expect(out.y).toBeCloseTo(1, 10);
    // AC(x=0)까지 거리: out.x = 1
    expect(out.x).toBeCloseTo(1, 10);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    const out = { x: 0, y: 0 };
    const result = incenterInto(out, t);
    expect(result).not.toBe(false);
    if (result !== false) {
      expect(result.x).toBeCloseTo(1, 10);
      expect(result.y).toBeCloseTo(1, 10);
    }
  });
});

describe('incenter', () => {
  test('3-4-5 직각삼각형: 내심을 반환한다', () => {
    const result = incenter(right345);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(1, 10);
    expect(result?.y).toBeCloseTo(1, 10);
  });

  test('point triangle: undefined를 반환한다', () => {
    expect(incenter(point)).toBeUndefined();
  });
});

describe('incircleInto', () => {
  test('3-4-5 직각삼각형: 내접원 반지름이 1이다', () => {
    // inradius = area/semiperimeter = 6/6 = 1
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    const result = incircleInto(out, right345);
    expect(result).toBe(out);
    expect(out.radius).toBeCloseTo(1, 10);
    expect(out.center.x).toBeCloseTo(1, 10);
    expect(out.center.y).toBeCloseTo(1, 10);
  });

  test('point triangle(perimeter=0): false를 반환하고 out을 수정하지 않는다', () => {
    const out = { center: { x: 99, y: 99 }, radius: 99 };
    const result = incircleInto(out, point);
    expect(result).toBe(false);
    expect(out.center.x).toBe(99);
    expect(out.radius).toBe(99);
  });

  test('collinear triangle: 넓이=0이므로 반지름은 0이다', () => {
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    // collinear는 perimeter > 0 이므로 false가 아님. 반지름만 0
    const result = incircleInto(out, collinear);
    expect(result).not.toBe(false);
    if (result !== false) {
      expect(result.radius).toBe(0);
    }
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    const result = incircleInto(out, t);
    expect(result).not.toBe(false);
    if (result !== false) {
      expect(result.radius).toBeCloseTo(1, 10);
    }
  });
});

describe('incircle', () => {
  test('3-4-5 직각삼각형: 내접원을 반환한다', () => {
    const result = incircle(right345);
    expect(result).not.toBeUndefined();
    expect(result?.radius).toBeCloseTo(1, 10);
  });

  test('point triangle: undefined를 반환한다', () => {
    expect(incircle(point)).toBeUndefined();
  });
});
