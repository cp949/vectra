import { describe, expect, test } from 'vitest';
import { intersectsInfiniteLineRay } from '../../../src/intersects/intersects-infinite-line-ray';
import { intersectsInfiniteLineSegment } from '../../../src/intersects/intersects-infinite-line-segment';
import { intersectsRaySegment } from '../../../src/intersects/intersects-ray-segment';
import { singleIntersectionRayInfiniteLine } from '../../../src/intersects/single-intersection-ray-infinite-line';
import { singleIntersectionRayInfiniteLineInto } from '../../../src/intersects/single-intersection-ray-infinite-line-into';
import { singleIntersectionSegmentInfiniteLine } from '../../../src/intersects/single-intersection-segment-infinite-line';
import { singleIntersectionSegmentInfiniteLineInto } from '../../../src/intersects/single-intersection-segment-infinite-line-into';
import { singleIntersectionSegmentRay } from '../../../src/intersects/single-intersection-segment-ray';
import { singleIntersectionSegmentRayInto } from '../../../src/intersects/single-intersection-segment-ray-into';
import type { InfiniteLineLike, RayLike, SegmentLike, XYWritable } from '../../../src/types';

type Point = { x: number; y: number };
type SegmentRayArgs = [SegmentLike, RayLike];
type SegmentInfiniteLineArgs = [SegmentLike, InfiniteLineLike];
type RayInfiniteLineArgs = [RayLike, InfiniteLineLike];

