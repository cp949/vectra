/**
 * triangle radius scalar helper 단위 테스트.
 *
 * inradius / circumradius의 정확도, degenerate 처리, circle helper radius 계약과의
 * 일치, tuple/object input, non-finite 전파를 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { circumcircle } from '../../../src/triangle/circumcircle';
import { circumradius } from '../../../src/triangle/circumradius';
import { incircle } from '../../../src/triangle/incircle';
import { inradius } from '../../../src/triangle/inradius';

/** 3-4-5 직각삼각형: a(0,0) b(3,0) c(0,4) — CCW */
const right345 = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };

/** 변이 1인 정삼각형 */
const equilateral = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 0 },
  c: { x: 0.5, y: Math.sqrt(3) / 2 },
};

/** collinear(degenerate) triangle, perimeter > 0 */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

/** 한 점으로 수렴(perimeter = 0) */
const point = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } };

/** right345의 winding을 뒤집은 CW 버전 — 반지름은 orientation과 무관하게 같다 */
const right345Cw = { a: { x: 0, y: 0 }, b: { x: 0, y: 4 }, c: { x: 3, y: 0 } };

describe('inradius', () => {
  test('3-4-5 직각삼각형: 내접원 반지름은 1이다', () => {
    expect(inradius(right345)).toBeCloseTo(1, 10);
  });

  test('정삼각형: 내접원 반지름은 side * sqrt(3) / 6이다', () => {
    expect(inradius(equilateral)).toBeCloseTo(Math.sqrt(3) / 6, 10);
  });

  test('collinear triangle(perimeter > 0): 넓이=0이므로 0을 반환한다', () => {
    expect(inradius(collinear)).toBe(0);
  });

  test('point triangle(perimeter = 0): undefined를 반환한다', () => {
    expect(inradius(point)).toBeUndefined();
  });

  test('tuple input과 object input이 같은 값을 낸다', () => {
    const tuple = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    expect(inradius(tuple)).toBe(inradius(right345));
  });

  test('incircle(triangle)?.radius와 같은 값을 반환한다', () => {
    expect(inradius(right345)).toBe(incircle(right345)?.radius);
    expect(inradius(equilateral)).toBe(incircle(equilateral)?.radius);
    expect(inradius(collinear)).toBe(incircle(collinear)?.radius);
  });

  test('CW orientation: 반지름은 winding과 무관하게 CCW와 같다', () => {
    expect(inradius(right345Cw)).toBe(inradius(right345));
  });

  test('non-finite vertex(NaN, Infinity, -Infinity): incircle radius와 같은 결과를 낸다', () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const t = { a: { x: bad, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };
      const r = inradius(t);
      const helperRadius = incircle(t)?.radius;
      // incircle은 perimeter !== 0이므로 NaN radius를 가진 circle을 반환한다.
      expect(Number.isNaN(r)).toBe(true);
      expect(Number.isNaN(helperRadius)).toBe(true);
    }
  });
});

describe('circumradius', () => {
  test('3-4-5 직각삼각형: 외접원 반지름은 2.5다', () => {
    expect(circumradius(right345)).toBeCloseTo(2.5, 10);
  });

  test('정삼각형: 외접원 반지름은 side / sqrt(3)이다', () => {
    expect(circumradius(equilateral)).toBeCloseTo(1 / Math.sqrt(3), 10);
  });

  test('collinear triangle: degenerate이므로 undefined를 반환한다', () => {
    expect(circumradius(collinear)).toBeUndefined();
  });

  test('point triangle: undefined를 반환한다', () => {
    expect(circumradius(point)).toBeUndefined();
  });

  test('tuple input과 object input이 같은 값을 낸다', () => {
    const tuple = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    expect(circumradius(tuple)).toBe(circumradius(right345));
  });

  test('circumcircle(triangle)?.radius와 같은 값을 반환한다', () => {
    expect(circumradius(right345)).toBe(circumcircle(right345)?.radius);
    expect(circumradius(equilateral)).toBe(circumcircle(equilateral)?.radius);
    // degenerate: circumcircle은 undefined, ?.radius도 undefined로 동등하다.
    expect(circumradius(collinear)).toBe(circumcircle(collinear)?.radius);
  });

  test('CW orientation: 반지름은 winding과 무관하게 CCW와 같다', () => {
    expect(circumradius(right345Cw)).toBe(circumradius(right345));
  });

  test('non-finite vertex(NaN, Infinity, -Infinity): circumcircle과 같이 undefined를 반환한다', () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const t = { a: { x: bad, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };
      expect(circumradius(t)).toBeUndefined();
      expect(circumcircle(t)).toBeUndefined();
    }
  });
});
