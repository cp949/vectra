/**
 * triangle radius scalar helper 단위 테스트.
 *
 * inradius / circumradius의 정확도, degenerate 처리, circle helper radius 계약과의
 * 일치, non-finite 전파를 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { circumcircle } from '../../../src/triangle/circumcircle';
import { circumradius } from '../../../src/triangle/circumradius';
import { incircle } from '../../../src/triangle/incircle';
import { inradius } from '../../../src/triangle/inradius';

/** 3-4-5 직각삼각형: a(0,0) b(3,0) c(0,4) — CCW */
const right345 = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };

/** 변이 1인 정삼각형 */
const equilateral = { x1: 0, y1: 0, x2: 1, y2: 0, x3: 0.5, y3: Math.sqrt(3) / 2 };

/** collinear(degenerate) triangle, perimeter > 0 */
const collinear = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };

/** 한 점으로 수렴(perimeter = 0) */
const point = { x1: 1, y1: 1, x2: 1, y2: 1, x3: 1, y3: 1 };

/** right345의 winding을 뒤집은 CW 버전 — 반지름은 orientation과 무관하게 같다 */
const right345Cw = { x1: 0, y1: 0, x2: 0, y2: 4, x3: 3, y3: 0 };

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

  test('incircle(triangle)?.r와 같은 값을 반환한다', () => {
    expect(inradius(right345)).toBe(incircle(right345)?.r);
    expect(inradius(equilateral)).toBe(incircle(equilateral)?.r);
    expect(inradius(collinear)).toBe(incircle(collinear)?.r);
  });

  test('CW orientation: 반지름은 winding과 무관하게 CCW와 같다', () => {
    expect(inradius(right345Cw)).toBe(inradius(right345));
  });

  test('non-finite vertex(NaN, Infinity, -Infinity): incircle radius와 같은 결과를 낸다', () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const t = { x1: bad, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
      const r = inradius(t);
      const helperRadius = incircle(t)?.r;
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

  test('circumcircle(triangle)?.r와 같은 값을 반환한다', () => {
    expect(circumradius(right345)).toBe(circumcircle(right345)?.r);
    expect(circumradius(equilateral)).toBe(circumcircle(equilateral)?.r);
    // degenerate: circumcircle은 undefined, ?.r도 undefined로 동등하다.
    expect(circumradius(collinear)).toBe(circumcircle(collinear)?.r);
  });

  test('CW orientation: 반지름은 winding과 무관하게 CCW와 같다', () => {
    expect(circumradius(right345Cw)).toBe(circumradius(right345));
  });

  test('non-finite vertex(NaN, Infinity, -Infinity): circumcircle과 같이 undefined를 반환한다', () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const t = { x1: bad, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
      expect(circumradius(t)).toBeUndefined();
      expect(circumcircle(t)).toBeUndefined();
    }
  });
});
