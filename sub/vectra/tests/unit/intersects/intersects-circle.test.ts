/** 원과 선분·반직선·직선의 교차 판정과 단일 교점을 확인한다. */
import { describe, expect, test } from 'vitest';
import { intersectsCircleInfiniteLine } from '../../../src/intersects/intersects-circle-infinite-line';
import { intersectsCircleRay } from '../../../src/intersects/intersects-circle-ray';
import { intersectsCircleSegment } from '../../../src/intersects/intersects-circle-segment';
import { singleIntersectionInfiniteLineCircle } from '../../../src/intersects/single-intersection-infinite-line-circle';
import { singleIntersectionInfiniteLineCircleInto } from '../../../src/intersects/single-intersection-infinite-line-circle-into';
import { singleIntersectionRayCircle } from '../../../src/intersects/single-intersection-ray-circle';
import { singleIntersectionRayCircleInto } from '../../../src/intersects/single-intersection-ray-circle-into';
import { singleIntersectionSegmentCircle } from '../../../src/intersects/single-intersection-segment-circle';
import { singleIntersectionSegmentCircleInto } from '../../../src/intersects/single-intersection-segment-circle-into';

// circle: { cx: 3, cy: 3, r: 2 }
// disk: x∈[1,5], y∈[1,5]

describe('intersectsCircleSegment', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('miss: circle 밖을 지나는 line은 false를 반환한다', () => {
    // y=6인 선, circle bottom이 y=5 → miss
    const line = { x1: 0, y1: 6, x2: 6, y2: 6 };
    expect(intersectsCircleSegment(circle, line)).toBe(false);
  });

  test('tangent: circle에 접하는 line은 true를 반환한다', () => {
    // y=5인 수평선이 circle 상단에 접함 (접점: 3,5)
    const line = { x1: 0, y1: 5, x2: 6, y2: 5 };
    expect(intersectsCircleSegment(circle, line)).toBe(true);
  });

  test('2-point crossing: circle을 관통하는 line은 true를 반환한다', () => {
    const line = { x1: 0, y1: 3, x2: 6, y2: 3 };
    expect(intersectsCircleSegment(circle, line)).toBe(true);
  });

  test('empty circle (r=0): false를 반환한다', () => {
    const line = { x1: 0, y1: 3, x2: 6, y2: 3 };
    expect(intersectsCircleSegment({ cx: 3, cy: 3, r: 0 }, line)).toBe(false);
  });

  test('empty circle (r<0): false를 반환한다', () => {
    const line = { x1: 0, y1: 3, x2: 6, y2: 3 };
    expect(intersectsCircleSegment({ cx: 3, cy: 3, r: -1 }, line)).toBe(false);
  });

  test('line이 circle 내부에 완전히 포함: true를 반환한다', () => {
    // center 근처 짧은 선분 — 완전히 disk 내부
    const line = { x1: 3, y1: 3, x2: 3.5, y2: 3 };
    expect(intersectsCircleSegment(circle, line)).toBe(true);
  });
});

describe('singleIntersectionSegmentCircleInto', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const line = { x1: 0, y1: 5, x2: 6, y2: 5 };
    expect(singleIntersectionSegmentCircleInto(out, line, circle)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(5);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 3, x2: 6, y2: 3 };
    expect(singleIntersectionSegmentCircleInto(out, line, circle)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 6, x2: 6, y2: 6 };
    expect(singleIntersectionSegmentCircleInto(out, line, circle)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('empty circle: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 5, x2: 6, y2: 5 };
    expect(singleIntersectionSegmentCircleInto(out, line, { cx: 3, cy: 3, r: 0 })).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionSegmentCircle (allocating companion)', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('tangent: 접점 object를 반환한다', () => {
    const line = { x1: 0, y1: 5, x2: 6, y2: 5 };
    const result = singleIntersectionSegmentCircle(line, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(5);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const line = { x1: 0, y1: 3, x2: 6, y2: 3 };
    expect(singleIntersectionSegmentCircle(line, circle)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const line = { x1: 0, y1: 6, x2: 6, y2: 6 };
    expect(singleIntersectionSegmentCircle(line, circle)).toBeUndefined();
  });
});

describe('intersectsCircleRay', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('ray 시작점 (ox, oy)가 circle 내부: true를 반환한다', () => {
    // origin at (3,3) = center, inside circle
    const ray = { ox: 3, oy: 3, dx: 1, dy: 0 };
    expect(intersectsCircleRay(circle, ray)).toBe(true);
  });

  test('ray가 circle을 향하는 경우: true를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsCircleRay(circle, ray)).toBe(true);
  });

  test('ray가 반대 방향: false를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: -1, dy: 0 };
    expect(intersectsCircleRay(circle, ray)).toBe(false);
  });

  test('empty circle: false를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsCircleRay({ cx: 3, cy: 3, r: 0 }, ray)).toBe(false);
  });
});

