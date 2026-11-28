import { describe, expect, test } from 'vitest';
import { intersectsBoundsInfiniteLine } from '../../../src/intersects/intersects-bounds-infinite-line';
import { intersectsBoundsRay } from '../../../src/intersects/intersects-bounds-ray';
import { intersectsBoundsSegment } from '../../../src/intersects/intersects-bounds-segment';
import { singleIntersectionInfiniteLineBounds } from '../../../src/intersects/single-intersection-infinite-line-bounds';
import { singleIntersectionInfiniteLineBoundsInto } from '../../../src/intersects/single-intersection-infinite-line-bounds-into';
import { singleIntersectionRayBounds } from '../../../src/intersects/single-intersection-ray-bounds';
import { singleIntersectionRayBoundsInto } from '../../../src/intersects/single-intersection-ray-bounds-into';
import { singleIntersectionSegmentBounds } from '../../../src/intersects/single-intersection-segment-bounds';
import { singleIntersectionSegmentBoundsInto } from '../../../src/intersects/single-intersection-segment-bounds-into';

// bounds: { minX: 1, minY: 1, maxX: 5, maxY: 5 } — rect와 동등

describe('intersectsBoundsSegment', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  describe('miss', () => {
    test('bounds 밖에서 교차하지 않는 선은 false를 반환한다', () => {
      // x=0인 수직선, bounds left가 x=1 → miss
      const line = { x1: 0, y1: 0, x2: 0, y2: 5 };
      expect(intersectsBoundsSegment(bounds, line)).toBe(false);
    });

    test('inverted bounds (min.x > max.x): false를 반환한다', () => {
      const line = { x1: 0, y1: 3, x2: 10, y2: 3 };
      expect(intersectsBoundsSegment({ minX: 5, minY: 1, maxX: 1, maxY: 5 }, line)).toBe(false);
    });

    test('inverted bounds (min.y > max.y): false를 반환한다', () => {
      const line = { x1: 0, y1: 3, x2: 10, y2: 3 };
      expect(intersectsBoundsSegment({ minX: 1, minY: 5, maxX: 5, maxY: 1 }, line)).toBe(false);
    });
  });

  describe('single side hit', () => {
    test('left side를 한 번 관통하는 선은 true를 반환한다', () => {
      const line = { x1: 0, y1: 3, x2: 2, y2: 3 };
      expect(intersectsBoundsSegment(bounds, line)).toBe(true);
    });
  });

  describe('corner touch', () => {
    test('corner를 정확히 통과하는 선은 true를 반환한다', () => {
      // (0,0)→(2,2): corner (1,1)을 통과
      const line = { x1: 0, y1: 0, x2: 2, y2: 2 };
      expect(intersectsBoundsSegment(bounds, line)).toBe(true);
    });
  });

  describe('through-bounds 2-side hit', () => {
    test('bounds를 관통하는 선은 true를 반환한다', () => {
      const line = { x1: 0, y1: 3, x2: 10, y2: 3 };
      expect(intersectsBoundsSegment(bounds, line)).toBe(true);
    });
  });
});

describe('singleIntersectionSegmentBoundsInto', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('교점 없을 때 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 0, x2: 0, y2: 5 };
    expect(singleIntersectionSegmentBoundsInto(out, line, bounds)).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('left side hit 시 교점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const line = { x1: 0, y1: 3, x2: 2, y2: 3 };
    expect(singleIntersectionSegmentBoundsInto(out, line, bounds)).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(3);
  });

  test('2-side hit 시 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 3, x2: 10, y2: 3 };
    expect(singleIntersectionSegmentBoundsInto(out, line, bounds)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('corner touch 시 교점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const line = { x1: 0, y1: 0, x2: 2, y2: 2 };
    const result = singleIntersectionSegmentBoundsInto(out, line, bounds);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });

  test('inverted bounds는 false를 반환한다', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 3, x2: 10, y2: 3 };
    expect(singleIntersectionSegmentBoundsInto(out, line, { minX: 5, minY: 1, maxX: 1, maxY: 5 })).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionSegmentBounds (allocating companion)', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('교점 없을 때 undefined를 반환한다', () => {
    const line = { x1: 0, y1: 0, x2: 0, y2: 5 };
    expect(singleIntersectionSegmentBounds(line, bounds)).toBeUndefined();
  });

  test('single side hit 시 교점 object를 반환한다', () => {
    const line = { x1: 0, y1: 3, x2: 2, y2: 3 };
    const result = singleIntersectionSegmentBounds(line, bounds);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(1);
    expect(result?.y).toBeCloseTo(3);
  });

  test('2-side hit 시 undefined를 반환한다', () => {
    const line = { x1: 0, y1: 3, x2: 10, y2: 3 };
    expect(singleIntersectionSegmentBounds(line, bounds)).toBeUndefined();
  });
});

describe('intersectsBoundsRay', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('bounds를 향하는 ray는 true를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsBoundsRay(bounds, ray)).toBe(true);
  });

  test('bounds에서 멀어지는 방향 ray는 false를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: -1, dy: 0 };
    expect(intersectsBoundsRay(bounds, ray)).toBe(false);
  });

  test('inverted bounds는 false를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsBoundsRay({ minX: 5, minY: 1, maxX: 1, maxY: 5 }, ray)).toBe(false);
  });
});

describe('intersectsBoundsInfiniteLine', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('bounds를 관통하는 infinite-line은 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsBoundsInfiniteLine(bounds, infLine)).toBe(true);
  });

  test('bounds 밖을 지나는 infinite-line은 false를 반환한다', () => {
    // y=0인 수평선 → bounds top이 y=1 → miss
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(intersectsBoundsInfiniteLine(bounds, infLine)).toBe(false);
  });

  test('inverted bounds는 false를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsBoundsInfiniteLine({ minX: 5, minY: 1, maxX: 1, maxY: 5 }, infLine)).toBe(false);
  });
});

describe('singleIntersectionRayBoundsInto', () => {
  // bounds: min(1,1) max(5,5)
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('bounds 내부에서 한 side만 exit — 교점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // origin (2,3) 내부, dir (0,-1) → top side (y=1) 에서 exit at (2,1)
    const ray = { ox: 2, oy: 3, dx: 0, dy: -1 };
    expect(singleIntersectionRayBoundsInto(out, ray, bounds)).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(1);
  });

  test('2-side hit 시 false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionRayBoundsInto(out, ray, bounds)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss 시 false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: 0, oy: 3, dx: -1, dy: 0 };
    expect(singleIntersectionRayBoundsInto(out, ray, bounds)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionRayBounds (allocating companion)', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('miss 시 undefined를 반환한다', () => {
    const ray = { ox: 0, oy: 3, dx: -1, dy: 0 };
    expect(singleIntersectionRayBounds(ray, bounds)).toBeUndefined();
  });

  test('bounds 내부 exit — 교점 object를 반환한다', () => {
    const ray = { ox: 2, oy: 3, dx: 0, dy: -1 };
    const result = singleIntersectionRayBounds(ray, bounds);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2);
    expect(result?.y).toBeCloseTo(1);
  });
});

describe('singleIntersectionInfiniteLineBoundsInto', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('2-side hit 시 false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineBoundsInto(out, infLine, bounds)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss 시 false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineBoundsInto(out, infLine, bounds)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionInfiniteLineBounds (allocating companion)', () => {
  const bounds = { minX: 1, minY: 1, maxX: 5, maxY: 5 };

  test('2-side hit 시 undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineBounds(infLine, bounds)).toBeUndefined();
  });

  test('miss 시 undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineBounds(infLine, bounds)).toBeUndefined();
  });
});
