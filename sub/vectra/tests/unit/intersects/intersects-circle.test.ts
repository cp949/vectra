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

// circle: { center: { x: 3, y: 3 }, radius: 2 }
// disk: x∈[1,5], y∈[1,5]

describe('intersectsCircleSegment', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('miss: circle 밖을 지나는 line은 false를 반환한다', () => {
    // y=6인 선, circle bottom이 y=5 → miss
    const line = { a: { x: 0, y: 6 }, b: { x: 6, y: 6 } };
    expect(intersectsCircleSegment(circle, line)).toBe(false);
  });

  test('tangent: circle에 접하는 line은 true를 반환한다', () => {
    // y=5인 수평선이 circle 상단에 접함 (접점: 3,5)
    const line = { a: { x: 0, y: 5 }, b: { x: 6, y: 5 } };
    expect(intersectsCircleSegment(circle, line)).toBe(true);
  });

  test('2-point crossing: circle을 관통하는 line은 true를 반환한다', () => {
    const line = { a: { x: 0, y: 3 }, b: { x: 6, y: 3 } };
    expect(intersectsCircleSegment(circle, line)).toBe(true);
  });

  test('empty circle (radius=0): false를 반환한다', () => {
    const line = { a: { x: 0, y: 3 }, b: { x: 6, y: 3 } };
    expect(intersectsCircleSegment({ center: { x: 3, y: 3 }, radius: 0 }, line)).toBe(false);
  });

  test('empty circle (radius<0): false를 반환한다', () => {
    const line = { a: { x: 0, y: 3 }, b: { x: 6, y: 3 } };
    expect(intersectsCircleSegment({ center: { x: 3, y: 3 }, radius: -1 }, line)).toBe(false);
  });

  test('line이 circle 내부에 완전히 포함: true를 반환한다', () => {
    // center 근처 짧은 선분 — 완전히 disk 내부
    const line = { a: { x: 3, y: 3 }, b: { x: 3.5, y: 3 } };
    expect(intersectsCircleSegment(circle, line)).toBe(true);
  });
});

describe('singleIntersectionSegmentCircleInto', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const line = { a: { x: 0, y: 5 }, b: { x: 6, y: 5 } };
    expect(singleIntersectionSegmentCircleInto(out, line, circle)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(5);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: 0, y: 3 }, b: { x: 6, y: 3 } };
    expect(singleIntersectionSegmentCircleInto(out, line, circle)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: 0, y: 6 }, b: { x: 6, y: 6 } };
    expect(singleIntersectionSegmentCircleInto(out, line, circle)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('empty circle: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: 0, y: 5 }, b: { x: 6, y: 5 } };
    expect(singleIntersectionSegmentCircleInto(out, line, { center: { x: 3, y: 3 }, radius: 0 })).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionSegmentCircle (allocating companion)', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('tangent: 접점 object를 반환한다', () => {
    const line = { a: { x: 0, y: 5 }, b: { x: 6, y: 5 } };
    const result = singleIntersectionSegmentCircle(line, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(5);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const line = { a: { x: 0, y: 3 }, b: { x: 6, y: 3 } };
    expect(singleIntersectionSegmentCircle(line, circle)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const line = { a: { x: 0, y: 6 }, b: { x: 6, y: 6 } };
    expect(singleIntersectionSegmentCircle(line, circle)).toBeUndefined();
  });
});

describe('intersectsCircleRay', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('ray origin이 circle 내부: true를 반환한다', () => {
    // origin at (3,3) = center, inside circle
    const ray = { origin: { x: 3, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleRay(circle, ray)).toBe(true);
  });

  test('ray가 circle을 향하는 경우: true를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleRay(circle, ray)).toBe(true);
  });

  test('ray가 반대 방향: false를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: -1, y: 0 } };
    expect(intersectsCircleRay(circle, ray)).toBe(false);
  });

  test('empty circle: false를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleRay({ center: { x: 3, y: 3 }, radius: 0 }, ray)).toBe(false);
  });
});

describe('singleIntersectionRayCircleInto (contained origin)', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('ray origin이 내부일 때 exit point를 기록한다', () => {
    const out = { x: 0, y: 0 };
    // origin at center (3,3), dir (1,0) → exit at (5,3)
    const ray = { origin: { x: 3, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayCircleInto(out, ray, circle)).toBe(true);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(3);
  });

  test('ray가 circle에 tangent (x축 방향): 접점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    // origin (0, 5), dir (1, 0): circle 상단에 tangent (접점: 3, 5)
    const ray = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayCircleInto(out, ray, circle)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(5);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    // ray가 circle을 2점에서 관통
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayCircleInto(out, ray, circle)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('intersectsCircleInfiniteLine', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('infinite-line이 circle을 관통하면 true를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleInfiniteLine(circle, infLine)).toBe(true);
  });

  test('infinite-line이 circle 밖을 지나면 false를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 6 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleInfiniteLine(circle, infLine)).toBe(false);
  });

  test('infinite-line이 circle에 접하면 true를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleInfiniteLine(circle, infLine)).toBe(true);
  });

  test('empty circle: false를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsCircleInfiniteLine({ center: { x: 3, y: 3 }, radius: 0 }, infLine)).toBe(false);
  });
});

describe('singleIntersectionRayCircle (allocating companion)', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('tangent: 접점 object를 반환한다', () => {
    // ray origin (0,5) dir (1,0): tangent at (3,5)
    const ray = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    const result = singleIntersectionRayCircle(ray, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(5);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayCircle(ray, circle)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: -1, y: 0 } };
    expect(singleIntersectionRayCircle(ray, circle)).toBeUndefined();
  });

  test('ray origin 내부 exit: exit point object를 반환한다', () => {
    // origin at center (3,3), dir (1,0) → exit at (5,3)
    const ray = { origin: { x: 3, y: 3 }, direction: { x: 1, y: 0 } };
    const result = singleIntersectionRayCircle(ray, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(5);
    expect(result?.y).toBeCloseTo(3);
  });
});

describe('singleIntersectionInfiniteLineCircleInto', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const infLine = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineCircleInto(out, infLine, circle)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(5);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineCircleInto(out, infLine, circle)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 6 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineCircleInto(out, infLine, circle)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionInfiniteLineCircle (allocating companion)', () => {
  const circle = { center: { x: 3, y: 3 }, radius: 2 };

  test('tangent: 접점 object를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    const result = singleIntersectionInfiniteLineCircle(infLine, circle);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(5);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineCircle(infLine, circle)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 6 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineCircle(infLine, circle)).toBeUndefined();
  });
});
