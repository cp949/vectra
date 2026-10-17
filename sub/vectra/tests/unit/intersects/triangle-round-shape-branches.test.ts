/**
 * 삼각형과 ellipse·circle의 교차 판정에서 방향, 꼭짓점 포함, edge 교차 분기를 확인하는 테스트.
 * 시계 방향 삼각형, 꼭짓점 b·c만 도형 안에 드는 배치, edge bc만 도형을 가로지르는 배치를 쓴다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsCircleTriangle } from '../../../src/intersects/intersects-circle-triangle';
import { intersectsEllipseTriangle } from '../../../src/intersects/intersects-ellipse-triangle';

// 반시계 방향 삼각형. 꼭짓점 a(0,0), b(10,0), c(5,10).
const ccwTriangle = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 5, y: 10 } };
// 같은 삼각형을 시계 방향으로 뒤집은 것.
const cwTriangle = { a: { x: 0, y: 0 }, b: { x: 5, y: 10 }, c: { x: 10, y: 0 } };

describe('intersectsEllipseTriangle', () => {
  test('삼각형 꼭짓점이 NaN이면 false를 반환한다', () => {
    const broken = { a: { x: 0, y: 0 }, b: { x: Number.NaN, y: 0 }, c: { x: 5, y: 10 } };
    expect(intersectsEllipseTriangle({ center: { x: 5, y: 3 }, radiusX: 2, radiusY: 2 }, broken)).toBe(false);
  });

  test('삼각형 꼭짓점이 무한대이면 false를 반환한다', () => {
    const unbounded = { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 }, c: { x: 5, y: 10 } };
    expect(intersectsEllipseTriangle({ center: { x: 5, y: 3 }, radiusX: 2, radiusY: 2 }, unbounded)).toBe(false);
  });

  test('시계 방향 삼각형도 중심이 안에 있으면 true를 반환한다', () => {
    expect(intersectsEllipseTriangle({ center: { x: 5, y: 3 }, radiusX: 1, radiusY: 1 }, cwTriangle)).toBe(true);
  });

  test('시계 방향 삼각형과 떨어진 ellipse는 false를 반환한다', () => {
    expect(intersectsEllipseTriangle({ center: { x: 30, y: 30 }, radiusX: 1, radiusY: 1 }, cwTriangle)).toBe(false);
  });

  test('중심이 삼각형 밖이어도 꼭짓점 b가 ellipse 안에 있으면 true를 반환한다', () => {
    expect(intersectsEllipseTriangle({ center: { x: 11, y: -1 }, radiusX: 3, radiusY: 3 }, ccwTriangle)).toBe(true);
  });

  test('중심이 삼각형 밖이어도 꼭짓점 c가 ellipse 안에 있으면 true를 반환한다', () => {
    expect(intersectsEllipseTriangle({ center: { x: 5, y: 11 }, radiusX: 3, radiusY: 3 }, ccwTriangle)).toBe(true);
  });

  test('꼭짓점이 모두 밖이고 edge bc만 가로지르면 true를 반환한다', () => {
    // 중심 (8.5, 5.5)는 삼각형 밖이다. 세 꼭짓점까지 거리는 모두 반지름 2보다 크다.
    expect(intersectsEllipseTriangle({ center: { x: 8.5, y: 5.5 }, radiusX: 2, radiusY: 2 }, ccwTriangle)).toBe(true);
  });
});

describe('intersectsCircleTriangle', () => {
  test('시계 방향 삼각형도 중심이 안에 있으면 true를 반환한다', () => {
    expect(intersectsCircleTriangle({ center: { x: 5, y: 3 }, radius: 1 }, cwTriangle)).toBe(true);
  });

  test('시계 방향 삼각형과 떨어진 circle은 false를 반환한다', () => {
    expect(intersectsCircleTriangle({ center: { x: 30, y: 30 }, radius: 1 }, cwTriangle)).toBe(false);
  });

  test('edge 길이 제곱이 underflow로 0이 되는 삼각형에서도 가까운 끝점으로 판정한다', () => {
    // a→b 길이가 1e-200이라 제곱이 0으로 underflow한다. 넓이는 1e-199로 0이 아니다.
    const sliver = { a: { x: 0, y: 0 }, b: { x: 1e-200, y: 0 }, c: { x: 0, y: 10 } };
    expect(intersectsCircleTriangle({ center: { x: -1, y: -1 }, radius: 5 }, sliver)).toBe(true);
    expect(intersectsCircleTriangle({ center: { x: -30, y: -30 }, radius: 5 }, sliver)).toBe(false);
  });
});