describe('singleIntersectionRayCircleInto (시작점이 circle 내부)', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('ray 시작점 (ox, oy)가 내부일 때 exit point를 기록한다', () => {
    const out = { x: 0, y: 0 };
    // origin at center (3,3), dir (1,0) → exit at (5,3)
    const ray = { ox: 3, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionRayCircleInto(out, ray, circle)).toBe(true);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(3);
  });

  test('ray가 circle에 tangent (x축 방향): 접점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    // origin (0, 5), dir (1, 0): circle 상단에 tangent (접점: 3, 5)
    const ray = { ox: 0, oy: 5, dx: 1, dy: 0 };
    expect(singleIntersectionRayCircleInto(out, ray, circle)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(5);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    // ray가 circle을 2점에서 관통
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionRayCircleInto(out, ray, circle)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('intersectsCircleInfiniteLine', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('infinite-line이 circle을 관통하면 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsCircleInfiniteLine(circle, infLine)).toBe(true);
  });

  test('infinite-line이 circle 밖을 지나면 false를 반환한다', () => {
    const infLine = { ox: 0, oy: 6, dx: 1, dy: 0 };
    expect(intersectsCircleInfiniteLine(circle, infLine)).toBe(false);
  });

  test('infinite-line이 circle에 접하면 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 5, dx: 1, dy: 0 };
    expect(intersectsCircleInfiniteLine(circle, infLine)).toBe(true);
  });

  test('empty circle: false를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsCircleInfiniteLine({ cx: 3, cy: 3, r: 0 }, infLine)).toBe(false);
  });
});

describe('singleIntersectionRayCircle (allocating companion)', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('tangent: 접점 object를 반환한다', () => {
    // ray origin (0,5) dir (1,0): tangent at (3,5)
    const ray = { ox: 0, oy: 5, dx: 1, dy: 0 };
    const result = singleIntersectionRayCircle(ray, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(5);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionRayCircle(ray, circle)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: -1, dy: 0 };
    expect(singleIntersectionRayCircle(ray, circle)).toBeUndefined();
  });

  test('ray 시작점 (ox, oy)가 내부일 때 exit point object를 반환한다', () => {
    // origin at center (3,3), dir (1,0) → exit at (5,3)
    const ray = { ox: 3, oy: 3, dx: 1, dy: 0 };
    const result = singleIntersectionRayCircle(ray, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(5);
    expect(result?.y).toBeCloseTo(3);
  });
});

describe('singleIntersectionInfiniteLineCircleInto', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const infLine = { ox: 0, oy: 5, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineCircleInto(out, infLine, circle)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(5);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineCircleInto(out, infLine, circle)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 6, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineCircleInto(out, infLine, circle)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionInfiniteLineCircle (allocating companion)', () => {
  const circle = { cx: 3, cy: 3, r: 2 };

  test('tangent: 접점 object를 반환한다', () => {
    const infLine = { ox: 0, oy: 5, dx: 1, dy: 0 };
    const result = singleIntersectionInfiniteLineCircle(infLine, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(5);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineCircle(infLine, circle)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 6, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineCircle(infLine, circle)).toBeUndefined();
  });
});
