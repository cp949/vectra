import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/polyline/bounds';
import { closestPoint } from '../../../src/polyline/closest-point';
import { closestPointInto } from '../../../src/polyline/closest-point-into';
import { distanceToPoint } from '../../../src/polyline/distance-to-point';
import { pointAtIndex } from '../../../src/polyline/point-at-index';
import { pointAtIndexInto } from '../../../src/polyline/point-at-index-into';
import { pointAtLength } from '../../../src/polyline/point-at-length';
import { pointAtLengthInto } from '../../../src/polyline/point-at-length-into';
import { pointAtLengthRatio } from '../../../src/polyline/point-at-length-ratio';
import { pointAtLengthRatioInto } from '../../../src/polyline/point-at-length-ratio-into';
import { segmentAt } from '../../../src/polyline/segment-at';
import { segmentAtInto } from '../../../src/polyline/segment-at-into';
import type { PolylineLike, SegmentWritable, XYObjectWritable, XYWritable } from '../../../src/types';

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };
// 모든 segment가 zero-length인 polyline
const REPEATED: PolylineLike = {
  points: [
    { x: 3, y: 5 },
    { x: 3, y: 5 },
    { x: 3, y: 5 },
  ],
};
// 단순 2점 polyline: (0,0)→(3,4), 길이=5
const TWO_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ],
};
// 3점 polyline: (0,0)→(3,4)→(6,8), 각 segment 길이=5, 전체=10
const THREE_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
    { x: 6, y: 8 },
  ],
};
// L자 polyline: (0,0)→(4,0)→(4,3), 길이=4+3=7
const L_SHAPE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 3 },
  ],
};

function makeOut(): XYObjectWritable {
  return { x: 99, y: 99 };
}

function makeSegmentOut(): SegmentWritable<XYObjectWritable, XYObjectWritable> {
  return { a: { x: 99, y: 99 }, b: { x: 88, y: 88 } };
}

