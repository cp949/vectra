import { describe, expect, test } from 'vitest';
import { intersectsTriangleTriangle } from '../../../src/intersects/intersects-triangle-triangle';

// 기준 삼각형: a(0,0) b(4,0) c(0,4) — CCW
const triA = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };

describe('intersectsTriangle', () => {
  describe('miss', () => {
    test('완전히 떨어진 두 triangle은 false를 반환한다', () => {
      const triB = { x1: 10, y1: 10, x2: 14, y2: 10, x3: 10, y3: 14 };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(false);
    });

    test('a가 degenerate triangle이면 false를 반환한다', () => {
      const degenerate = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      expect(intersectsTriangleTriangle(degenerate, triA)).toBe(false);
    });

    test('b가 degenerate triangle이면 false를 반환한다', () => {
      const degenerate = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      expect(intersectsTriangleTriangle(triA, degenerate)).toBe(false);
    });

    test('양 triangle 모두 degenerate이면 false를 반환한다', () => {
      const deg1 = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
      const deg2 = { x1: 1, y1: 0, x2: 3, y2: 0, x3: 5, y3: 0 };
      expect(intersectsTriangleTriangle(deg1, deg2)).toBe(false);
    });

    test('SAT separation by one axis: x축으로 분리된 경우 false를 반환한다', () => {
      // triB는 x=6 이상에 있어 SAT x-projection으로 분리됨
      const triB = { x1: 6, y1: 0, x2: 10, y2: 0, x3: 6, y3: 4 };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(false);
    });
  });

  describe('overlap', () => {
    test('한 triangle이 다른 triangle을 완전히 포함하면 true를 반환한다', () => {
      // 큰 삼각형이 triA를 포함
      const big = { x1: -2, y1: -2, x2: 10, y2: -2, x3: -2, y3: 10 };
      expect(intersectsTriangleTriangle(triA, big)).toBe(true);
    });

    test('두 triangle이 부분적으로 겹치면 true를 반환한다', () => {
      const triB = { x1: 2, y1: 2, x2: 6, y2: 2, x3: 2, y3: 6 };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('두 triangle의 edge가 한 점에서 접하면 true를 반환한다 (closed boundary)', () => {
      // triB의 vertex (4,0)이 triA의 edge 위에 있음
      const triB = { x1: 4, y1: 0, x2: 8, y2: 0, x3: 4, y3: 4 };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });

    test('두 triangle의 edge가 겹치면 true를 반환한다', () => {
      // triB와 triA의 밑변 (y=0 구간)이 겹침
      const triB = { x1: 2, y1: 0, x2: 6, y2: 0, x3: 4, y3: -4 };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });
  });

  describe('crossing', () => {
    test('두 triangle이 교차하면 true를 반환한다 (X자형 교차)', () => {
      // triB의 빗변이 triA를 가로지름
      const triB = { x1: 2, y1: -2, x2: 2, y2: 6, x3: -2, y3: 2 };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });
  });

  describe('input forms', () => {
    test('CW triangle도 올바르게 처리한다', () => {
      // CW version of triA
      const cw = { x1: 0, y1: 0, x2: 0, y2: 4, x3: 4, y3: 0 };
      const triB = { x1: 2, y1: 0, x2: 6, y2: 0, x3: 2, y3: 4 };
      expect(intersectsTriangleTriangle(cw, triB)).toBe(true);
    });

    test('두 삼각형의 경계가 서로 교차하면 true다', () => {
      const tA = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
      const tB = { x1: 2, y1: 2, x2: 6, y2: 2, x3: 2, y3: 6 };
      expect(intersectsTriangleTriangle(tA, tB)).toBe(true);
    });
  });
});
