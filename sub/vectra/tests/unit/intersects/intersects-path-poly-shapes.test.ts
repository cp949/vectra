/**
 * path와 polygon, polyline 사이의 boolean 교차 판정을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPathPolygon } from '../../../src/intersects/intersects-path-polygon';
import { intersectsPathPolyline } from '../../../src/intersects/intersects-path-polyline';
import type { PathCommand } from '../../../src/types';

// 정사각형 polygon (0,0)-(8,0)-(8,8)-(0,8)
const squarePolygon = {
  points: [
    { x: 0, y: 0 },
    { x: 8, y: 0 },
    { x: 8, y: 8 },
    { x: 0, y: 8 },
  ],
};

// 수직 polyline (5,0)->(5,8)
const verticalPolyline = {
  points: [
    { x: 5, y: 0 },
    { x: 5, y: 8 },
  ],
};

describe('intersectsPathPolygon', () => {
  describe('path가 polygon으로 들어가는 경우', () => {
    test('path segment가 polygon 경계를 가로지르면 true를 반환한다', () => {
      // path (0,4)->(10,4): polygon 경계 x=8을 가로지름
      const cmd: PathCommand[] = [
        { kind: 'move', x: 0, y: 4 },
        { kind: 'line', x: 10, y: 4 },
      ];
      expect(intersectsPathPolygon(cmd, squarePolygon)).toBe(true);
    });
  });

  describe('path가 polygon 내부에 완전히 있는 경우', () => {
    test('path 전체가 polygon 내부에 있으면 true를 반환한다', () => {
      // path (2,2)->(6,6): polygon (0,0)-(8,8) 내부에 완전히 포함
      const cmd: PathCommand[] = [
        { kind: 'move', x: 2, y: 2 },
        { kind: 'line', x: 6, y: 6 },
      ];
      expect(intersectsPathPolygon(cmd, squarePolygon)).toBe(true);
    });
  });

  describe('path가 polygon 바깥에 있는 경우', () => {
    test('path 전체가 polygon 외부에 있으면 false를 반환한다', () => {
      // path (10,0)->(10,8): polygon 오른쪽 바깥
      const cmd: PathCommand[] = [
        { kind: 'move', x: 10, y: 0 },
        { kind: 'line', x: 10, y: 8 },
      ];
      expect(intersectsPathPolygon(cmd, squarePolygon)).toBe(false);
    });
  });

  describe('empty 케이스', () => {
    test('empty path는 false를 반환한다', () => {
      expect(intersectsPathPolygon([], squarePolygon)).toBe(false);
    });

    test('empty polygon(points.length < 3)은 false를 반환한다', () => {
      const emptyPoly = {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      };
      const cmd: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 4, y: 0 },
      ];
      expect(intersectsPathPolygon(cmd, emptyPoly)).toBe(false);
    });
  });
});

describe('intersectsPathPolyline', () => {
  describe('path가 polyline과 교차하는 경우', () => {
    test('path segment가 polyline segment를 가로지르면 true를 반환한다', () => {
      // path (0,4)->(10,4): 수직 polyline x=5와 교차
      const cmd: PathCommand[] = [
        { kind: 'move', x: 0, y: 4 },
        { kind: 'line', x: 10, y: 4 },
      ];
      expect(intersectsPathPolyline(cmd, verticalPolyline)).toBe(true);
    });
  });

  describe('path가 polyline과 떨어져 있는 경우', () => {
    test('path 전체가 polyline 외부에 있으면 false를 반환한다', () => {
      // path (0,0)->(4,0): polyline x=5와 교차하지 않음
      const cmd: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 4, y: 0 },
      ];
      expect(intersectsPathPolyline(cmd, verticalPolyline)).toBe(false);
    });
  });

  describe('empty 케이스', () => {
    test('empty path는 false를 반환한다', () => {
      expect(intersectsPathPolyline([], verticalPolyline)).toBe(false);
    });

    test('empty polyline(points.length < 2)은 false를 반환한다', () => {
      const emptyPolyline = { points: [{ x: 5, y: 4 }] };
      const cmd: PathCommand[] = [
        { kind: 'move', x: 0, y: 4 },
        { kind: 'line', x: 10, y: 4 },
      ];
      expect(intersectsPathPolyline(cmd, emptyPolyline)).toBe(false);
    });

    test('단일 점 path(segment 없음)는 false를 반환한다', () => {
      // move만 있는 path: flatten 후 점 1개, segment 없음
      const cmd: PathCommand[] = [{ kind: 'move', x: 5, y: 4 }];
      expect(intersectsPathPolyline(cmd, verticalPolyline)).toBe(false);
    });
  });

  describe('path vertex touch', () => {
    test('path vertex가 polyline segment 위에 있으면 true를 반환한다', () => {
      // path vertex (5,4)가 polyline (5,0)->(5,8) 위
      const cmd: PathCommand[] = [
        { kind: 'move', x: 0, y: 4 },
        { kind: 'line', x: 5, y: 4 },
        { kind: 'line', x: 5, y: 4 },
      ];
      expect(intersectsPathPolyline(cmd, verticalPolyline)).toBe(true);
    });
  });
});
