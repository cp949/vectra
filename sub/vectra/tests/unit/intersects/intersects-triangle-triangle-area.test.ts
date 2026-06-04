import { describe, expect, test } from 'vitest';
import { intersectsTriangleTriangle } from '../../../src/intersects/intersects-triangle-triangle';

// 기준 삼각형: a(0,0) b(4,0) c(0,4) — CCW
const triA = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

describe('intersectsTriangle', () => {
  describe('miss', () => {
    test('완전히 떨어진 두 triangle은 false를 반환한다', () => {
      const triB = { a: { x: 10, y: 10 }, b: { x: 14, y: 10 }, c: { x: 10, y: 14 } };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(false);
    });

    test('a가 degenerate triangle이면 false를 반환한다', () => {
      const degenerate = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
      expect(intersectsTriangleTriangle(degenerate, triA)).toBe(false);
    });

    test('b가 degenerate triangle이면 false를 반환한다', () => {
      const degenerate = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
      expect(intersectsTriangleTriangle(triA, degenerate)).toBe(false);
    });

    test('양 triangle 모두 degenerate이면 false를 반환한다', () => {
      const deg1 = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
      const deg2 = { a: { x: 1, y: 0 }, b: { x: 3, y: 0 }, c: { x: 5, y: 0 } };
      expect(intersectsTriangleTriangle(deg1, deg2)).toBe(false);
    });

    test('SAT separation by one axis: x축으로 분리된 경우 false를 반환한다', () => {
      // triB는 x=6 이상에 있어 SAT x-projection으로 분리됨
      const triB = { a: { x: 6, y: 0 }, b: { x: 10, y: 0 }, c: { x: 6, y: 4 } };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(false);
    });
  });

  describe('overlap', () => {
    test('한 triangle이 다른 triangle을 완전히 포함하면 true를 반환한다', () => {
      // 큰 삼각형이 triA를 포함
      const big = { a: { x: -2, y: -2 }, b: { x: 10, y: -2 }, c: { x: -2, y: 10 } };
      expect(intersectsTriangleTriangle(triA, big)).toBe(true);
    });

    test('두 triangle이 부분적으로 겹치면 true를 반환한다', () => {
      const triB = { a: { x: 2, y: 2 }, b: { x: 6, y: 2 }, c: { x: 2, y: 6 } };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });
  });

  describe('edge touch', () => {
    test('두 triangle의 edge가 한 점에서 접하면 true를 반환한다 (closed boundary)', () => {
      // triB의 vertex (4,0)이 triA의 edge 위에 있음
      const triB = { a: { x: 4, y: 0 }, b: { x: 8, y: 0 }, c: { x: 4, y: 4 } };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });

    test('두 triangle의 edge가 겹치면 true를 반환한다', () => {
      // triB와 triA의 밑변 (y=0 구간)이 겹침
      const triB = { a: { x: 2, y: 0 }, b: { x: 6, y: 0 }, c: { x: 4, y: -4 } };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });
  });

  describe('crossing', () => {
    test('두 triangle이 교차하면 true를 반환한다 (X자형 교차)', () => {
      // triB의 빗변이 triA를 가로지름
      const triB = { a: { x: 2, y: -2 }, b: { x: 2, y: 6 }, c: { x: -2, y: 2 } };
      expect(intersectsTriangleTriangle(triA, triB)).toBe(true);
    });
  });

  describe('input forms', () => {
    test('CW triangle도 올바르게 처리한다', () => {
      // CW version of triA
      const cw = { a: { x: 0, y: 0 }, b: { x: 0, y: 4 }, c: { x: 4, y: 0 } };
      const triB = { a: { x: 2, y: 0 }, b: { x: 6, y: 0 }, c: { x: 2, y: 4 } };
      expect(intersectsTriangleTriangle(cw, triB)).toBe(true);
    });

    test('tuple TriangleLike에서도 동작한다', () => {
      const tA = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 },
      ] as const;
      const tB = [
        { x: 2, y: 2 },
        { x: 6, y: 2 },
        { x: 2, y: 6 },
      ] as const;
      expect(intersectsTriangleTriangle(tA, tB)).toBe(true);
    });
  });
});
