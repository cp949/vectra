/**
 * 곡선과 rect·bounds·삼각형 교차 판정에서 끝점 포함 검사를 확인하는 테스트.
 * 시작점은 도형 밖이고 끝점만 안에 있는 곡선과, 끝점이 한 축에서만 도형 범위에 드는 곡선을 쓴다.
 * 빈 ellipse 입력의 거부도 함께 확인한다.
 */
import { describe, expect, test } from 'vitest';
import { curveEllipseDiskIntersects } from '../../../src/intersects/curve-primitive-probe.internal';
import { intersectsQuadraticBounds } from '../../../src/intersects/intersects-quadratic-bounds';
import { intersectsQuadraticRect } from '../../../src/intersects/intersects-quadratic-rect';
import { intersectsQuadraticTriangle } from '../../../src/intersects/intersects-quadratic-triangle';

const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
const rect = { x: 0, y: 0, width: 10, height: 10 };
const triangle = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 } };

// 왼쪽 밖에서 시작해 도형 안쪽 (5, 5)에서 끝나는 직선형 곡선
const p0 = { x: -5, y: 5 };
const p1 = { x: 0, y: 5 };
const p2 = { x: 5, y: 5 };

describe('끝점만 도형 안에 있는 곡선', () => {
  test('intersectsQuadraticRect는 끝점이 rect 안에 있으면 true를 반환한다', () => {
    expect(intersectsQuadraticRect(p0, p1, p2, rect)).toBe(true);
  });

  test('intersectsQuadraticBounds는 끝점이 bounds 안에 있으면 true를 반환한다', () => {
    expect(intersectsQuadraticBounds(p0, p1, p2, bounds)).toBe(true);
  });

  test('intersectsQuadraticTriangle은 끝점이 삼각형 안에 있으면 true를 반환한다', () => {
    expect(intersectsQuadraticTriangle(p0, p1, p2, triangle)).toBe(true);
  });
});

describe('끝점이 bounds의 x 범위에만 드는 곡선', () => {
  test('끝점이 bounds 아래에 있고 곡선이 bounds와 떨어져 있으면 false를 반환한다', () => {
    const below = [
      { x: 5, y: -30 },
      { x: 5, y: -25 },
      { x: 5, y: -20 },
    ] as const;
    expect(intersectsQuadraticBounds(below[0], below[1], below[2], bounds)).toBe(false);
  });

  test('끝점이 bounds 위에 있고 곡선이 bounds와 떨어져 있으면 false를 반환한다', () => {
    const above = [
      { x: 5, y: 30 },
      { x: 5, y: 25 },
      { x: 5, y: 20 },
    ] as const;
    expect(intersectsQuadraticBounds(above[0], above[1], above[2], bounds)).toBe(false);
  });
});

describe('양 끝점이 bounds의 y 범위에만 드는 곡선', () => {
  test('bounds 오른쪽에서 수평으로 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds({ x: 20, y: 5 }, { x: 25, y: 5 }, { x: 30, y: 5 }, bounds)).toBe(false);
  });

  test('bounds 왼쪽에서 수평으로 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsQuadraticBounds({ x: -30, y: 5 }, { x: -25, y: 5 }, { x: -20, y: 5 }, bounds)).toBe(false);
  });
});

describe('curveEllipseDiskIntersects', () => {
  // x(t) = 10t, y(t) = 0인 직선형 곡선
  const xCoef = [0, 10];
  const yCoef = [0, 0];

  test('x 반지름이 0이면 false를 반환한다', () => {
    expect(curveEllipseDiskIntersects(xCoef, yCoef, 5, 0, 0, 1, 1e-9)).toBe(false);
  });

  test('y 반지름이 음수이면 false를 반환한다', () => {
    expect(curveEllipseDiskIntersects(xCoef, yCoef, 5, 0, 1, -1, 1e-9)).toBe(false);
  });

  test('반지름이 양수이면 곡선이 지나는 ellipse에서 true를 반환한다', () => {
    expect(curveEllipseDiskIntersects(xCoef, yCoef, 5, 0, 1, 1, 1e-9)).toBe(true);
  });
});
