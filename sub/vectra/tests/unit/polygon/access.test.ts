/**
 * polygon access 함수를 검증하는 테스트.
 * bounds, centroid, edgeAt, pointAtIndex 그리고 각 Into 변형의 정상 동작, 경계값, 실패 경로를 다룬다.
 */
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';
import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/polygon/bounds';
import { centroid } from '../../../src/polygon/centroid';
import { edgeAt } from '../../../src/polygon/edge-at';
import { edgeAtInto } from '../../../src/polygon/edge-at-into';
import { pointAtIndex } from '../../../src/polygon/point-at-index';
import { pointAtIndexInto } from '../../../src/polygon/point-at-index-into';
import { CCW_TRI, EMPTY, makePoint, makeSeg, SINGLE, TWO_PT, UNIT_SQUARE } from './_access-distance-test-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// allocating companions
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon access allocating companions', () => {
  test('bounds는 새 BoundsWritable을 반환한다', () => {
    expect(bounds(CCW_TRI)).toEqual({ minX: 0, minY: 0, maxX: 4, maxY: 3 });
  });

  test('centroid는 성공 시 새 PointWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    const result = centroid(CCW_TRI);
    expect(result?.x).toBeCloseTo(4 / 3, 10);
    expect(result?.y).toBeCloseTo(1, 10);
    expect(centroid(EMPTY)).toBeUndefined();
  });

  test('edgeAt은 성공 시 새 SegmentWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    expect(edgeAt(CCW_TRI, 2)).toEqual({ x1: 0, y1: 3, x2: 0, y2: 0 });
    expect(edgeAt(CCW_TRI, 3)).toBeUndefined();
  });

  test('pointAtIndex는 성공 시 새 PointWritable을 반환하고 실패 시 undefined를 반환한다', () => {
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
});

// ─────────────────────────────────────────────────────────────────────────────
// edgeAtInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon access - edgeAtInto', () => {
  test('삼각형 index 0 edge를 기록하고 true를 반환한다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, CCW_TRI, 0)).toBe(true);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(4);
    expect(out.y2).toBe(0);
  });

  test('삼각형 index 1 edge를 기록하고 true를 반환한다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, CCW_TRI, 1)).toBe(true);
    expect(out.x1).toBe(4);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(0);
    expect(out.y2).toBe(3);
  });

  test('삼각형 index 2(마지막) edge는 마지막 point → 첫 point로 wrap된다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, CCW_TRI, 2)).toBe(true);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(3);
    expect(out.x2).toBe(0);
    expect(out.y2).toBe(0);
  });

  test('2점 polygon index 0 edge를 기록한다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, TWO_PT, 0)).toBe(true);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(4);
  });

  test('2점 polygon index 1(마지막) edge는 두 번째 → 첫 번째로 wrap된다', () => {
    const out = makeSeg();
    expect(edgeAtInto(out, TWO_PT, 1)).toBe(true);
    expect(out.x1).toBe(3);
    expect(out.y1).toBe(4);
    expect(out.x2).toBe(0);
    expect(out.y2).toBe(0);
  });

  test('단일 point polygon은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, SINGLE, 0)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('빈 polygon은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();
    const sentinel = { ...out };
    expect(edgeAtInto(out, EMPTY, 0)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('음수 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, -1)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('범위 초과 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, 3)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('NaN index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, Number.NaN)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('finite 비정수 index(1.5)는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, 1.5)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('finite 비정수 index(2.999)도 false를 반환한다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, 2.999)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('Infinity index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, Number.POSITIVE_INFINITY)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('-Infinity index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSeg();

    const sentinel = { ...out };
    expect(edgeAtInto(out, CCW_TRI, Number.NEGATIVE_INFINITY)).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('사각형 4개 edge가 모두 올바르게 순환한다', () => {
    const out = makeSeg();
    edgeAtInto(out, UNIT_SQUARE, 3);
    // index 3: (0,1) → (0,0) — 마지막 point에서 첫 point로 닫힘
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(1);
    expect(out.x2).toBe(0);
    expect(out.y2).toBe(0);
  });
});
