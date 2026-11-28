/** 다각형과 선분·사각 경계의 교차 판정을 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsPolygonBounds } from '../../../src/intersects/intersects-polygon-bounds';
import { intersectsPolygonRect } from '../../../src/intersects/intersects-polygon-rect';
import { intersectsPolygonSegment } from '../../../src/intersects/intersects-polygon-segment';
import type { Polygon } from '../../../src/types/flat-shapes.internal';

const intersectsSegment = (
  polygon: Parameters<typeof intersectsPolygonSegment>[0],
  segment: Parameters<typeof intersectsPolygonSegment>[1],
  epsilon?: number
) => intersectsPolygonSegment(polygon, segment, epsilon);

// 수학적 y-up 좌표계 기준 counter-clockwise 3-4-5 삼각형
// 꼭짓점: (0,0) → (4,0) → (0,3)
const CCW_TRI: Polygon = [0, 0, 4, 0, 0, 3];

// 단위 정사각형 (CCW), (0,0)→(1,0)→(1,1)→(0,1)
const UNIT_SQUARE: Polygon = [0, 0, 1, 0, 1, 1, 0, 1];

// 크기 4×4 정사각형 (CCW)
const SQUARE_4: Polygon = [0, 0, 4, 0, 4, 4, 0, 4];

const EMPTY: Polygon = [];
const TWO_PT: Polygon = [0, 0, 2, 0];

describe('다각형 좌표 배열 교차', () => {
  test('같은 다각형 좌표 배열로 선분과 사각 경계를 판정한다', () => {
    const points = [0, 0, 4, 0, 0, 3];

    expect(intersectsSegment(points, { x1: -1, y1: 1, x2: 2, y2: 1 })).toBe(true);
    expect(intersectsPolygonRect(points, { x: 1, y: 1, width: 1, height: 1 })).toBe(true);
    expect(intersectsPolygonBounds(points, { minX: 1, minY: 1, maxX: 2, maxY: 2 })).toBe(true);
  });
});

describe('polygon - intersectsSegment', () => {
  // 관통
  test('polygon을 관통하는 segment는 true를 반환한다', () => {
    // (2,-1)→(2,2): 하단 edge를 뚫고 내부로 진입
    expect(intersectsSegment(UNIT_SQUARE, { x1: 0.5, y1: -1, x2: 0.5, y2: 2 })).toBe(true);
  });

  // 완전히 내부
  test('polygon 내부에 완전히 있는 segment는 true를 반환한다', () => {
    // SQUARE_4 내부 (1,1)→(3,3)
    expect(intersectsSegment(SQUARE_4, { x1: 1, y1: 1, x2: 3, y2: 3 })).toBe(true);
  });

  // 완전히 외부
  test('polygon 외부에 있는 segment는 false를 반환한다', () => {
    expect(intersectsSegment(UNIT_SQUARE, { x1: 2, y1: 0, x2: 3, y2: 1 })).toBe(false);
  });

  // edge와 겹침
  test('polygon edge 위에 있는 segment는 true를 반환한다', () => {
    // UNIT_SQUARE bottom edge (0,0)→(1,0) 위의 부분 (0.2,0)→(0.8,0)
    expect(intersectsSegment(UNIT_SQUARE, { x1: 0.2, y1: 0, x2: 0.8, y2: 0 })).toBe(true);
  });

  // endpoint가 boundary 위
  test('segment endpoint가 polygon boundary 위에 있으면 true를 반환한다', () => {
    // (0.5,0) UNIT_SQUARE bottom edge 위
    expect(intersectsSegment(UNIT_SQUARE, { x1: 0.5, y1: 0, x2: 0.5, y2: -1 })).toBe(true);
  });

  // endpoint가 내부
  test('segment endpoint가 polygon 내부에 있으면 true를 반환한다', () => {
    expect(intersectsSegment(UNIT_SQUARE, { x1: 0.5, y1: 0.5, x2: 2, y2: 2 })).toBe(true);
  });

  // empty polygon
  test('empty polygon은 false를 반환한다', () => {
    expect(intersectsSegment(EMPTY, { x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(false);
  });

  test('2점 polygon은 false를 반환한다', () => {
    expect(intersectsSegment(TWO_PT, { x1: 1, y1: 0, x2: 3, y2: 0 })).toBe(false);
  });

  // epsilon
  test('epsilon으로 edge 근처 endpoint를 포함한다', () => {
    // (0.5, -0.1): bottom edge까지 거리 0.1, epsilon=0.2
    expect(intersectsSegment(UNIT_SQUARE, { x1: 0.5, y1: -0.1, x2: 0.5, y2: -0.5 }, 0.2)).toBe(true);
  });
});

describe('polygon - intersectsRect', () => {
  // rect가 polygon 내부
  test('rect가 polygon 내부에 완전히 있으면 true를 반환한다', () => {
    // SQUARE_4 내부에 rect {x:1,y:1,w:2,h:2}
    expect(intersectsPolygonRect(SQUARE_4, { x: 1, y: 1, width: 2, height: 2 })).toBe(true);
  });

  // polygon이 rect 내부
  test('polygon이 rect 내부에 완전히 있으면 true를 반환한다', () => {
    // UNIT_SQUARE가 {x:-1,y:-1,w:5,h:5} 내부
    expect(intersectsPolygonRect(UNIT_SQUARE, { x: -1, y: -1, width: 5, height: 5 })).toBe(true);
  });

  // 겹침 (partial overlap)
  test('polygon과 rect가 부분 겹치면 true를 반환한다', () => {
    // UNIT_SQUARE와 {x:0.5,y:0.5,w:1,h:1}이 겹침
    expect(intersectsPolygonRect(UNIT_SQUARE, { x: 0.5, y: 0.5, width: 1, height: 1 })).toBe(true);
  });

  // 완전히 외부
  test('polygon과 rect가 완전히 분리되면 false를 반환한다', () => {
    expect(intersectsPolygonRect(UNIT_SQUARE, { x: 5, y: 5, width: 2, height: 2 })).toBe(false);
  });

  // edge 교차
  test('polygon edge와 rect edge가 교차하면 true를 반환한다', () => {
    // CCW_TRI 빗변이 {x:1,y:1,w:2,h:2}과 교차
    expect(intersectsPolygonRect(CCW_TRI, { x: 1, y: 1, width: 2, height: 2 })).toBe(true);
  });

  // rect corner가 polygon boundary 위
  test('rect corner가 polygon boundary 위에 있으면 true를 반환한다', () => {
    // UNIT_SQUARE corner (0,0)와 rect {x:0,y:0,w:-1,h:-1}는 단순히 (0,0) corner overlap
    // rect {x:0,y:0,w:0.5,h:0.5} — 모든 corner 중 (0,0)이 UNIT_SQUARE boundary 위
    expect(intersectsPolygonRect(UNIT_SQUARE, { x: -0.5, y: -0.5, width: 0.5, height: 0.5 })).toBe(true);
  });

  // polygon point가 rect 내부
  test('polygon vertex가 rect 내부에 있으면 true를 반환한다', () => {
    // CCW_TRI vertex (0,0)이 {x:-1,y:-1,w:2,h:2} 내부
    expect(intersectsPolygonRect(CCW_TRI, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  // empty polygon
  test('empty polygon은 false를 반환한다', () => {
    expect(intersectsPolygonRect(EMPTY, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
  });

  test('2점 polygon은 false를 반환한다', () => {
    expect(intersectsPolygonRect(TWO_PT, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
  });

  // empty rect
  test('empty rect(width=0)는 false를 반환한다', () => {
    expect(intersectsPolygonRect(UNIT_SQUARE, { x: 0.5, y: 0.5, width: 0, height: 1 })).toBe(false);
  });

  test('empty rect(height=0)는 false를 반환한다', () => {
    expect(intersectsPolygonRect(UNIT_SQUARE, { x: 0.5, y: 0.5, width: 1, height: 0 })).toBe(false);
  });
});

describe('polygon - intersectsBounds', () => {
  // bounds가 polygon 내부
  test('bounds가 polygon 내부에 완전히 있으면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(SQUARE_4, { minX: 1, minY: 1, maxX: 3, maxY: 3 })).toBe(true);
  });

  // polygon이 bounds 내부
  test('polygon이 bounds 내부에 완전히 있으면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(UNIT_SQUARE, { minX: -1, minY: -1, maxX: 2, maxY: 2 })).toBe(true);
  });

  // 겹침
  test('polygon과 bounds가 부분 겹치면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(UNIT_SQUARE, { minX: 0.5, minY: 0.5, maxX: 1.5, maxY: 1.5 })).toBe(true);
  });

  // 완전히 외부
  test('polygon과 bounds가 완전히 분리되면 false를 반환한다', () => {
    expect(intersectsPolygonBounds(UNIT_SQUARE, { minX: 5, minY: 5, maxX: 7, maxY: 7 })).toBe(false);
  });

  // edge 교차
  test('polygon edge와 bounds edge가 교차하면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(CCW_TRI, { minX: 1, minY: 1, maxX: 3, maxY: 3 })).toBe(true);
  });

  // empty polygon
  test('empty polygon은 false를 반환한다', () => {
    expect(intersectsPolygonBounds(EMPTY, { minX: 0, minY: 0, maxX: 10, maxY: 10 })).toBe(false);
  });

  // inverted (empty) bounds
  test('inverted bounds(min > max)는 false를 반환한다', () => {
    expect(intersectsPolygonBounds(UNIT_SQUARE, { minX: 5, minY: 5, maxX: 0, maxY: 0 })).toBe(false);
  });
});
