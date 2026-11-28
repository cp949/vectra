/**
 * 삼각형과 선분·ray·무한 직선의 교차 판정과 단일 교점 함수를 검증한다.
 * Into 함수의 out 기록 정책과 allocating companion의 반환값을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsTriangleInfiniteLine } from '../../../src/intersects/intersects-triangle-infinite-line';
import { intersectsTriangleRay } from '../../../src/intersects/intersects-triangle-ray';
import { intersectsTriangleSegment } from '../../../src/intersects/intersects-triangle-segment';
import { singleIntersectionInfiniteLineTriangle } from '../../../src/intersects/single-intersection-infinite-line-triangle';
import { singleIntersectionInfiniteLineTriangleInto } from '../../../src/intersects/single-intersection-infinite-line-triangle-into';
import { singleIntersectionRayTriangle } from '../../../src/intersects/single-intersection-ray-triangle';
import { singleIntersectionRayTriangleInto } from '../../../src/intersects/single-intersection-ray-triangle-into';
import { singleIntersectionSegmentTriangle } from '../../../src/intersects/single-intersection-segment-triangle';
import { singleIntersectionSegmentTriangleInto } from '../../../src/intersects/single-intersection-segment-triangle-into';

// triangle: { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 4 } } (이등변삼각형)
// 3개 변: AB=(0,0)→(4,0), BC=(4,0)→(2,4), CA=(2,4)→(0,0)

describe('intersectsTriangleSegment', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('miss: triangle 밖을 지나는 line은 false를 반환한다', () => {
    const line = { x1: 5, y1: 0, x2: 5, y2: 4 };
    expect(intersectsTriangleSegment(tri, line)).toBe(false);
  });

  test('vertex touch: vertex를 정확히 통과하는 line은 true를 반환한다', () => {
    // (-1,-1)→(1,1): (0,0) vertex를 통과
    const line = { x1: -1, y1: -1, x2: 1, y2: 1 };
    expect(intersectsTriangleSegment(tri, line)).toBe(true);
  });

  test('single edge hit: 한 edge를 관통 → true', () => {
    // (2,-1)→(2,0.5): bottom edge (y=0)을 관통하고 triangle 밖으로 나가지 않음
    const line = { x1: 2, y1: -1, x2: 2, y2: 0.5 };
    expect(intersectsTriangleSegment(tri, line)).toBe(true);
  });

  test('through-triangle 2-edge: 두 edge 관통 → true', () => {
    const line = { x1: 2, y1: -1, x2: 2, y2: 5 };
    expect(intersectsTriangleSegment(tri, line)).toBe(true);
  });

  test('degenerate triangle: false를 반환한다', () => {
    const degenTri = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const line = { x1: 0, y1: -1, x2: 4, y2: 1 };
    expect(intersectsTriangleSegment(degenTri, line)).toBe(false);
  });

  test('segment이 triangle 내부에 완전히 포함 → true', () => {
    const line = { x1: 2, y1: 1, x2: 2, y2: 2 };
    expect(intersectsTriangleSegment(tri, line)).toBe(true);
  });
});

describe('singleIntersectionSegmentTriangleInto', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 5, y1: 0, x2: 5, y2: 4 };
    expect(singleIntersectionSegmentTriangleInto(out, line, tri)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('single edge hit: 교점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // (2,-1)→(2,0.5): bottom edge hit at (2,0)
    const line = { x1: 2, y1: -1, x2: 2, y2: 0.5 };
    expect(singleIntersectionSegmentTriangleInto(out, line, tri)).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(0);
  });

  test('2-edge hit: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 2, y1: -1, x2: 2, y2: 5 };
    expect(singleIntersectionSegmentTriangleInto(out, line, tri)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('내부 포함 (0 edge hit): false를 반환한다', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 2, y1: 1, x2: 2, y2: 2 };
    expect(singleIntersectionSegmentTriangleInto(out, line, tri)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('degenerate triangle: false를 반환한다', () => {
    const out = { x: 99, y: 99 };
    const degenTri = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const line = { x1: 2, y1: -1, x2: 2, y2: 1 };
    expect(singleIntersectionSegmentTriangleInto(out, line, degenTri)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionSegmentTriangle (allocating companion)', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('miss: undefined를 반환한다', () => {
    const line = { x1: 5, y1: 0, x2: 5, y2: 4 };
    expect(singleIntersectionSegmentTriangle(line, tri)).toBeUndefined();
  });

  test('single edge hit: 교점 object를 반환한다', () => {
    const line = { x1: 2, y1: -1, x2: 2, y2: 0.5 };
    const result = singleIntersectionSegmentTriangle(line, tri);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2);
    expect(result?.y).toBeCloseTo(0);
  });

  test('2-edge hit: undefined를 반환한다', () => {
    const line = { x1: 2, y1: -1, x2: 2, y2: 5 };
    expect(singleIntersectionSegmentTriangle(line, tri)).toBeUndefined();
  });
});

describe('intersectsTriangleRay', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('triangle을 향하는 ray는 true를 반환한다', () => {
    const ray = { ox: 2, oy: -2, dx: 0, dy: 1 };
    expect(intersectsTriangleRay(tri, ray)).toBe(true);
  });

  test('반대 방향 ray는 false를 반환한다', () => {
    const ray = { ox: 2, oy: -2, dx: 0, dy: -1 };
    expect(intersectsTriangleRay(tri, ray)).toBe(false);
  });

  test('degenerate triangle: false를 반환한다', () => {
    const degenTri = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const ray = { ox: 2, oy: -2, dx: 0, dy: 1 };
    expect(intersectsTriangleRay(degenTri, ray)).toBe(false);
  });
});

describe('intersectsTriangleInfiniteLine', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('triangle을 관통하는 infinite-line은 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 1, dx: 1, dy: 0 };
    expect(intersectsTriangleInfiniteLine(tri, infLine)).toBe(true);
  });

  test('triangle 밖을 지나는 infinite-line은 false를 반환한다', () => {
    const infLine = { ox: 0, oy: 5, dx: 1, dy: 0 };
    expect(intersectsTriangleInfiniteLine(tri, infLine)).toBe(false);
  });

  test('degenerate triangle: false를 반환한다', () => {
    const degenTri = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const infLine = { ox: 0, oy: 1, dx: 1, dy: 0 };
    expect(intersectsTriangleInfiniteLine(degenTri, infLine)).toBe(false);
  });
});

describe('singleIntersectionRayTriangleInto', () => {
  // tri: a(0,0) b(4,0) c(2,4)
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('내부에서 한 edge exit — 교점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // ray origin (2,1) 내부, dir (0,-1): bottom edge (y=0) 에서 exit at (2,0)
    const ray = { ox: 2, oy: 1, dx: 0, dy: -1 };
    expect(singleIntersectionRayTriangleInto(out, ray, tri)).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(0);
  });

  test('2-edge hit (외부 → 관통): false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    // ray origin (2,-2) dir (0,1): bottom at (2,0), BC/CA edge → 2 hits
    const ray = { ox: 2, oy: -2, dx: 0, dy: 1 };
    expect(singleIntersectionRayTriangleInto(out, ray, tri)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: 2, oy: -2, dx: 0, dy: -1 };
    expect(singleIntersectionRayTriangleInto(out, ray, tri)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionRayTriangle (allocating companion)', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('miss: undefined를 반환한다', () => {
    const ray = { ox: 2, oy: -2, dx: 0, dy: -1 };
    expect(singleIntersectionRayTriangle(ray, tri)).toBeUndefined();
  });

  test('내부 exit: 교점 object를 반환한다', () => {
    // origin (2,1) 내부, dir (0,-1) → bottom at (2,0)
    const ray = { ox: 2, oy: 1, dx: 0, dy: -1 };
    const result = singleIntersectionRayTriangle(ray, tri);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2);
    expect(result?.y).toBeCloseTo(0);
  });
});

describe('singleIntersectionInfiniteLineTriangleInto', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('2-edge hit: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 1, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineTriangleInto(out, infLine, tri)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 5, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineTriangleInto(out, infLine, tri)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('degenerate triangle: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const degenTri = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const infLine = { ox: 0, oy: 1, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineTriangleInto(out, infLine, degenTri)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionInfiniteLineTriangle (allocating companion)', () => {
  const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };

  test('2-edge hit: undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 1, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineTriangle(infLine, tri)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 5, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineTriangle(infLine, tri)).toBeUndefined();
  });
});
