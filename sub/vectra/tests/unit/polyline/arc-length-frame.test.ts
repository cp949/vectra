/**
 * polyline arc-length / frame / batch normal unit test.
 *
 * segment별 length table, vertex-aligned cumulative length table,
 * arc-length left normal, point/tangent/normal frame, vertex normal batch를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { cumulativeLengths } from '../../../src/polyline/cumulative-lengths';
import { cumulativeLengthsInto } from '../../../src/polyline/cumulative-lengths-into';
import { frameAtLength } from '../../../src/polyline/frame-at-length';
import { frameAtLengthInto } from '../../../src/polyline/frame-at-length-into';
import { normalAtLength } from '../../../src/polyline/normal-at-length';
import { normalAtLengthInto } from '../../../src/polyline/normal-at-length-into';
import { normals } from '../../../src/polyline/normals';
import { normalsInto } from '../../../src/polyline/normals-into';
import { segmentLengths } from '../../../src/polyline/segment-lengths';
import { segmentLengthsInto } from '../../../src/polyline/segment-lengths-into';
import type { PolylineFrameWritable, PolylineLike, XYObjectWritable, XYWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공용 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };

/** (0,0)→(3,4), 길이=5 */
const TWO_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ],
};

/** L자: (0,0)→(1,0)→(1,1), 각 segment 길이=1, 전체=2 */
const L_SHAPE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
};

/** 중간에 zero-length segment: (0,0)→(1,0)→(1,0)→(1,1), 전체=2 */
const ZERO_MID: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
};

/** total length 0 repeated-point: (3,5)→(3,5) */
const REPEATED: PolylineLike = {
  points: [
    { x: 3, y: 5 },
    { x: 3, y: 5 },
  ],
};

/** total length가 NaN이 되는 polyline: (0,0)→(1,0)→(NaN,1) */
const NAN_TOTAL: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: Number.NaN, y: 1 },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// TASK-01 length tables
// ═════════════════════════════════════════════════════════════════════════════

