/**
 * path와 segment, ray, infinite-line 사이의 boolean 교차 판정을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPathInfiniteLine } from '../../../src/intersects/intersects-path-infinite-line';
import { intersectsPathRay } from '../../../src/intersects/intersects-path-ray';
import { intersectsPathSegment } from '../../../src/intersects/intersects-path-segment';
import { squareClosedPath, squarePath } from './_helpers/path-intersection-fixtures';

describe('intersectsPathSegment', () => {
  describe('교차 hit', () => {
    test('segment이 open path edge를 가로지르면 true를 반환한다', () => {
      // (4,0)->(4,4) edge를 가로지르는 수평선
      const line = { a: { x: 3, y: 2 }, b: { x: 5, y: 2 } };
      expect(intersectsPathSegment(squarePath, line)).toBe(true);
    });

    test('segment이 closed path edge를 가로지르면 true를 반환한다', () => {
      const line = { a: { x: 3, y: 2 }, b: { x: 5, y: 2 } };
      expect(intersectsPathSegment(squareClosedPath, line)).toBe(true);
    });

    test('path가 line commands만 있는 경우 polyline과 동일한 결과를 반환한다', () => {
      // (0,0)->(4,0) edge를 수직선으로 교차
      const line = { a: { x: 2, y: -1 }, b: { x: 2, y: 1 } };
      expect(intersectsPathSegment(squarePath, line)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('segment이 open path 외부를 지나면 false를 반환한다', () => {
      // path 오른쪽 바깥 (x=10)
      const line = { a: { x: 10, y: 0 }, b: { x: 10, y: 4 } };
      expect(intersectsPathSegment(squarePath, line)).toBe(false);
    });

    test('open path에서 마지막->첫 closing edge는 연결되지 않으므로 그 edge와 교차해도 false를 반환한다', () => {
      // 정사각형 open path: closing edge (0,4)->(0,0)이 없음
      // x=-1에서 y=1->y=3 구간 수직선: 실제 edges와 교차 없음
      const line = { a: { x: -1, y: 1 }, b: { x: -1, y: 3 } };
      expect(intersectsPathSegment(squarePath, line)).toBe(false);
    });

    test('segment이 path와 평행하고 떨어져 있으면 false를 반환한다', () => {
      // path 위 수평선 (y=10)
      const line = { a: { x: 0, y: 10 }, b: { x: 4, y: 10 } };
      expect(intersectsPathSegment(squarePath, line)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const line = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } };
      expect(intersectsPathSegment([], line)).toBe(false);
    });
  });

  describe('vertex touch', () => {
    test('segment이 path vertex를 touch하면 true를 반환한다', () => {
      // vertex (4,0)을 정확히 지나는 수직선
      const line = { a: { x: 4, y: -1 }, b: { x: 4, y: 1 } };
      expect(intersectsPathSegment(squarePath, line)).toBe(true);
    });
  });
});

describe('intersectsPathRay', () => {
  describe('교차 hit', () => {
    test('ray가 path edge를 가로지르면 true를 반환한다', () => {
      // +x 방향 ray가 (4,0)->(4,4) edge를 교차
      const ray = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathRay(squarePath, ray)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('ray 역방향에만 path가 있으면 false를 반환한다', () => {
      // +x 방향 ray, origin이 path 오른쪽
      const ray = { origin: { x: 10, y: 2 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathRay(squarePath, ray)).toBe(false);
    });

    test('ray가 path와 평행하고 떨어져 있으면 false를 반환한다', () => {
      // path 위 수평 ray (y=10)
      const ray = { origin: { x: 0, y: 10 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathRay(squarePath, ray)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathRay([], ray)).toBe(false);
    });
  });

  describe('edge crossing', () => {
    test('ray가 path edge를 통과하면 true를 반환한다', () => {
      // origin (0,2), +x 방향 -> (4,2)는 (4,0)->(4,4) edge 위의 점이므로 edge와 교차
      const ray = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathRay(squarePath, ray)).toBe(true);
    });
  });
});

describe('intersectsPathInfiniteLine', () => {
  describe('교차 hit', () => {
    test('infinite-line이 path edge를 가로지르면 true를 반환한다', () => {
      // y=2 수평 infinite-line이 (4,0)->(4,4) edge와 교차
      const iline = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathInfiniteLine(squarePath, iline)).toBe(true);
    });

    test('infinite-line이 closed path를 가로지르면 true를 반환한다', () => {
      const iline = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathInfiniteLine(squareClosedPath, iline)).toBe(true);
    });
  });

  describe('교차 miss', () => {
    test('infinite-line이 path와 평행하고 떨어져 있으면 false를 반환한다', () => {
      // path 위 수평 infinite-line (y=10)
      const iline = { origin: { x: 0, y: 10 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathInfiniteLine(squarePath, iline)).toBe(false);
    });
  });

  describe('empty path', () => {
    test('empty path는 false를 반환한다', () => {
      const iline = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathInfiniteLine([], iline)).toBe(false);
    });
  });

  describe('vertex touch', () => {
    test('infinite-line이 path vertex를 touch하면 true를 반환한다', () => {
      // y=0 수평선이 vertex (0,0), (4,0)을 touch (edge (0,0)->(4,0)과 collinear)
      const iline = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
      expect(intersectsPathInfiniteLine(squarePath, iline)).toBe(true);
    });
  });
});