function segment(ax: number, ay: number, bx: number, by: number): SegmentLike {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

function ray(ox: number, oy: number, dx: number, dy: number): RayLike {
  return { origin: { x: ox, y: oy }, direction: { x: dx, y: dy } };
}

function infiniteLine(ox: number, oy: number, dx: number, dy: number): InfiniteLineLike {
  return { origin: { x: ox, y: oy }, direction: { x: dx, y: dy } };
}

function expectPointClose(actual: Point | undefined, expected: Point): void {
  expect(actual).not.toBeUndefined();
  expect(actual?.x).toBeCloseTo(expected.x, 10);
  expect(actual?.y).toBeCloseTo(expected.y, 10);
}

function expectIntoHit<TArgs extends unknown[]>(
  fn: (out: XYWritable, ...args: TArgs) => boolean,
  args: TArgs,
  expected: Point
): void {
  const out: XYWritable = { x: 0, y: 0 };
  const result = fn(out, ...args);

  expect(result).toBe(true);
  expect((out as Point).x).toBeCloseTo(expected.x, 10);
  expect((out as Point).y).toBeCloseTo(expected.y, 10);
}

function expectIntoMiss<TArgs extends unknown[]>(fn: (out: XYWritable, ...args: TArgs) => boolean, args: TArgs): void {
  const sentinel = { x: 999, y: 999 };
  const result = fn(sentinel, ...args);

  expect(result).toBe(false);
  expect(sentinel.x).toBe(999);
  expect(sentinel.y).toBe(999);
}

// ─────────────────────────────────────────────────────────────────
// Group A-1: segment × ray
// ─────────────────────────────────────────────────────────────────

describe('intersectsRaySegment', () => {
  test.each([
    {
      name: 'line (0,0)→(2,0)와 ray origin(1,-1) dir(0,1)는 교차한다',
      args: [ray(1, -1, 0, 1), segment(0, 0, 2, 0)] satisfies [RayLike, SegmentLike],
      expected: true,
    },
    {
      name: 'line (0,0)→(0.5,0)와 ray origin(1,-1) dir(0,1)는 range 밖으로 교차하지 않는다',
      args: [ray(1, -1, 0, 1), segment(0, 0, 0.5, 0)] satisfies [RayLike, SegmentLike],
      expected: false,
    },
    {
      name: 'ray 역방향으로 교점이 있어도 range 밖이면 false를 반환한다',
      args: [ray(1, 1, 0, -1), segment(0, 2, 2, 2)] satisfies [RayLike, SegmentLike],
      expected: false,
    },
    {
      name: 'line (0,0)→(1,0)와 ray origin(0,1) dir(1,0)는 평행하고 교차하지 않는다',
      args: [ray(0, 1, 1, 0), segment(0, 0, 1, 0)] satisfies [RayLike, SegmentLike],
      expected: false,
    },
    {
      name: 'line (0,0)→(2,0)와 collinear ray origin(1,0) dir(1,0)는 true를 반환한다',
      args: [ray(1, 0, 1, 0), segment(0, 0, 2, 0)] satisfies [RayLike, SegmentLike],
      expected: true,
    },
    {
      name: 'line (0,0)→(1,0)와 collinear ray origin(1,0) dir(1,0)는 true를 반환한다',
      args: [ray(1, 0, 1, 0), segment(0, 0, 1, 0)] satisfies [RayLike, SegmentLike],
      expected: true,
    },
    {
      name: 'zero-length line이 ray 위에 있으면 true를 반환한다',
      args: [ray(0, 0, 1, 0), segment(1, 0, 1, 0)] satisfies [RayLike, SegmentLike],
      expected: true,
    },
    {
      name: 'zero-length line이 ray range 밖이면 false를 반환한다',
      args: [ray(0, 0, 1, 0), segment(-1, 0, -1, 0)] satisfies [RayLike, SegmentLike],
      expected: false,
    },
  ])('$name', ({ args, expected }) => {
    expect(intersectsRaySegment(...args)).toBe(expected);
  });

  describe('tuple/object input 혼합', () => {
    test('tuple line과 object ray 입력은 object 입력과 같은 결과를 반환한다', () => {
      const lineTuple: [readonly [number, number], readonly [number, number]] = [
        [0, 0],
        [2, 0],
      ];
      const rayObj = ray(1, -1, 0, 1);
      const lineObj = segment(0, 0, 2, 0);
      expect(intersectsRaySegment(rayObj, lineTuple)).toBe(intersectsRaySegment(rayObj, lineObj));
    });

    test('object line과 tuple ray 입력은 object 입력과 같은 결과를 반환한다', () => {
      const lineObj = segment(0, 0, 2, 0);
      const rayTuple: readonly [number, number, number, number] = [1, -1, 0, 1];
      const rayObj = ray(1, -1, 0, 1);
      expect(intersectsRaySegment(rayTuple, lineObj)).toBe(intersectsRaySegment(rayObj, lineObj));
    });
  });
});

describe('singleIntersectionSegmentRayInto', () => {
  test.each([
    {
      name: '교점 (1,0)을 out에 기록하고 true를 반환한다',
      args: [segment(0, 0, 2, 0), ray(1, -1, 0, 1)] satisfies SegmentRayArgs,
      expected: { x: 1, y: 0 },
    },
    {
      name: 'zero-length line이 ray 위에 있으면 point를 기록하고 true를 반환한다',
      args: [segment(1, 0, 1, 0), ray(0, 0, 1, 0)] satisfies SegmentRayArgs,
      expected: { x: 1, y: 0 },
    },
  ])('$name', ({ args, expected }) => {
    expectIntoHit(singleIntersectionSegmentRayInto, args, expected);
  });

  test.each([
    {
      name: 'range 밖이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 0.5, 0), ray(1, -1, 0, 1)] satisfies SegmentRayArgs,
    },
    {
      name: '평행이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 1, 0), ray(0, 1, 1, 0)] satisfies SegmentRayArgs,
    },
    {
      name: 'collinear overlap이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 2, 0), ray(1, 0, 1, 0)] satisfies SegmentRayArgs,
    },
    {
      name: 'collinear endpoint touch이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 1, 0), ray(1, 0, 1, 0)] satisfies SegmentRayArgs,
    },
  ])('$name', ({ args }) => {
    expectIntoMiss(singleIntersectionSegmentRayInto, args);
  });
});

describe('singleIntersectionSegmentRay (allocating companion)', () => {
  test('hit이면 Into와 같은 좌표를 가진 object를 반환한다', () => {
    expectPointClose(singleIntersectionSegmentRay(segment(0, 0, 2, 0), ray(1, -1, 0, 1)), { x: 1, y: 0 });
  });

  test.each([
    {
      name: 'miss이면 undefined를 반환한다',
      args: [segment(0, 0, 0.5, 0), ray(1, -1, 0, 1)] satisfies SegmentRayArgs,
    },
    {
      name: 'collinear overlap이면 undefined를 반환한다',
      args: [segment(0, 0, 2, 0), ray(1, 0, 1, 0)] satisfies SegmentRayArgs,
    },
    {
      name: 'collinear endpoint touch이면 undefined를 반환한다',
      args: [segment(0, 0, 1, 0), ray(1, 0, 1, 0)] satisfies SegmentRayArgs,
    },
    {
      name: 'parallel disjoint이면 undefined를 반환한다',
      args: [segment(0, 0, 1, 0), ray(0, 1, 1, 0)] satisfies SegmentRayArgs,
    },
  ])('$name', ({ args }) => {
    expect(singleIntersectionSegmentRay(...args)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// Group A-2: segment × infinite-line
// ─────────────────────────────────────────────────────────────────

describe('intersectsInfiniteLineSegment', () => {
  test.each([
    {
      name: 'line (0,0)→(2,0)와 infinite-line origin(1,-1) dir(0,1)는 교차한다',
      args: [infiniteLine(1, -1, 0, 1), segment(0, 0, 2, 0)] satisfies [InfiniteLineLike, SegmentLike],
      expected: true,
    },
    {
      name: 'line (0,0)→(0.5,0)의 연장선에서만 만나면 false를 반환한다',
      args: [infiniteLine(1, -1, 0, 1), segment(0, 0, 0.5, 0)] satisfies [InfiniteLineLike, SegmentLike],
      expected: false,
    },
    {
      name: 'line (0,0)→(1,0)와 infinite-line origin(0,1) dir(1,0)는 평행하고 교차하지 않는다',
      args: [infiniteLine(0, 1, 1, 0), segment(0, 0, 1, 0)] satisfies [InfiniteLineLike, SegmentLike],
      expected: false,
    },
    {
      name: 'collinear infinite-line와 line은 true를 반환한다',
      args: [infiniteLine(1, 0, 1, 0), segment(0, 0, 2, 0)] satisfies [InfiniteLineLike, SegmentLike],
      expected: true,
    },
    {
      name: 'collinear이고 endpoint가 닿으면 true를 반환한다',
      args: [infiniteLine(1, 0, 1, 0), segment(0, 0, 1, 0)] satisfies [InfiniteLineLike, SegmentLike],
      expected: true,
    },
    {
      name: 'zero-length line이 infinite-line 위에 있으면 true를 반환한다',
      args: [infiniteLine(0, 0, 1, 0), segment(1, 0, 1, 0)] satisfies [InfiniteLineLike, SegmentLike],
      expected: true,
    },
  ])('$name', ({ args, expected }) => {
    expect(intersectsInfiniteLineSegment(...args)).toBe(expected);
  });

  describe('tuple/object input 혼합', () => {
    test('tuple line과 tuple infinite-line 입력은 object 입력과 같은 결과를 반환한다', () => {
      const lineTuple: [readonly [number, number], readonly [number, number]] = [
        [0, 0],
        [2, 0],
      ];
      const infTuple: [readonly [number, number], readonly [number, number]] = [
        [1, -1],
        [0, 1],
      ];
      const lineObj = segment(0, 0, 2, 0);
      const infObj = infiniteLine(1, -1, 0, 1);
      expect(intersectsInfiniteLineSegment(infTuple, lineTuple)).toBe(intersectsInfiniteLineSegment(infObj, lineObj));
    });
  });
});

describe('singleIntersectionSegmentInfiniteLineInto', () => {
  test.each([
    {
      name: '교점 (1,0)을 out에 기록하고 true를 반환한다',
      args: [segment(0, 0, 2, 0), infiniteLine(1, -1, 0, 1)] satisfies SegmentInfiniteLineArgs,
      expected: { x: 1, y: 0 },
    },
    {
      name: 'zero-length line이 infinite-line 위에 있으면 point를 기록하고 true를 반환한다',
      args: [segment(1, 0, 1, 0), infiniteLine(0, 0, 1, 0)] satisfies SegmentInfiniteLineArgs,
      expected: { x: 1, y: 0 },
    },
  ])('$name', ({ args, expected }) => {
    expectIntoHit(singleIntersectionSegmentInfiniteLineInto, args, expected);
  });

  test.each([
    {
      name: 'range 밖이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 0.5, 0), infiniteLine(1, -1, 0, 1)] satisfies SegmentInfiniteLineArgs,
    },
    {
      name: '평행이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 1, 0), infiniteLine(0, 1, 1, 0)] satisfies SegmentInfiniteLineArgs,
    },
    {
      name: 'collinear overlap이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 2, 0), infiniteLine(1, 0, 1, 0)] satisfies SegmentInfiniteLineArgs,
    },
    {
      name: 'collinear endpoint touch이면 false를 반환하고 out을 수정하지 않는다',
      args: [segment(0, 0, 1, 0), infiniteLine(1, 0, 1, 0)] satisfies SegmentInfiniteLineArgs,
    },
  ])('$name', ({ args }) => {
    expectIntoMiss(singleIntersectionSegmentInfiniteLineInto, args);
  });
});

describe('singleIntersectionSegmentInfiniteLine (allocating companion)', () => {
  test('hit이면 Into와 같은 좌표를 가진 object를 반환한다', () => {
    expectPointClose(singleIntersectionSegmentInfiniteLine(segment(0, 0, 2, 0), infiniteLine(1, -1, 0, 1)), {
      x: 1,
      y: 0,
    });
  });

  test.each([
    {
      name: 'miss이면 undefined를 반환한다',
      args: [segment(0, 0, 0.5, 0), infiniteLine(1, -1, 0, 1)] satisfies SegmentInfiniteLineArgs,
    },
    {
      name: 'collinear overlap이면 undefined를 반환한다',
      args: [segment(0, 0, 2, 0), infiniteLine(1, 0, 1, 0)] satisfies SegmentInfiniteLineArgs,
    },
    {
      name: 'collinear endpoint touch이면 undefined를 반환한다',
      args: [segment(0, 0, 1, 0), infiniteLine(1, 0, 1, 0)] satisfies SegmentInfiniteLineArgs,
    },
    {
      name: 'parallel disjoint이면 undefined를 반환한다',
      args: [segment(0, 0, 1, 0), infiniteLine(0, 1, 1, 0)] satisfies SegmentInfiniteLineArgs,
    },
  ])('$name', ({ args }) => {
    expect(singleIntersectionSegmentInfiniteLine(...args)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// Group A-3: ray × infinite-line
// ─────────────────────────────────────────────────────────────────

describe('intersectsInfiniteLineRay', () => {
  test.each([
    {
      name: 'ray origin(0,0) dir(1,0)와 infinite-line origin(2,1) dir(0,-1)는 교차한다',
      args: [infiniteLine(2, 1, 0, -1), ray(0, 0, 1, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: true,
    },
    {
      name: '교점이 ray 역방향에 있으면 false를 반환한다',
      args: [infiniteLine(-1, -1, 0, 1), ray(0, 0, 1, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: false,
    },
    {
      name: 'ray origin(0,1) dir(1,0)와 infinite-line origin(0,0) dir(1,0)는 평행하고 교차하지 않는다',
      args: [infiniteLine(0, 0, 1, 0), ray(0, 1, 1, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: false,
    },
    {
      name: 'collinear ray와 infinite-line은 true를 반환한다',
      args: [infiniteLine(0, 0, 1, 0), ray(1, 0, 1, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: true,
    },
    {
      name: 'collinear이고 ray origin이 infinite-line 위에 있으면 true를 반환한다',
      args: [infiniteLine(1, 0, 1, 0), ray(1, 0, 1, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: true,
    },
    {
      name: 'zero-direction ray가 infinite-line 위에 있으면 true를 반환한다',
      args: [infiniteLine(0, 0, 1, 0), ray(1, 0, 0, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: true,
    },
    {
      name: 'zero-direction ray가 infinite-line 밖에 있으면 false를 반환한다',
      args: [infiniteLine(0, 0, 1, 0), ray(1, 1, 0, 0)] satisfies [InfiniteLineLike, RayLike],
      expected: false,
    },
  ])('$name', ({ args, expected }) => {
    expect(intersectsInfiniteLineRay(...args)).toBe(expected);
  });

  describe('tuple/object input 혼합', () => {
    test('tuple ray와 object infinite-line 입력은 object 입력과 같은 결과를 반환한다', () => {
      const rayTuple: readonly [number, number, number, number] = [0, 0, 1, 0];
      const infObj = infiniteLine(2, 1, 0, -1);
      const rayObj = ray(0, 0, 1, 0);
      expect(intersectsInfiniteLineRay(infObj, rayTuple)).toBe(intersectsInfiniteLineRay(infObj, rayObj));
    });
  });
});

describe('singleIntersectionRayInfiniteLineInto', () => {
  test.each([
    {
      name: '교점을 out에 기록하고 true를 반환한다',
      args: [ray(0, 0, 1, 0), infiniteLine(2, 0, 0, 1)] satisfies RayInfiniteLineArgs,
      expected: { x: 2, y: 0 },
    },
    {
      name: 'zero-direction ray가 infinite-line 위에 있으면 point를 기록하고 true를 반환한다',
      args: [ray(1, 0, 0, 0), infiniteLine(0, 0, 1, 0)] satisfies RayInfiniteLineArgs,
      expected: { x: 1, y: 0 },
    },
  ])('$name', ({ args, expected }) => {
    expectIntoHit(singleIntersectionRayInfiniteLineInto, args, expected);
  });

  test.each([
    {
      name: 'range 밖이면 false를 반환하고 out을 수정하지 않는다',
      args: [ray(0, 0, 1, 0), infiniteLine(-1, -1, 0, 1)] satisfies RayInfiniteLineArgs,
    },
    {
      name: '평행이면 false를 반환하고 out을 수정하지 않는다',
      args: [ray(0, 1, 1, 0), infiniteLine(0, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
    {
      name: 'collinear overlap이면 false를 반환하고 out을 수정하지 않는다',
      args: [ray(1, 0, 1, 0), infiniteLine(0, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
    {
      name: 'collinear이면 false를 반환하고 out을 수정하지 않는다',
      args: [ray(1, 0, 1, 0), infiniteLine(1, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
  ])('$name', ({ args }) => {
    expectIntoMiss(singleIntersectionRayInfiniteLineInto, args);
  });
});

describe('singleIntersectionRayInfiniteLine (allocating companion)', () => {
  test('hit이면 Into와 같은 좌표를 가진 object를 반환한다', () => {
    expectPointClose(singleIntersectionRayInfiniteLine(ray(0, 0, 1, 0), infiniteLine(2, 0, 0, 1)), { x: 2, y: 0 });
  });

  test.each([
    {
      name: 'miss이면 undefined를 반환한다',
      args: [ray(0, 0, 1, 0), infiniteLine(-1, -1, 0, 1)] satisfies RayInfiniteLineArgs,
    },
    {
      name: 'collinear overlap이면 undefined를 반환한다',
      args: [ray(1, 0, 1, 0), infiniteLine(0, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
    {
      name: 'collinear이면 undefined를 반환한다',
      args: [ray(1, 0, 1, 0), infiniteLine(1, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
    {
      name: 'parallel disjoint이면 undefined를 반환한다',
      args: [ray(0, 1, 1, 0), infiniteLine(0, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
    {
      name: 'collinear endpoint touch이면 undefined를 반환한다',
      args: [ray(1, 0, 1, 0), infiniteLine(1, 0, 1, 0)] satisfies RayInfiniteLineArgs,
    },
  ])('$name', ({ args }) => {
    expect(singleIntersectionRayInfiniteLine(...args)).toBeUndefined();
  });
});
