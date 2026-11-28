/**
 * 삼각형과 ellipse·circle의 교차 판정에서 방향, 꼭짓점 포함, edge 교차 분기를 확인하는 테스트.
 * 시계 방향 삼각형, 꼭짓점 b·c만 도형 안에 드는 배치, edge bc만 도형을 가로지르는 배치를 쓴다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsCircleTriangle } from '../../../src/intersects/intersects-circle-triangle';
import { intersectsEllipseTriangle } from '../../../src/intersects/intersects-ellipse-triangle';

// 반시계 방향 삼각형. 꼭짓점 a(0,0), b(10,0), c(5,10).
const ccwTriangle = { x1: 0, y1: 0, x2: 10, y2: 0, x3: 5, y3: 10 };
// 같은 삼각형을 시계 방향으로 뒤집은 것.
const cwTriangle = { x1: 0, y1: 0, x2: 5, y2: 10, x3: 10, y3: 0 };

describe('intersectsEllipseTriangle', () => {
  test('삼각형 꼭짓점이 NaN이면 false를 반환한다', () => {
    const broken = { x1: 0, y1: 0, x2: Number.NaN, y2: 0, x3: 5, y3: 10 };
    expect(intersectsEllipseTriangle({ cx: 5, cy: 3, rx: 2, ry: 2 }, broken)).toBe(false);
  });

  test('삼각형 꼭짓점이 무한대이면 false를 반환한다', () => {
    const unbounded = { x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: 0, x3: 5, y3: 10 };
    expect(intersectsEllipseTriangle({ cx: 5, cy: 3, rx: 2, ry: 2 }, unbounded)).toBe(false);
  });

  test('시계 방향 삼각형도 중심이 안에 있으면 true를 반환한다', () => {
    expect(intersectsEllipseTriangle({ cx: 5, cy: 3, rx: 1, ry: 1 }, cwTriangle)).toBe(true);
  });

  test('시계 방향 삼각형과 떨어진 ellipse는 false를 반환한다', () => {
    expect(intersectsEllipseTriangle({ cx: 30, cy: 30, rx: 1, ry: 1 }, cwTriangle)).toBe(false);
  });

  test('중심이 삼각형 밖이어도 꼭짓점 b가 ellipse 안에 있으면 true를 반환한다', () => {
    expect(intersectsEllipseTriangle({ cx: 11, cy: -1, rx: 3, ry: 3 }, ccwTriangle)).toBe(true);
  });

  test('중심이 삼각형 밖이어도 꼭짓점 c가 ellipse 안에 있으면 true를 반환한다', () => {
    expect(intersectsEllipseTriangle({ cx: 5, cy: 11, rx: 3, ry: 3 }, ccwTriangle)).toBe(true);
  });

  test('꼭짓점이 모두 밖이고 edge bc만 가로지르면 true를 반환한다', () => {
    // 중심 (8.5, 5.5)는 삼각형 밖이다. 세 꼭짓점까지 거리는 모두 반지름 2보다 크다.
    expect(intersectsEllipseTriangle({ cx: 8.5, cy: 5.5, rx: 2, ry: 2 }, ccwTriangle)).toBe(true);
  });
});

describe('intersectsCircleTriangle', () => {
  test('시계 방향 삼각형도 중심이 안에 있으면 true를 반환한다', () => {
    expect(intersectsCircleTriangle({ cx: 5, cy: 3, r: 1 }, { x1: 0, y1: 0, x2: 5, y2: 10, x3: 10, y3: 0 })).toBe(true);
  });

  test('시계 방향 삼각형과 떨어진 circle은 false를 반환한다', () => {
    expect(intersectsCircleTriangle({ cx: 30, cy: 30, r: 1 }, { x1: 0, y1: 0, x2: 5, y2: 10, x3: 10, y3: 0 })).toBe(
      false
    );
  });

  test('edge 길이 제곱이 underflow로 0이 되는 삼각형에서도 가까운 끝점으로 판정한다', () => {
    // a→b 길이가 1e-200이라 제곱이 0으로 underflow한다. 넓이는 1e-199로 0이 아니다.
    const sliver = { x1: 0, y1: 0, x2: 1e-200, y2: 0, x3: 0, y3: 10 };
    expect(intersectsCircleTriangle({ cx: -1, cy: -1, r: 5 }, sliver)).toBe(true);
    expect(intersectsCircleTriangle({ cx: -30, cy: -30, r: 5 }, sliver)).toBe(false);
  });
});