// ─────────────────────────────────────────────────────────────────────────────
// allocating companions
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline allocating companions', () => {
  test('bounds는 새 BoundsWritable을 반환한다', () => {
    expect(bounds(L_SHAPE)).toEqual({
      min: { x: 0, y: 0 },
      max: { x: 4, y: 3 },
    });
  });

  test('segmentAt은 성공 시 새 SegmentWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    expect(segmentAt(L_SHAPE, 1)).toEqual({ a: { x: 4, y: 0 }, b: { x: 4, y: 3 } });
    expect(segmentAt(SINGLE, 0)).toBeUndefined();
  });

  test('segmentAt은 비정수, NaN, Infinity index에서 undefined를 반환한다', () => {
    expect(segmentAt(L_SHAPE, 0.5)).toBeUndefined();
    expect(segmentAt(L_SHAPE, Number.NaN)).toBeUndefined();
    expect(segmentAt(L_SHAPE, Infinity)).toBeUndefined();
  });

  test('pointAtIndex는 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    expect(pointAtIndex(L_SHAPE, 2)).toEqual({ x: 4, y: 3 });
    expect(pointAtIndex(EMPTY, 0)).toBeUndefined();
  });

  test('pointAtIndex는 비정수, NaN, Infinity index에서 undefined를 반환한다', () => {
    expect(pointAtIndex(L_SHAPE, 0.5)).toBeUndefined();
    expect(pointAtIndex(L_SHAPE, Number.NaN)).toBeUndefined();
    expect(pointAtIndex(L_SHAPE, Infinity)).toBeUndefined();
  });

  test('pointAtLengthRatio은 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    const result = pointAtLengthRatio(TWO_PT, 0.5);
    expect(result?.x).toBeCloseTo(1.5, 10);
    expect(result?.y).toBeCloseTo(2, 10);
    expect(pointAtLengthRatio(EMPTY, 0.5)).toBeUndefined();
  });

  test('pointAtLength는 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    const result = pointAtLength(TWO_PT, 2.5);
    expect(result?.x).toBeCloseTo(1.5, 10);
    expect(result?.y).toBeCloseTo(2, 10);
    expect(pointAtLength(EMPTY, 0)).toBeUndefined();
  });

  test('closestPoint는 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    const result = closestPoint(TWO_PT, { x: 0, y: 4 });
    expect(result?.x).toBeCloseTo(1.92, 10);
    expect(result?.y).toBeCloseTo(2.56, 10);
    expect(closestPoint(EMPTY, { x: 0, y: 0 })).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// invalid index Into policy
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline access - invalid index Into policy', () => {
  test('segmentAtInto는 비정수, NaN, Infinity index에서 false를 반환하고 out을 수정하지 않는다', () => {
    for (const index of [0.5, Number.NaN, Infinity]) {
      const out = makeSegmentOut();
      expect(segmentAtInto(out, L_SHAPE, index)).toBe(false);
      expect(out).toEqual({ a: { x: 99, y: 99 }, b: { x: 88, y: 88 } });
    }
  });

  test('pointAtIndexInto는 비정수, NaN, Infinity index에서 false를 반환하고 out을 수정하지 않는다', () => {
    for (const index of [0.5, Number.NaN, Infinity]) {
      const out = makeOut();
      expect(pointAtIndexInto(out, L_SHAPE, index)).toBe(false);
      expect(out).toEqual({ x: 99, y: 99 });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pointAtLengthRatioInto — normalized length ratio sampling
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - pointAtLengthRatioInto (normalized length ratio)', () => {
  test('빈 polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, EMPTY, 0.5)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('단일 point polyline은 첫 point를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, SINGLE, 0.5)).toBe(true);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('total length 0인 repeated-point polyline은 첫 point를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, REPEATED, 0.5)).toBe(true);
    expect(out).toEqual({ x: 3, y: 5 });
  });

  test('t=0은 polyline 시작 point를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, TWO_PT, 0)).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('t=1은 polyline 마지막 point를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, TWO_PT, 1)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('t=0.5는 2점 polyline의 중점을 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, TWO_PT, 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(2.0, 10);
  });

  test('점 배열 자체에서 normalized t 위치를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, [{ x: 0, y: 0 }, [3, 4]], 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(2.0, 10);
  });

  test('t < 0은 시작 point로 clamp된다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, TWO_PT, -0.5)).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('t > 1은 마지막 point로 clamp된다', () => {
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, TWO_PT, 1.5)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('3점 polyline에서 t=0.5는 첫 segment 끝(segment boundary)을 기록한다', () => {
    // THREE_PT 전체 길이=10, t=0.5 → target=5 → 첫 segment 끝 (3,4)
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, THREE_PT, 0.5)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('3점 polyline에서 t=0.25는 첫 segment 중점을 기록한다', () => {
    // target=2.5, 첫 segment 내부 t=0.5 → (1.5, 2)
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, THREE_PT, 0.25)).toBe(true);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(2.0, 10);
  });

  test('3점 polyline에서 t=0.75는 두 번째 segment 중점을 기록한다', () => {
    // target=7.5, 첫 segment acc=5 후 두 번째 segment 내부 t=0.5 → (4.5, 6)
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, THREE_PT, 0.75)).toBe(true);
    expect(out.x).toBeCloseTo(4.5, 10);
    expect(out.y).toBeCloseTo(6.0, 10);
  });

  test('L자 polyline에서 segment boundary에 정확히 걸리는 t를 처리한다', () => {
    // L_SHAPE 전체 길이=7, 첫 segment=4, t=4/7 → (4,0)
    const out = makeOut();
    expect(pointAtLengthRatioInto(out, L_SHAPE, 4 / 7)).toBe(true);
    expect(out.x).toBeCloseTo(4, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('out이 polyline의 point와 alias되어도 올바르게 기록한다', () => {
    // out이 points[1]과 같은 object일 때 aliasing 안전성 검증
    const pt: XYWritable = { x: 3, y: 4 };
    const poly: PolylineLike = { points: [{ x: 0, y: 0 }, pt] };
    // t=0.5 → target=2.5, localT=0.5 → (1.5, 2)
    expect(pointAtLengthRatioInto(pt, poly, 0.5)).toBe(true);
    expect(pt.x).toBeCloseTo(1.5, 10);
    expect(pt.y).toBeCloseTo(2.0, 10);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(pointAtLengthRatioInto(out, TWO_PT, 0.5)).toBe(true);
    expect(out[0]).toBeCloseTo(1.5, 10);
    expect(out[1]).toBeCloseTo(2.0, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pointAtLengthInto — length offset sampling
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline sampling - pointAtLengthInto (length offset)', () => {
  test('빈 polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, EMPTY, 2)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('단일 point polyline은 첫 point를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, SINGLE, 0)).toBe(true);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('total length 0인 repeated-point polyline은 첫 point를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, REPEATED, 0)).toBe(true);
    expect(out).toEqual({ x: 3, y: 5 });
  });

  test('length=0은 polyline 시작 point를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, TWO_PT, 0)).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('length=totalLength는 마지막 point를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, TWO_PT, 5)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('length=2.5는 2점 polyline의 중점을 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, TWO_PT, 2.5)).toBe(true);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(2.0, 10);
  });

  test('점 배열 자체에서 length offset 위치를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, [{ x: 0, y: 0 }, [3, 4]], 2.5)).toBe(true);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(2.0, 10);
  });

  test('length < 0은 0으로 clamp되어 시작 point를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, TWO_PT, -1)).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('length > totalLength는 마지막 point로 clamp된다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, TWO_PT, 100)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('3점 polyline에서 length=5는 segment boundary에 정확히 걸린다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, THREE_PT, 5)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('3점 polyline에서 length=7.5는 두 번째 segment 중점을 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, THREE_PT, 7.5)).toBe(true);
    expect(out.x).toBeCloseTo(4.5, 10);
    expect(out.y).toBeCloseTo(6.0, 10);
  });

  test('L자 polyline에서 length=4는 corner point를 기록한다', () => {
    const out = makeOut();
    expect(pointAtLengthInto(out, L_SHAPE, 4)).toBe(true);
    expect(out).toEqual({ x: 4, y: 0 });
  });

  test('zero-length segment가 섞인 polyline에서 length 탐색이 올바르게 동작한다', () => {
    // [(0,0), (0,0), (3,4)]: 첫 segment zero-length, 두 번째 segment 길이=5
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ],
    };
    const out = makeOut();
    expect(pointAtLengthInto(out, poly, 2.5)).toBe(true);
    expect(out.x).toBeCloseTo(1.5, 10);
    expect(out.y).toBeCloseTo(2.0, 10);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(pointAtLengthInto(out, TWO_PT, 2.5)).toBe(true);
    expect(out[0]).toBeCloseTo(1.5, 10);
    expect(out[1]).toBeCloseTo(2.0, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// closestPointInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline distance - closestPointInto', () => {
  test('빈 polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(closestPointInto(out, EMPTY, { x: 0, y: 0 })).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('단일 point polyline은 첫 point를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(closestPointInto(out, SINGLE, { x: 0, y: 0 })).toBe(true);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('total length 0인 repeated-point polyline은 첫 point를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(closestPointInto(out, REPEATED, { x: 10, y: 20 })).toBe(true);
    expect(out).toEqual({ x: 3, y: 5 });
  });

  test('segment interior closest를 기록한다', () => {
    // TWO_PT: (0,0)→(3,4), query (0,4)
    // dx=3, dy=4, lenSq=25, px=0, py=4 → t=(0+16)/25=0.64 → closest=(1.92, 2.56)
    const out = makeOut();
    expect(closestPointInto(out, TWO_PT, { x: 0, y: 4 })).toBe(true);
    expect(out.x).toBeCloseTo(1.92, 10);
    expect(out.y).toBeCloseTo(2.56, 10);
  });

  test('query point가 segment 앞이면 시작 vertex가 closest가 된다', () => {
    const out = makeOut();
    expect(closestPointInto(out, TWO_PT, { x: -1, y: -1 })).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('query point가 segment 뒤이면 끝 vertex가 closest가 된다', () => {
    const out = makeOut();
    expect(closestPointInto(out, TWO_PT, { x: 4, y: 5 })).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('여러 segment 중 최단 segment를 선택한다', () => {
    // L_SHAPE: (0,0)→(4,0)→(4,3), query (1,-1)
    // segment 0: (0,0)→(4,0), closest to (1,-1): t=(4+0)/16=0.25 → (1,0), distSq=1
    // segment 1: (4,0)→(4,3), closest to (1,-1): t=(-3*3+…) → clamp to 0 → (4,0), distSq=9+1=10
    // → segment 0의 (1,0)이 closest
    const out = makeOut();
    expect(closestPointInto(out, L_SHAPE, { x: 1, y: -1 })).toBe(true);
    expect(out).toEqual({ x: 1, y: 0 });
  });

  test('동거리 closest는 앞쪽 segment를 우선한다 (tie-break: earlier segment wins)', () => {
    // polyline: (0,0)→(4,0)→(4,0)→(4,4), query (2,2)
    // segment 0: (0,0)→(4,0): t=(8+0)/16=0.5 → closest=(2,0), distSq=4
    // segment 1: (4,0)→(4,0): zero-length, closest=(4,0), distSq=4+4=8
    // segment 2: (4,0)→(4,4): t=(0+8)/16=0.5 → closest=(4,2), distSq=4
    // segment 0과 2가 동거리 → tie-break: 앞쪽(0) 우선 → closest=(2,0)
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
    };
    const out = makeOut();
    expect(closestPointInto(out, poly, { x: 2, y: 2 })).toBe(true);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('input point와 out이 alias되어도 올바르게 기록한다', () => {
    // out과 query가 같은 object일 때: qx,qy를 먼저 읽으므로 안전해야 한다
    const query: XYWritable = { x: 0, y: 4 };
    // TWO_PT closest to (0,4): t=0.64 → (1.92, 2.56)
    expect(closestPointInto(query, TWO_PT, query)).toBe(true);
    expect(query.x).toBeCloseTo(1.92, 10);
    expect(query.y).toBeCloseTo(2.56, 10);
  });

  test('zero-length segment가 섞인 polyline에서 정상 동작한다', () => {
    // [(0,0), (0,0), (3,4)]: query (3,0)
    // segment 0: zero-length, closest=(0,0), distSq=9
    // segment 1: (0,0)→(3,4): t=(9+0)/25=0.36 → closest=(1.08,1.44), distSq≈5.76
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ],
    };
    const out = makeOut();
    expect(closestPointInto(out, poly, { x: 3, y: 0 })).toBe(true);
    expect(out.x).toBeCloseTo(1.08, 10);
    expect(out.y).toBeCloseTo(1.44, 10);
  });

  test('tuple point input으로 closest를 기록한다', () => {
    const out = makeOut();
    expect(closestPointInto(out, TWO_PT, [0, 4])).toBe(true);
    expect(out.x).toBeCloseTo(1.92, 10);
    expect(out.y).toBeCloseTo(2.56, 10);
  });

  test('점 배열 자체에서 closest point를 기록한다', () => {
    const out = makeOut();
    expect(closestPointInto(out, [{ x: 0, y: 0 }, [3, 4]], { x: 0, y: 4 })).toBe(true);
    expect(out.x).toBeCloseTo(1.92, 10);
    expect(out.y).toBeCloseTo(2.56, 10);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(closestPointInto(out, TWO_PT, { x: 0, y: 4 })).toBe(true);
    expect(out[0]).toBeCloseTo(1.92, 10);
    expect(out[1]).toBeCloseTo(2.56, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// distanceToPoint
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline distance - distanceToPoint', () => {
  test('빈 polyline은 Infinity를 반환한다', () => {
    expect(distanceToPoint(EMPTY, { x: 0, y: 0 })).toBe(Infinity);
  });

  test('단일 point polyline은 첫 point까지의 거리를 반환한다', () => {
    // SINGLE = (1,2), query (4,6): dist=sqrt(9+16)=5
    expect(distanceToPoint(SINGLE, { x: 4, y: 6 })).toBeCloseTo(5, 10);
  });

  test('total length 0인 repeated-point polyline은 첫 point까지의 거리를 반환한다', () => {
    // REPEATED = (3,5), query (0,1): dist=sqrt(9+16)=5
    expect(distanceToPoint(REPEATED, { x: 0, y: 1 })).toBeCloseTo(5, 10);
  });

  test('segment 위 point의 거리는 0이다', () => {
    // TWO_PT: (0,0)→(3,4), midpoint=(1.5,2)
    expect(distanceToPoint(TWO_PT, { x: 1.5, y: 2 })).toBeCloseTo(0, 10);
  });

  test('segment exterior point의 거리를 올바르게 반환한다', () => {
    // TWO_PT: (0,0)→(3,4), query (0,4)
    // t=0.64, closest=(1.92,2.56), dist=sqrt((1.92)^2+(2.56-4)^2)=sqrt(3.6864+2.0736)=sqrt(5.76)=2.4
    expect(distanceToPoint(TWO_PT, { x: 0, y: 4 })).toBeCloseTo(2.4, 10);
  });

  test('여러 segment 중 최단 거리를 반환한다', () => {
    // L_SHAPE: (0,0)→(4,0)→(4,3), query (1,-1) → closest=(1,0), dist=1
    expect(distanceToPoint(L_SHAPE, { x: 1, y: -1 })).toBeCloseTo(1, 10);
  });

  test('closestPointInto 정책과 일치하는 거리를 반환한다', () => {
    // tie-break polyline: (0,0)→(4,0)→(4,0)→(4,4), query (2,2)
    // closestPointInto → (2,0), distanceToPoint → sqrt(4)=2
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ],
    };
    const closestOut: XYWritable = { x: 0, y: 0 };
    closestPointInto(closestOut, poly, { x: 2, y: 2 });
    const dx = closestOut.x - 2,
      dy = closestOut.y - 2;
    const expectedDist = Math.sqrt(dx * dx + dy * dy);
    expect(distanceToPoint(poly, { x: 2, y: 2 })).toBeCloseTo(expectedDist, 10);
  });

  test('tuple point input으로 거리를 계산한다', () => {
    expect(distanceToPoint(TWO_PT, [0, 4])).toBeCloseTo(2.4, 10);
  });

  test('점 배열 자체에서 거리를 계산한다', () => {
    expect(distanceToPoint([{ x: 0, y: 0 }, [3, 4]], { x: 0, y: 4 })).toBeCloseTo(2.4, 10);
  });
});
