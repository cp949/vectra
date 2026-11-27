/**
 * triangle 측정과 query helper를 검증한다.
 * perimeter, centroid, bounds, containsPoint 동작을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/triangle/bounds';
import { boundsInto } from '../../../src/triangle/bounds-into';
import { centroid } from '../../../src/triangle/centroid';
import { centroidInto } from '../../../src/triangle/centroid-into';
import { containsPoint } from '../../../src/triangle/contains-point';
import { perimeter } from '../../../src/triangle/perimeter';

describe('perimeter', () => {
  test('3-4-5 triangle: 둘레가 12다', () => {
    // a(0,0), b(3,0), c(0,4): AB=3, AC=4, BC=5
    const t = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    expect(perimeter(t)).toBe(12);
  });

  test('정삼각형: 세 변이 동일하다', () => {
    // 한 변이 2인 정삼각형
    const side = 2;
    const t = { x1: 0, y1: 0, x2: side, y2: 0, x3: side / 2, y3: (Math.sqrt(3) / 2) * side };
    // 각 변 길이가 모두 side에 매우 가깝다
    expect(perimeter(t)).toBeCloseTo(3 * side, 10);
  });

  test('degenerate collinear triangle: 변 길이 합을 반환한다', () => {
    // a(0,0), b(2,0), c(4,0): AB=2, BC=2, CA=4
    const t = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    expect(perimeter(t)).toBe(8);
  });

  test('CW triangle도 CCW와 같은 둘레를 반환한다', () => {
    const ccw = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    const cw = { x1: 0, y1: 0, x2: 0, y2: 4, x3: 3, y3: 0 };
    expect(perimeter(ccw)).toBe(perimeter(cw));
  });
});

describe('centroidInto', () => {
  test('정삼각형의 centroid를 out에 기록하고 out을 반환한다', () => {
    // a(0,0) b(6,0) c(3,6): centroid = (3, 2)
    const t = { x1: 0, y1: 0, x2: 6, y2: 0, x3: 3, y3: 6 };
    const out = { x: 0, y: 0 };
    const result = centroidInto(out, t);
    expect(result).toBe(out);
    expect(result.x).toBe(3);
    expect(result.y).toBe(2);
  });

  test('직각삼각형의 centroid를 계산한다', () => {
    // a(0,0) b(3,0) c(0,3): centroid = (1, 1)
    const t = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 3 };
    const out = { x: 0, y: 0 };
    centroidInto(out, t);
    expect(out.x).toBe(1);
    expect(out.y).toBe(1);
  });

  test('degenerate collinear triangle도 arithmetic mean을 계산한다', () => {
    // a(0,0) b(2,0) c(4,0): centroid = (2, 0)
    const t = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const out = { x: 0, y: 0 };
    centroidInto(out, t);
    expect(out.x).toBe(2);
    expect(out.y).toBe(0);
  });
});

describe('centroid', () => {
  test('plain object { x, y }를 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 6, y2: 0, x3: 3, y3: 6 };
    const result = centroid(t);
    expect(result).toEqual({ x: 3, y: 2 });
  });

  test('degenerate triangle도 arithmetic mean을 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    expect(centroid(t)).toEqual({ x: 2, y: 0 });
  });
});

describe('boundsInto', () => {
  test('vertex 순서에 관계없이 실제 min/max를 계산해 out에 기록하고 반환한다', () => {
    // a(4,3) b(0,0) c(2,5): minX=0 minY=0 maxX=4 maxY=5
    const t = { x1: 4, y1: 3, x2: 0, y2: 0, x3: 2, y3: 5 };
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const result = boundsInto(out, t);
    expect(result).toBe(out);
    expect(result).toMatchObject({ minX: 0, minY: 0 });
    expect(result).toMatchObject({ maxX: 4, maxY: 5 });
  });

  test('degenerate triangle(점 하나로 수렴)도 실제 extent를 기록한다', () => {
    // a(1,2) b(1,2) c(1,2): min = max = (1, 2)
    const t = { x1: 1, y1: 2, x2: 1, y2: 2, x3: 1, y3: 2 };
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    boundsInto(out, t);
    expect(out).toMatchObject({ minX: 1, minY: 2 });
    expect(out).toMatchObject({ maxX: 1, maxY: 2 });
  });

  test('collinear triangle의 bounds를 계산한다', () => {
    // a(0,0) b(4,0) c(2,0): minX=0 maxX=4 minY=maxY=0
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 0 };
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    boundsInto(out, t);
    expect(out).toMatchObject({ minX: 0, minY: 0 });
    expect(out).toMatchObject({ maxX: 4, maxY: 0 });
  });
});

describe('bounds', () => {
  test('plain object { minX, minY, maxX, maxY }를 반환한다', () => {
    const t = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };
    expect(bounds(t)).toEqual({ minX: 0, minY: 0, maxX: 4, maxY: 3 });
  });

  test('음수 좌표 vertex도 올바른 min/max를 반환한다', () => {
    const t = { x1: -2, y1: -3, x2: 1, y2: 0, x3: 0, y3: 2 };
    expect(bounds(t)).toEqual({ minX: -2, minY: -3, maxX: 1, maxY: 2 });
  });
});

describe('containsPoint', () => {
  // CCW triangle: a(0,0) b(4,0) c(0,4)
  const ccwTriangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };

  test('내부 point는 true를 반환한다', () => {
    expect(containsPoint(ccwTriangle, { x: 1, y: 1 })).toBe(true);
  });

  test('외부 point는 false를 반환한다', () => {
    expect(containsPoint(ccwTriangle, { x: 5, y: 5 })).toBe(false);
  });

  test('edge 위 point는 true를 반환한다', () => {
    // a-b edge 위 (2, 0)
    expect(containsPoint(ccwTriangle, { x: 2, y: 0 })).toBe(true);
  });

  test('vertex 위 point는 true를 반환한다', () => {
    expect(containsPoint(ccwTriangle, { x: 0, y: 0 })).toBe(true);
  });

  test('degenerate(collinear) triangle은 false를 반환한다', () => {
    const degenerate = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    expect(containsPoint(degenerate, { x: 1, y: 0 })).toBe(false);
  });

  test('CW triangle도 내부 point에 true를 반환한다', () => {
    // CW: a(0,0) b(0,4) c(4,0)
    const cwTriangle = { x1: 0, y1: 0, x2: 0, y2: 4, x3: 4, y3: 0 };
    expect(containsPoint(cwTriangle, { x: 1, y: 1 })).toBe(true);
  });

  test('CW triangle 외부 point는 false를 반환한다', () => {
    const cwTriangle = { x1: 0, y1: 0, x2: 0, y2: 4, x3: 4, y3: 0 };
    expect(containsPoint(cwTriangle, { x: 5, y: 5 })).toBe(false);
  });

  test('epsilon을 지정하면 경계 근방 point를 허용한다', () => {
    // epsilon=0.1이면 경계에서 0.1 이내 point도 true
    expect(containsPoint(ccwTriangle, { x: -0.05, y: 2 }, 0.1)).toBe(true);
  });
});
