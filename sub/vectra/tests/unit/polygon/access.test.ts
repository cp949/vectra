/**
 * polygon access 함수를 검증하는 테스트.
 * bounds, centroid, edgeAt, pointAtIndex 그리고 각 Into 변형의 정상 동작, 경계값, 실패 경로를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/polygon/bounds';
import { centroid } from '../../../src/polygon/centroid';
import { edgeAt } from '../../../src/polygon/edge-at';
import { edgeAtInto } from '../../../src/polygon/edge-at-into';
import { pointAtIndex } from '../../../src/polygon/point-at-index';
import { pointAtIndexInto } from '../../../src/polygon/point-at-index-into';
import type { PolygonLike, SegmentWritable } from '../../../src/types';
import { CCW_TRI, EMPTY, makePoint, makeSeg, SINGLE, TWO_PT, UNIT_SQUARE } from './_access-distance-test-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// allocating companions
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon access allocating companions', () => {
  test('bounds는 새 BoundsWritable을 반환한다', () => {
    expect(bounds(CCW_TRI)).toEqual({
      min: { x: 0, y: 0 },
      max: { x: 4, y: 3 },
    });
  });

  test('centroid는 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    const result = centroid(CCW_TRI);
    expect(result?.x).toBeCloseTo(4 / 3, 10);
    expect(result?.y).toBeCloseTo(1, 10);
    expect(centroid(EMPTY)).toBeUndefined();
  });

  test('edgeAt은 성공 시 새 SegmentWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    expect(edgeAt(CCW_TRI, 2)).toEqual({ a: { x: 0, y: 3 }, b: { x: 0, y: 0 } });
    expect(edgeAt(CCW_TRI, 3)).toBeUndefined();
  });

  test('pointAtIndex는 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    expect(pointAtIndex(CCW_TRI, 1)).toEqual({ x: 4, y: 0 });
    expect(pointAtIndex(CCW_TRI, -1)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pointAtIndexInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon access - pointAtIndexInto', () => {
  test('삼각형 index 0을 기록하고 true를 반환한다', () => {
    const out = makePoint();
    expect(pointAtIndexInto(out, CCW_TRI, 0)).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('삼각형 index 1을 기록하고 true를 반환한다', () => {
    const out = makePoint();
    expect(pointAtIndexInto(out, CCW_TRI, 1)).toBe(true);
    expect(out).toEqual({ x: 4, y: 0 });
  });

  test('삼각형 index 2(마지막)를 기록하고 true를 반환한다', () => {
    const out = makePoint();
    expect(pointAtIndexInto(out, CCW_TRI, 2)).toBe(true);
    expect(out).toEqual({ x: 0, y: 3 });
  });

  test('bare point array로 point와 edge access를 수행한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    const pointOut = { x: 99, y: 99 };
    const edgeOut = { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };

    expect(pointAtIndexInto(pointOut, points, 1)).toBe(true);
    expect(pointOut).toEqual({ x: 4, y: 0 });
    expect(edgeAtInto(edgeOut, points, 2)).toBe(true);
    expect(edgeOut).toEqual({ a: { x: 0, y: 3 }, b: { x: 0, y: 0 } });
  });

  test('음수 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, -1)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('범위 초과 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, 3)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('NaN index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, Number.NaN)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('finite 비정수 index(1.5)는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, 1.5)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('finite 비정수 index(0.1)도 false를 반환한다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, 0.1)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('범위 안에 가까운 finite 비정수 index(2.999)도 false를 반환한다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, 2.999)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('Infinity index는 false를 반환한다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, Number.POSITIVE_INFINITY)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('-Infinity index는 false를 반환한다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, CCW_TRI, Number.NEGATIVE_INFINITY)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('빈 polygon에서 index 0은 false를 반환한다', () => {
    const out = makePoint();
    expect(pointAtIndexInto(out, EMPTY, 0)).toBe(false);
  });

  test('단일 point polygon에서 index 0은 해당 점을 기록한다', () => {
    const out = makePoint();
    expect(pointAtIndexInto(out, SINGLE, 0)).toBe(true);
    expect(out).toEqual({ x: 5, y: 7 });
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(pointAtIndexInto(out, CCW_TRI, 1)).toBe(true);
    expect(out[0]).toBe(4);
    expect(out[1]).toBe(0);
  });

  test('tuple point 입력 polygon에서 올바르게 기록한다', () => {
    const poly: PolygonLike = {
      points: [
        [10, 20],
        [30, 40],
      ],
    };
    const out = makePoint();
    expect(pointAtIndexInto(out, poly, 1)).toBe(true);
    expect(out).toEqual({ x: 30, y: 40 });
  });

  test('mixed input polygon(object/tuple)에서 올바르게 기록한다', () => {
    const poly: PolygonLike = { points: [{ x: 1, y: 2 }, [3, 4] as const] };
    const out = makePoint();
    expect(pointAtIndexInto(out, poly, 1)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// edgeAtInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon access - edgeAtInto', () => {
  test('삼각형 index 0 edge를 기록하고 true를 반환한다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, CCW_TRI, 0)).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 4, y: 0 });
  });

  test('삼각형 index 1 edge를 기록하고 true를 반환한다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, CCW_TRI, 1)).toBe(true);
    expect(out.a).toEqual({ x: 4, y: 0 });
    expect(out.b).toEqual({ x: 0, y: 3 });
  });

  test('삼각형 index 2(마지막) edge는 마지막 point → 첫 point로 wrap된다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, CCW_TRI, 2)).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 3 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('2점 polygon index 0 edge를 기록한다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, TWO_PT, 0)).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 4 });
  });

  test('2점 polygon index 1(마지막) edge는 두 번째 → 첫 번째로 wrap된다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, TWO_PT, 1)).toBe(true);
    expect(out.a).toEqual({ x: 3, y: 4 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('단일 point polygon은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, SINGLE, 0)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('빈 polygon은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, EMPTY, 0)).toBe(false);
  });

  test('음수 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, -1)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('범위 초과 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, 3)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('NaN index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, Number.NaN)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('finite 비정수 index(1.5)는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, 1.5)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('finite 비정수 index(2.999)도 false를 반환한다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, 2.999)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('Infinity index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, Number.POSITIVE_INFINITY)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('-Infinity index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinelA = { ...out.a };
    const sentinelB = { ...out.b };
    expect(edgeAtInto(out, CCW_TRI, Number.NEGATIVE_INFINITY)).toBe(false);
    expect(out.a).toEqual(sentinelA);
    expect(out.b).toEqual(sentinelB);
  });

  test('tuple endpoint SegmentWritable에도 올바르게 기록한다', () => {
    const out: SegmentWritable<[number, number], [number, number]> = {
      a: [0, 0],
      b: [0, 0],
    };
    expect(edgeAtInto(out, CCW_TRI, 1)).toBe(true);
    expect(out.a[0]).toBe(4);
    expect(out.a[1]).toBe(0);
    expect(out.b[0]).toBe(0);
    expect(out.b[1]).toBe(3);
  });

  test('외부 Point class endpoint를 가진 SegmentWritable에도 기록한다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }
    const out: SegmentWritable<Point, Point> = { a: new Point(0, 0), b: new Point(0, 0) };
    expect(edgeAtInto(out, CCW_TRI, 0)).toBe(true);
    expect(out.a.x).toBe(0);
    expect(out.a.y).toBe(0);
    expect(out.b.x).toBe(4);
    expect(out.b.y).toBe(0);
  });

  test('사각형 4개 edge가 모두 올바르게 순환한다', () => {
    const out = makeSeg();
    edgeAtInto(out, UNIT_SQUARE, 3);
    // index 3: (0,1) → (0,0) — 마지막 point에서 첫 point로 닫힘
    expect(out.a).toEqual({ x: 0, y: 1 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('tuple point 입력 polygon의 edge를 기록한다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ] as const,
    };
    const out = makeSeg();
    expect(edgeAtInto(out, poly, 2)).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 3 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });
});
