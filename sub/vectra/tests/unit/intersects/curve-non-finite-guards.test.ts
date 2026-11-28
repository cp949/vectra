/**
 * 곡선–도형 교차 판정의 비유한 입력 가드를 확인하는 테스트.
 * 제어점이나 도형 좌표에 NaN·Infinity가 있으면 조기에 false를 반환하는지 본다.
 * 유한 입력에서는 같은 구성이 true인 것을 함께 확인해 가드가 정상 경로를 막지 않음을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsCubicBounds } from '../../../src/intersects/intersects-cubic-bounds';
import { intersectsCubicEllipse } from '../../../src/intersects/intersects-cubic-ellipse';
import { intersectsCubicTriangle } from '../../../src/intersects/intersects-cubic-triangle';
import { intersectsQuadraticBounds } from '../../../src/intersects/intersects-quadratic-bounds';
import { intersectsQuadraticEllipse } from '../../../src/intersects/intersects-quadratic-ellipse';
import { intersectsQuadraticRect } from '../../../src/intersects/intersects-quadratic-rect';
import { intersectsQuadraticTriangle } from '../../../src/intersects/intersects-quadratic-triangle';

const nan = Number.NaN;

// 모두 (5, 5) 근처를 지나는 곡선이다. 도형은 (0..10)을 덮는다.
const quadratic = { kind: 'quadratic', x0: 0, y0: 0, x1: 5, y1: 10, x2: 10, y2: 0 } as const;
const cubic = { kind: 'cubic', x0: 0, y0: 0, x1: 3, y1: 8, x2: 7, y2: 8, x3: 10, y3: 0 } as const;

const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
const rect = { x: 0, y: 0, width: 10, height: 10 };
const ellipse = { cx: 5, cy: 5, rx: 6, ry: 6 };
const triangle = { x1: -5, y1: -5, x2: 20, y2: -5, x3: 5, y3: 20 };

describe('2차 곡선 비유한 가드', () => {
  test('intersectsQuadraticBounds는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(quadratic, bounds)).toBe(true);
    expect(intersectsQuadraticBounds({ ...quadratic, x1: nan }, bounds)).toBe(false);
  });

  test('intersectsQuadraticBounds는 bounds 좌표가 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(quadratic, { ...bounds, minX: nan })).toBe(false);
  });

  test('intersectsQuadraticRect는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticRect(quadratic, rect)).toBe(true);
    expect(intersectsQuadraticRect({ ...quadratic, y2: nan }, rect)).toBe(false);
  });

  test('intersectsQuadraticRect는 rect 크기가 Infinity이면 false를 반환한다', () => {
    expect(intersectsQuadraticRect(quadratic, { ...rect, width: Number.POSITIVE_INFINITY })).toBe(false);
  });

  test('intersectsQuadraticEllipse는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(quadratic, ellipse)).toBe(true);
    expect(intersectsQuadraticEllipse({ ...quadratic, x0: nan }, ellipse)).toBe(false);
  });

  test('intersectsQuadraticEllipse는 반지름이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(quadratic, { ...ellipse, rx: nan })).toBe(false);
  });

  test('intersectsQuadraticEllipse는 반지름이 무한대이면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(quadratic, { ...ellipse, rx: Number.POSITIVE_INFINITY })).toBe(false);
  });

  test('intersectsQuadraticTriangle은 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticTriangle(quadratic, triangle)).toBe(true);
    expect(intersectsQuadraticTriangle({ ...quadratic, x2: nan }, triangle)).toBe(false);
  });

  test('intersectsQuadraticTriangle은 삼각형 꼭짓점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticTriangle(quadratic, { ...triangle, x3: 5, y3: nan })).toBe(false);
  });
});

describe('3차 곡선 비유한 가드', () => {
  test('intersectsCubicBounds는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicBounds(cubic, bounds)).toBe(true);
    expect(intersectsCubicBounds({ ...cubic, x2: nan }, bounds)).toBe(false);
  });

  test('intersectsCubicBounds는 bounds 좌표가 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicBounds(cubic, { ...bounds, maxY: nan })).toBe(false);
  });

  test('intersectsCubicEllipse는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cubic, ellipse)).toBe(true);
    expect(intersectsCubicEllipse({ ...cubic, x3: nan }, ellipse)).toBe(false);
  });

  test('intersectsCubicEllipse는 중심이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cubic, { ...ellipse, cx: nan, cy: 5 })).toBe(false);
  });

  test('intersectsCubicEllipse는 반지름이 무한대이면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(cubic, { ...ellipse, ry: Number.POSITIVE_INFINITY })).toBe(false);
  });

  test('intersectsCubicTriangle은 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicTriangle(cubic, triangle)).toBe(true);
    expect(intersectsCubicTriangle({ ...cubic, y0: nan }, triangle)).toBe(false);
  });

  test('intersectsCubicTriangle은 삼각형 꼭짓점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicTriangle(cubic, { ...triangle, x1: nan, y1: -5 })).toBe(false);
  });
});