describe('polyline segmentLengthsInto', () => {
  test('empty polyline은 out을 clear하고 []를 반환한다', () => {
    const out = [9, 9, 9];
    const result = segmentLengthsInto(out, EMPTY);
    expect(result).toBe(out);
    expect(result).toEqual([]);
  });

  test('single-point polyline은 out을 clear하고 []를 반환한다', () => {
    const out = [9, 9];
    expect(segmentLengthsInto(out, SINGLE)).toEqual([]);
  });

  test('3-4-5 segment를 [5]로 기록한다', () => {
    const out: number[] = [];
    expect(segmentLengthsInto(out, TWO_PT)).toEqual([5]);
  });

  test('여러 segment를 source 순서대로 기록한다', () => {
    const out: number[] = [];
    expect(segmentLengthsInto(out, L_SHAPE)).toEqual([1, 1]);
  });

  test('repeated-point segment를 0으로 기록한다', () => {
    const out: number[] = [];
    expect(segmentLengthsInto(out, ZERO_MID)).toEqual([1, 0, 1]);
  });

  test('tuple point input을 지원한다', () => {
    const out: number[] = [];
    expect(
      segmentLengthsInto(out, [
        [0, 0],
        [3, 4],
      ])
    ).toEqual([5]);
  });

  test('Infinity 좌표는 finite 검증 없이 그대로 전파한다', () => {
    const out: number[] = [];
    const result = segmentLengthsInto(out, {
      points: [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 0 },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(Number.POSITIVE_INFINITY);
  });

  test('NaN 좌표는 finite 검증 없이 그대로 전파한다', () => {
    const out: number[] = [];
    const result = segmentLengthsInto(out, {
      points: [
        { x: 0, y: 0 },
        { x: Number.NaN, y: 0 },
      ],
    });
    expect(result).toHaveLength(1);
    expect(Number.isNaN(result[0])).toBe(true);
  });

  test('기존 out 내용을 clear하고 받은 out 자체를 반환한다', () => {
    const out = [1, 2, 3, 4];
    const result = segmentLengthsInto(out, L_SHAPE);
    expect(result).toBe(out);
    expect(result).toEqual([1, 1]);
  });
});

describe('polyline segmentLengths companion', () => {
  test('새 number[]를 반환한다', () => {
    expect(segmentLengths(L_SHAPE)).toEqual([1, 1]);
    expect(segmentLengths(EMPTY)).toEqual([]);
  });
});

describe('polyline cumulativeLengthsInto', () => {
  test('empty polyline은 out을 clear하고 []를 반환한다', () => {
    const out = [9, 9];
    const result = cumulativeLengthsInto(out, EMPTY);
    expect(result).toBe(out);
    expect(result).toEqual([]);
  });

  test('single-point polyline은 [0]을 반환한다', () => {
    const out: number[] = [];
    expect(cumulativeLengthsInto(out, SINGLE)).toEqual([0]);
  });

  test('여러 segment의 누적값을 [0, ...] 형태로 기록한다', () => {
    const out: number[] = [];
    expect(cumulativeLengthsInto(out, L_SHAPE)).toEqual([0, 1, 2]);
  });

  test('첫 값은 항상 0이다', () => {
    const out: number[] = [];
    expect(cumulativeLengthsInto(out, TWO_PT)).toEqual([0, 5]);
  });

  test('repeated-point segment에서 같은 누적값을 반복한다', () => {
    const out: number[] = [];
    expect(cumulativeLengthsInto(out, ZERO_MID)).toEqual([0, 1, 1, 2]);
  });

  test('Infinity 좌표는 finite 검증 없이 누적에 그대로 전파한다', () => {
    const out: number[] = [];
    const result = cumulativeLengthsInto(out, {
      points: [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 0 },
      ],
    });
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(Number.POSITIVE_INFINITY);
  });

  test('NaN 좌표는 finite 검증 없이 누적에 그대로 전파한다', () => {
    const out: number[] = [];
    const result = cumulativeLengthsInto(out, {
      points: [
        { x: 0, y: 0 },
        { x: Number.NaN, y: 0 },
      ],
    });
    expect(result[0]).toBe(0);
    expect(Number.isNaN(result[1])).toBe(true);
  });

  test('기존 out 내용을 clear하고 받은 out 자체를 반환한다', () => {
    const out = [7, 7, 7, 7, 7];
    const result = cumulativeLengthsInto(out, L_SHAPE);
    expect(result).toBe(out);
    expect(result).toEqual([0, 1, 2]);
  });
});

describe('polyline cumulativeLengths companion', () => {
  test('새 number[]를 반환한다', () => {
    expect(cumulativeLengths(L_SHAPE)).toEqual([0, 1, 2]);
    expect(cumulativeLengths(EMPTY)).toEqual([]);
    expect(cumulativeLengths(SINGLE)).toEqual([0]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TASK-02 arc-length normal / frame
// ═════════════════════════════════════════════════════════════════════════════

function makeOut(): XYObjectWritable {
  return { x: 99, y: 99 };
}

function makeFrame(): PolylineFrameWritable {
  return {
    point: { x: 99, y: 99 },
    tangent: { x: 99, y: 99 },
    normal: { x: 99, y: 99 },
  };
}

describe('polyline normalAtLengthInto', () => {
  test('L자 첫 segment 내부 normal은 (0, 1)이다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('L자 두 번째 segment 내부 normal은 (-1, 0)이다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, 1.5)).toBe(true);
    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('segment boundary는 앞쪽 segment 기준 normal (0, 1)이다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, 1)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('negative length는 첫 non-zero segment 기준 normal로 clamp된다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, -5)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('overflow length는 마지막 non-zero segment 기준 normal로 clamp된다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, 100)).toBe(true);
    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('length=-Infinity는 첫 non-zero segment 기준 normal로 clamp된다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, Number.NEGATIVE_INFINITY)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('length=Infinity는 마지막 non-zero segment 기준 normal로 clamp된다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, Number.POSITIVE_INFINITY)).toBe(true);
    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('중간 zero-length segment를 건너뛰고 다음 non-zero segment를 잡는다', () => {
    // ZERO_MID: (0,0)→(1,0)→(1,0)→(1,1), target 1.5는 마지막 segment 내부
    const out = makeOut();
    expect(normalAtLengthInto(out, ZERO_MID, 1.5)).toBe(true);
    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('left normal (-ty, tx)는 ty=0일 때 -0을 기록한다', () => {
    const out = makeOut();
    normalAtLengthInto(out, L_SHAPE, 0.5);
    expect(Object.is(out.x, -0)).toBe(true);
    expect(out.y).toBe(1);
  });

  test('length=NaN은 NaN normal을 기록한다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, L_SHAPE, Number.NaN)).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('total length가 NaN이면 NaN normal을 기록한다', () => {
    const out = makeOut();
    expect(normalAtLengthInto(out, NAN_TOTAL, 0.5)).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('empty / single / repeated-only polyline은 false와 out 미수정이다', () => {
    for (const poly of [EMPTY, SINGLE, REPEATED]) {
      const out = makeOut();
      expect(normalAtLengthInto(out, poly, 0.5)).toBe(false);
      expect(out).toEqual({ x: 99, y: 99 });
    }
  });

  test('out이 source point와 alias되어도 정의대로 동작한다', () => {
    const endpoint: XYWritable = { x: 3, y: 4 };
    const poly: PolylineLike = { points: [{ x: 0, y: 0 }, endpoint] };
    // (0,0)→(3,4) 단위 tangent (0.6, 0.8), left normal (-0.8, 0.6)
    expect(normalAtLengthInto(endpoint, poly, 2.5)).toBe(true);
    expect((endpoint as XYObjectWritable).x).toBeCloseTo(-0.8, 10);
    expect((endpoint as XYObjectWritable).y).toBeCloseTo(0.6, 10);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(normalAtLengthInto(out, L_SHAPE, 0.5)).toBe(true);
    expect(out[0]).toBeCloseTo(0, 10);
    expect(out[1]).toBeCloseTo(1, 10);
  });
});

describe('polyline normalAtLength companion', () => {
  test('성공 시 새 plain {x, y} object를 반환한다', () => {
    const result = normalAtLength(L_SHAPE, 0.5);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0, 10);
    expect(result?.y).toBeCloseTo(1, 10);
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(normalAtLength(EMPTY, 1)).toBeUndefined();
    expect(normalAtLength(SINGLE, 0)).toBeUndefined();
    expect(normalAtLength(REPEATED, 0)).toBeUndefined();
  });
});

describe('polyline frameAtLengthInto', () => {
  test('segment 내부에서 point/tangent/normal을 같은 target 기준으로 기록한다', () => {
    const out = makeFrame();
    expect(frameAtLengthInto(out, L_SHAPE, 0.5)).toBe(true);
    expect((out.point as XYObjectWritable).x).toBeCloseTo(0.5, 10);
    expect((out.point as XYObjectWritable).y).toBeCloseTo(0, 10);
    expect((out.tangent as XYObjectWritable).x).toBeCloseTo(1, 10);
    expect((out.tangent as XYObjectWritable).y).toBeCloseTo(0, 10);
    expect((out.normal as XYObjectWritable).x).toBeCloseTo(0, 10);
    expect((out.normal as XYObjectWritable).y).toBeCloseTo(1, 10);
  });

  test('boundary에서 point는 boundary point, tangent/normal은 앞쪽 segment 기준이다', () => {
    const out = makeFrame();
    expect(frameAtLengthInto(out, L_SHAPE, 1)).toBe(true);
    expect((out.point as XYObjectWritable).x).toBeCloseTo(1, 10);
    expect((out.point as XYObjectWritable).y).toBeCloseTo(0, 10);
    expect((out.tangent as XYObjectWritable).x).toBeCloseTo(1, 10);
    expect((out.tangent as XYObjectWritable).y).toBeCloseTo(0, 10);
    expect((out.normal as XYObjectWritable).x).toBeCloseTo(0, 10);
    expect((out.normal as XYObjectWritable).y).toBeCloseTo(1, 10);
  });

  test('length=-Infinity는 첫 non-zero segment 기준으로 clamp된다', () => {
    const out = makeFrame();
    expect(frameAtLengthInto(out, L_SHAPE, Number.NEGATIVE_INFINITY)).toBe(true);
    expect((out.point as XYObjectWritable).x).toBeCloseTo(0, 10);
    expect((out.point as XYObjectWritable).y).toBeCloseTo(0, 10);
    expect((out.tangent as XYObjectWritable).x).toBeCloseTo(1, 10);
    expect((out.tangent as XYObjectWritable).y).toBeCloseTo(0, 10);
    expect((out.normal as XYObjectWritable).x).toBeCloseTo(0, 10);
    expect((out.normal as XYObjectWritable).y).toBeCloseTo(1, 10);
  });

  test('length=Infinity는 마지막 non-zero segment 기준으로 clamp된다', () => {
    const out = makeFrame();
    expect(frameAtLengthInto(out, L_SHAPE, Number.POSITIVE_INFINITY)).toBe(true);
    expect((out.point as XYObjectWritable).x).toBeCloseTo(1, 10);
    expect((out.point as XYObjectWritable).y).toBeCloseTo(1, 10);
    expect((out.tangent as XYObjectWritable).x).toBeCloseTo(0, 10);
    expect((out.tangent as XYObjectWritable).y).toBeCloseTo(1, 10);
    expect((out.normal as XYObjectWritable).x).toBeCloseTo(-1, 10);
    expect((out.normal as XYObjectWritable).y).toBeCloseTo(0, 10);
  });

  test('nested tuple output을 보존한다', () => {
    const point: [number, number] = [0, 0];
    const tangent: [number, number] = [0, 0];
    const normal: [number, number] = [0, 0];
    const out: PolylineFrameWritable<XYWritable> = { point, tangent, normal };
    expect(frameAtLengthInto(out, L_SHAPE, 0.5)).toBe(true);
    expect(out.point).toBe(point);
    expect(out.tangent).toBe(tangent);
    expect(out.normal).toBe(normal);
    expect(point[0]).toBeCloseTo(0.5, 10);
    expect(tangent[0]).toBeCloseTo(1, 10);
    expect(normal[1]).toBeCloseTo(1, 10);
  });

  test('실패 시 point/tangent/normal field를 모두 미수정한다', () => {
    for (const poly of [EMPTY, SINGLE, REPEATED]) {
      const out = makeFrame();
      expect(frameAtLengthInto(out, poly, 0.5)).toBe(false);
      expect(out.point).toEqual({ x: 99, y: 99 });
      expect(out.tangent).toEqual({ x: 99, y: 99 });
      expect(out.normal).toEqual({ x: 99, y: 99 });
    }
  });

  test('length=NaN은 모든 component에 NaN을 기록하고 true를 반환한다', () => {
    const out = makeFrame();
    expect(frameAtLengthInto(out, L_SHAPE, Number.NaN)).toBe(true);
    for (const field of [out.point, out.tangent, out.normal] as XYObjectWritable[]) {
      expect(Number.isNaN(field.x)).toBe(true);
      expect(Number.isNaN(field.y)).toBe(true);
    }
  });

  test('total length가 NaN이면 모든 component에 NaN을 기록하고 true를 반환한다', () => {
    const out = makeFrame();
    expect(frameAtLengthInto(out, NAN_TOTAL, 0.5)).toBe(true);
    for (const field of [out.point, out.tangent, out.normal] as XYObjectWritable[]) {
      expect(Number.isNaN(field.x)).toBe(true);
      expect(Number.isNaN(field.y)).toBe(true);
    }
  });

  test('out frame field가 source point와 alias되어도 정의대로 동작한다', () => {
    const start: XYWritable = { x: 0, y: 0 };
    const end: XYWritable = { x: 3, y: 4 };
    const poly: PolylineLike = { points: [start, end] };
    const out: PolylineFrameWritable = { point: start, tangent: end, normal: { x: 0, y: 0 } };
    // (0,0)→(3,4): target 2.5 point (1.5, 2.0), tangent (0.6, 0.8), normal (-0.8, 0.6)
    expect(frameAtLengthInto(out, poly, 2.5)).toBe(true);
    expect((out.point as XYObjectWritable).x).toBeCloseTo(1.5, 10);
    expect((out.point as XYObjectWritable).y).toBeCloseTo(2, 10);
    expect((out.tangent as XYObjectWritable).x).toBeCloseTo(0.6, 10);
    expect((out.tangent as XYObjectWritable).y).toBeCloseTo(0.8, 10);
    expect((out.normal as XYObjectWritable).x).toBeCloseTo(-0.8, 10);
    expect((out.normal as XYObjectWritable).y).toBeCloseTo(0.6, 10);
  });
});

describe('polyline frameAtLength companion', () => {
  test('성공 시 새 plain nested object를 반환한다', () => {
    const result = frameAtLength(L_SHAPE, 0.5);
    expect(result).not.toBeUndefined();
    expect(result?.point.x).toBeCloseTo(0.5, 10);
    expect(result?.tangent.x).toBeCloseTo(1, 10);
    expect(result?.normal.y).toBeCloseTo(1, 10);
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(frameAtLength(EMPTY, 1)).toBeUndefined();
    expect(frameAtLength(SINGLE, 0)).toBeUndefined();
    expect(frameAtLength(REPEATED, 0)).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TASK-03 batch normals
// ═════════════════════════════════════════════════════════════════════════════

/** x축 직선 2점: (0,0)→(2,0) */
const STRAIGHT_X: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
  ],
};

describe('polyline normalsInto', () => {
  test('empty polyline은 outPoints를 비우고 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = normalsInto(out, EMPTY);
    expect(result).toBe(out);
    expect(result).toEqual([]);
  });

  test('single-point polyline은 { x: 0, y: 0 } 1개를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    const result = normalsInto(out, SINGLE);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0 });
  });

  test('2점 x축 직선은 vertex 2개와 normal (0, 1)을 반환한다', () => {
    const out: XYObjectWritable[] = [];
    const result = normalsInto(out, STRAIGHT_X);
    expect(result).toHaveLength(2);
    for (const normal of result) {
      expect(normal.x).toBeCloseTo(0, 10);
      expect(normal.y).toBeCloseTo(1, 10);
    }
  });

  test('left normal (-ty, tx)는 ty=0일 때 -0을 기록한다', () => {
    const result = normalsInto([], STRAIGHT_X);
    expect(Object.is(result[0].x, -0)).toBe(true);
    expect(result[0].y).toBe(1);
  });

  test('L자 내부 vertex는 tangent 평균의 left normal을 반환한다', () => {
    const result = normalsInto([], L_SHAPE);
    expect(result).toHaveLength(3);
    // vertex 0: tangent (1,0) → normal (0,1)
    expect(result[0].x).toBeCloseTo(0, 10);
    expect(result[0].y).toBeCloseTo(1, 10);
    // vertex 1: tangent (0.707,0.707) → normal (-0.707, 0.707)
    expect(result[1].x).toBeCloseTo(-Math.SQRT1_2, 10);
    expect(result[1].y).toBeCloseTo(Math.SQRT1_2, 10);
    // vertex 2: tangent (0,1) → normal (-1, 0)
    expect(result[2].x).toBeCloseTo(-1, 10);
    expect(result[2].y).toBeCloseTo(0, 10);
  });

  test('repeated-only polyline은 각 vertex에 { x: 0, y: 0 }을 반환한다', () => {
    const repeatedTriple: PolylineLike = {
      points: [
        { x: 3, y: 5 },
        { x: 3, y: 5 },
        { x: 3, y: 5 },
      ],
    };
    const result = normalsInto([], repeatedTriple);
    expect(result).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  test('기존 outPoints 내용을 clear한다', () => {
    const out: XYObjectWritable[] = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    const result = normalsInto(out, STRAIGHT_X);
    expect(result).toBe(out);
    expect(result).toHaveLength(2);
  });

  test('outPoints와 source points array aliasing 호출도 정의대로 동작한다', () => {
    const shared: XYObjectWritable[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ];
    const result = normalsInto(shared, { points: shared });
    expect(result).toHaveLength(2);
    for (const normal of result) {
      expect(normal.x).toBeCloseTo(0, 10);
      expect(normal.y).toBeCloseTo(1, 10);
    }
  });
});

describe('polyline normals companion', () => {
  test('새 point array를 반환한다', () => {
    const result = normals(STRAIGHT_X);
    expect(result).toHaveLength(2);
    expect(result[0].y).toBeCloseTo(1, 10);
    expect(normals(EMPTY)).toEqual([]);
  });
});
