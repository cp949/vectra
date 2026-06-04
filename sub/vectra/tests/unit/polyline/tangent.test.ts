/**
 * tangentAtIndexInto / tangentAtIndex / tangentsInto unit test.
 *
 * vertex tangent 계산(인접 edge 방향 정규화 평균)을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { tangentAtIndex } from '../../../src/polyline/tangent-at-index';
import { tangentAtIndexInto } from '../../../src/polyline/tangent-at-index-into';
import { tangentsInto } from '../../../src/polyline/tangents-into';
import type { PolylineLike, XYObjectWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공용 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };
const REPEATED: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
};

/** x축 방향 2점 polyline */
const HLINE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ],
};

/** 직각 꺾임: (0,0)→(1,0)→(1,1) */
const CORNER: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
};

/** zero-length edge가 섞인 polyline */
const ZERO_MID: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 }, // zero-length segment (다음 점과 같음)
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],
};

function makeOut(): XYObjectWritable {
  return { x: 99, y: 99 };
}

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtIndexInto — 기본 동작
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangent - tangentAtIndexInto 기본 동작', () => {
  test('empty polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, EMPTY, 0)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('single-point polyline은 false를 반환한다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, SINGLE, 0)).toBe(false);
  });

  test('index 범위 밖이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, HLINE, -1)).toBe(false);
    expect(tangentAtIndexInto(out, HLINE, 2)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('비정수 index이면 false를 반환한다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, HLINE, 0.5)).toBe(false);
    expect(tangentAtIndexInto(out, HLINE, Number.NaN)).toBe(false);
  });

  test('2점 직선 시작점 tangent는 x축 방향이다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, HLINE, 0)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('2점 직선 끝점 tangent는 x축 방향이다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, HLINE, 1)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('반환된 tangent는 단위 벡터다', () => {
    const out = makeOut();
    tangentAtIndexInto(out, CORNER, 1);
    const mag = Math.hypot(out.x, out.y);
    expect(mag).toBeCloseTo(1, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtIndexInto — 꺾인 polyline 내부 vertex
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangent - tangentAtIndexInto 내부 vertex', () => {
  test('직각 꺾임 내부 vertex tangent는 (1,0)과 (0,1)의 정규화된 합이다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, CORNER, 1)).toBe(true);
    // 이전 segment 방향: (1,0), 다음 segment 방향: (0,1) → 합 (1,1) 정규화 = (√2/2, √2/2)
    expect(out.x).toBeCloseTo(Math.SQRT2 / 2, 10);
    expect(out.y).toBeCloseTo(Math.SQRT2 / 2, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtIndexInto — zero-length edge
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangent - tangentAtIndexInto zero-length edge', () => {
  test('모든 인접 edge가 zero-length이면 false를 반환한다', () => {
    const out = makeOut();
    expect(tangentAtIndexInto(out, REPEATED, 0)).toBe(false);
    expect(tangentAtIndexInto(out, REPEATED, 1)).toBe(false);
  });

  test('zero-length edge를 무시하고 유효한 edge 방향만 사용한다', () => {
    // ZERO_MID index 1: 이전 segment (0,0)→(1,0) 유효, 다음 segment (1,0)→(1,0) zero
    // → 이전 edge 방향만: (1,0)
    const out = makeOut();
    expect(tangentAtIndexInto(out, ZERO_MID, 1)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('zero-length edge 이후 유효한 edge 방향을 사용한다', () => {
    // ZERO_MID index 2: 이전 segment (1,0)→(1,0) zero, 다음 segment (1,0)→(2,0) 유효
    const out = makeOut();
    expect(tangentAtIndexInto(out, ZERO_MID, 2)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtIndex (companion)
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangent - tangentAtIndex companion', () => {
  test('성공 시 새 {x, y} object를 반환한다', () => {
    const result = tangentAtIndex(HLINE, 0);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(1, 10);
    expect(result?.y).toBeCloseTo(0, 10);
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(tangentAtIndex(EMPTY, 0)).toBeUndefined();
    expect(tangentAtIndex(HLINE, -1)).toBeUndefined();
    expect(tangentAtIndex(REPEATED, 0)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangent - tangentsInto', () => {
  test('empty polyline은 outPoints를 비우고 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = tangentsInto(out, EMPTY);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 {x:0, y:0} 1개를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    tangentsInto(out, SINGLE);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });

  test('2점 직선은 vertex 수(2)와 같은 개수를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    tangentsInto(out, HLINE);
    expect(out).toHaveLength(2);
    // 양쪽 모두 x축 방향
    for (const pt of out) {
      expect(pt.x).toBeCloseTo(1, 10);
      expect(pt.y).toBeCloseTo(0, 10);
    }
  });

  test('CORNER 3점 polyline은 3개 tangent를 반환하며 index alignment을 유지한다', () => {
    const out: XYObjectWritable[] = [];
    tangentsInto(out, CORNER);
    expect(out).toHaveLength(3);
    // index 0: x축 방향
    expect(out[0].x).toBeCloseTo(1, 10);
    expect(out[0].y).toBeCloseTo(0, 10);
    // index 1: 45도
    expect(out[1].x).toBeCloseTo(Math.SQRT2 / 2, 10);
    expect(out[1].y).toBeCloseTo(Math.SQRT2 / 2, 10);
    // index 2: y축 방향
    expect(out[2].x).toBeCloseTo(0, 10);
    expect(out[2].y).toBeCloseTo(1, 10);
  });

  test('tangent를 계산할 수 없는 vertex는 {x:0, y:0}이다', () => {
    const out: XYObjectWritable[] = [];
    tangentsInto(out, REPEATED);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 0, y: 0 });
  });

  test('기존 outPoints 내용이 clear된다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    tangentsInto(out, HLINE);
    expect(out).toHaveLength(2);
  });

  test('반환값이 outPoints 자체다', () => {
    const out: XYObjectWritable[] = [];
    const result = tangentsInto(out, HLINE);
    expect(result).toBe(out);
  });
});
