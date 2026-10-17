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
const q0 = { x: 0, y: 0 };
const q1 = { x: 5, y: 10 };
const q2 = { x: 10, y: 0 };
const c0 = { x: 0, y: 0 };
const c1 = { x: 3, y: 8 };
const c2 = { x: 7, y: 8 };
const c3 = { x: 10, y: 0 };

const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
const rect = { x: 0, y: 0, width: 10, height: 10 };
const ellipse = { center: { x: 5, y: 5 }, radiusX: 6, radiusY: 6 };
const triangle = { a: { x: -5, y: -5 }, b: { x: 20, y: -5 }, c: { x: 5, y: 20 } };

describe('2차 곡선 비유한 가드', () => {
  test('intersectsQuadraticBounds는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(q0, q1, q2, bounds)).toBe(true);
    expect(intersectsQuadraticBounds(q0, { x: nan, y: 10 }, q2, bounds)).toBe(false);
  });

  test('intersectsQuadraticBounds는 bounds 좌표가 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds(q0, q1, q2, { min: { x: nan, y: 0 }, max: { x: 10, y: 10 } })).toBe(false);
  });

  test('intersectsQuadraticRect는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticRect(q0, q1, q2, rect)).toBe(true);
    expect(intersectsQuadraticRect(q0, q1, { x: 10, y: nan }, rect)).toBe(false);
  });

  test('intersectsQuadraticRect는 rect 크기가 Infinity이면 false를 반환한다', () => {
    expect(intersectsQuadraticRect(q0, q1, q2, { x: 0, y: 0, width: Number.POSITIVE_INFINITY, height: 10 })).toBe(
      false
    );
  });

  test('intersectsQuadraticEllipse는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(q0, q1, q2, ellipse)).toBe(true);
    expect(intersectsQuadraticEllipse({ x: nan, y: 0 }, q1, q2, ellipse)).toBe(false);
  });

  test('intersectsQuadraticEllipse는 반지름이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(q0, q1, q2, { ...ellipse, radiusX: nan })).toBe(false);
  });

  test('intersectsQuadraticEllipse는 반지름이 무한대이면 false를 반환한다', () => {
    expect(intersectsQuadraticEllipse(q0, q1, q2, { ...ellipse, radiusX: Number.POSITIVE_INFINITY })).toBe(false);
  });

  test('intersectsQuadraticTriangle은 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticTriangle(q0, q1, q2, triangle)).toBe(true);
    expect(intersectsQuadraticTriangle(q0, q1, { x: nan, y: 0 }, triangle)).toBe(false);
  });

  test('intersectsQuadraticTriangle은 삼각형 꼭짓점이 NaN이면 false를 반환한다', () => {
    expect(intersectsQuadraticTriangle(q0, q1, q2, { ...triangle, c: { x: 5, y: nan } })).toBe(false);
  });
});

describe('3차 곡선 비유한 가드', () => {
  test('intersectsCubicBounds는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicBounds(c0, c1, c2, c3, bounds)).toBe(true);
    expect(intersectsCubicBounds(c0, c1, { x: nan, y: 8 }, c3, bounds)).toBe(false);
  });

  test('intersectsCubicBounds는 bounds 좌표가 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicBounds(c0, c1, c2, c3, { min: { x: 0, y: 0 }, max: { x: 10, y: nan } })).toBe(false);
  });

  test('intersectsCubicEllipse는 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(c0, c1, c2, c3, ellipse)).toBe(true);
    expect(intersectsCubicEllipse(c0, c1, c2, { x: nan, y: 0 }, ellipse)).toBe(false);
  });

  test('intersectsCubicEllipse는 중심이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(c0, c1, c2, c3, { ...ellipse, center: { x: nan, y: 5 } })).toBe(false);
  });

  test('intersectsCubicEllipse는 반지름이 무한대이면 false를 반환한다', () => {
    expect(intersectsCubicEllipse(c0, c1, c2, c3, { ...ellipse, radiusY: Number.POSITIVE_INFINITY })).toBe(false);
  });

  test('intersectsCubicTriangle은 제어점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicTriangle(c0, c1, c2, c3, triangle)).toBe(true);
    expect(intersectsCubicTriangle({ x: 0, y: nan }, c1, c2, c3, triangle)).toBe(false);
  });

  test('intersectsCubicTriangle은 삼각형 꼭짓점이 NaN이면 false를 반환한다', () => {
    expect(intersectsCubicTriangle(c0, c1, c2, c3, { ...triangle, a: { x: nan, y: -5 } })).toBe(false);
  });
});
