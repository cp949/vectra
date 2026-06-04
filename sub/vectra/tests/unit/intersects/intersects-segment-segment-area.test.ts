import { describe, expect, test } from 'vitest';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { singleIntersectionInto } from '../../../src/segment/single-intersection-into';
import type { XYWritable } from '../../../src/types';

describe('intersectsSegment — X자 교차', () => {
  test('X자 교차 segment는 true를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const b = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('인자 순서를 뒤집어도 동일한 결과를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const b = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(b, a)).toBe(true);
  });
});

describe('intersectsSegment — endpoint touch', () => {
  test('shared endpoint touch는 true를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 5 } };
    const b = { a: { x: 5, y: 5 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('T자 교차 (b endpoint가 a interior에 닿음)는 true를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: -5 }, b: { x: 5, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });
});

describe('intersectsSegment — parallel disjoint', () => {
  test('평행하고 겹치지 않는 segment는 false를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 0, y: 1 }, b: { x: 10, y: 1 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
  });
});

describe('intersectsSegment — collinear', () => {
  test('collinear overlap segment는 true를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 15, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('collinear endpoint touch (한 점만 공유)는 true를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('collinear non-overlap segment는 false를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 6, y: 0 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
  });
});

describe('intersectsSegment — zero-length segment', () => {
  test('zero-length segment가 normal segment 위에 있으면 true를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 5, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('zero-length segment가 normal segment 위에 없으면 false를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 1 }, b: { x: 5, y: 1 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
  });

  test('normal segment가 zero-length segment 위에 있으면 true를 반환한다 (인자 순서 반전)', () => {
    const a = { a: { x: 5, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('두 zero-length segment가 정확히 같은 점이면 true를 반환한다', () => {
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('두 zero-length segment가 다른 점이면 false를 반환한다', () => {
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 5, y: 6 }, b: { x: 5, y: 6 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
  });

  test('두 zero-length segment가 epsilon 이내 거리이면 true를 반환한다', () => {
    // distance = 1e-10 < epsilon = 1e-9 → (1e-10)² = 1e-20 ≤ (1e-9)² = 1e-18
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 3 + 1e-10, y: 4 }, b: { x: 3 + 1e-10, y: 4 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
  });

  test('두 zero-length segment가 epsilon을 초과하는 거리이면 false를 반환한다', () => {
    // distance = 1e-8 > epsilon = 1e-9 → (1e-8)² = 1e-16 > (1e-9)² = 1e-18
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 3 + 1e-8, y: 4 }, b: { x: 3 + 1e-8, y: 4 } };
    expect(intersectsSegmentSegment(a, b)).toBe(false);
  });
});

describe('intersectsSegment vs singleIntersectionInto 정책 일관성', () => {
  test('intersectsSegment === true인 일반 교차는 singleIntersectionInto도 true이다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const b = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(singleIntersectionInto(out, a, b)).toBe(true);
  });

  test('collinear overlap은 intersectsSegment === true, singleIntersectionInto === false이다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 15, y: 0 } };
    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(singleIntersectionInto(out, a, b)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });
});
