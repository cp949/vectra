/**
 * tangentAtLengthInto / tangentAtLength unit test.
 *
 * arc-length offset 위치가 속한 non-zero segment의 단위 tangent 계산을 검증한다.
 * vertex 평균 tangent(tangentAtIndex)와 달리 segment 진행 방향을 그대로 사용한다.
 */

import { describe, expect, test } from 'vitest';
import { pointAtLength } from '../../../src/polyline/point-at-length';
import { tangentAtLength } from '../../../src/polyline/tangent-at-length';
import { tangentAtLengthInto } from '../../../src/polyline/tangent-at-length-into';
import type { PolylineLike, XYObjectWritable, XYWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공용 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };
const REPEATED: PolylineLike = {
  points: [
    { x: 3, y: 5 },
    { x: 3, y: 5 },
  ],
};

/** (0,0)→(3,4), 길이=5, 단위 방향 (0.6, 0.8) */
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

/** 앞에 zero-length segment: (0,0)→(0,0)→(1,0), 전체=1 */
const ZERO_FRONT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
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

function makeOut(): XYObjectWritable {
  return { x: 99, y: 99 };
}

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLengthInto — degenerate 실패
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLengthInto - degenerate 실패', () => {
  test('empty polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, EMPTY, 1)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('single-point polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, SINGLE, 0)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('total length 0인 repeated-point polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, REPEATED, 0)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLengthInto — segment 내부 / clamp
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLengthInto - segment 내부와 clamp', () => {
  test('2점 polyline 내부 offset은 단위 segment 방향이다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, TWO_PT, 2.5)).toBe(true);
    expect(out.x).toBeCloseTo(0.6, 10);
    expect(out.y).toBeCloseTo(0.8, 10);
  });

  test('반환 tangent는 단위 벡터다', () => {
    const out = makeOut();
    tangentAtLengthInto(out, TWO_PT, 2.5);
    expect(Math.hypot(out.x, out.y)).toBeCloseTo(1, 10);
  });

  test('negative length는 첫 non-zero segment 방향으로 clamp된다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, -1)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('overflow length는 마지막 non-zero segment 방향으로 clamp된다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, 100)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('length=-Infinity는 첫 non-zero segment 방향으로 clamp된다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, -Infinity)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('length=Infinity는 마지막 non-zero segment 방향으로 clamp된다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, Infinity)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('length=NaN은 NaN tangent를 기록한다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, Number.NaN)).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('total length가 NaN이면 NaN tangent를 기록한다', () => {
    const out = makeOut();
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Number.NaN, y: 1 },
      ],
    };
    expect(tangentAtLengthInto(out, poly, 0.5)).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLengthInto — L자 polyline segment 선택
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLengthInto - 꺾인 polyline segment 선택', () => {
  test('L자 첫 segment 내부는 (1, 0)이다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('L자 두 번째 segment 내부는 (0, 1)이다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, 1.5)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('L자 segment boundary는 앞쪽 segment 방향 (1, 0)이다', () => {
    // 전체=2, boundary target=1 → 앞쪽 segment(먼저 끝나는 segment) 방향
    const out = makeOut();
    expect(tangentAtLengthInto(out, L_SHAPE, 1)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLengthInto — zero-length segment 건너뛰기
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLengthInto - zero-length segment', () => {
  test('앞쪽 zero-length segment를 건너뛰고 다음 non-zero segment 방향을 사용한다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, ZERO_FRONT, 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('앞쪽 zero-length segment가 있어도 length 0은 첫 non-zero segment 방향이다', () => {
    const out = makeOut();
    expect(tangentAtLengthInto(out, ZERO_FRONT, 0)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('중간 zero-length segment가 있어도 target 구간의 non-zero segment 방향을 사용한다', () => {
    // ZERO_MID: seg0 (1,0) [0,1], zero seg, seg2 (0,1) [1,2]
    const out = makeOut();
    expect(tangentAtLengthInto(out, ZERO_MID, 0.5)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);

    const out2 = makeOut();
    expect(tangentAtLengthInto(out2, ZERO_MID, 1.5)).toBe(true);
    expect(out2.x).toBeCloseTo(0, 10);
    expect(out2.y).toBeCloseTo(1, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLengthInto — input 형태와 aliasing
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLengthInto - input 형태와 aliasing', () => {
  test('bare point array input을 지원한다', () => {
    const out = makeOut();
    expect(
      tangentAtLengthInto(
        out,
        [
          [0, 0],
          [3, 4],
        ],
        2.5
      )
    ).toBe(true);
    expect(out.x).toBeCloseTo(0.6, 10);
    expect(out.y).toBeCloseTo(0.8, 10);
  });

  test('out이 polyline의 point와 alias되어도 source 좌표를 먼저 읽고 기록한다', () => {
    const endpoint: XYWritable = { x: 3, y: 4 };
    const poly: PolylineLike = { points: [{ x: 0, y: 0 }, endpoint] };
    expect(tangentAtLengthInto(endpoint, poly, 2.5)).toBe(true);
    expect(endpoint.x).toBeCloseTo(0.6, 10);
    expect(endpoint.y).toBeCloseTo(0.8, 10);
  });

  test('out이 polyline의 시작 point와 alias되어도 source 좌표를 먼저 읽고 기록한다', () => {
    const start: XYWritable = { x: 0, y: 0 };
    const poly: PolylineLike = { points: [start, { x: 3, y: 4 }] };
    expect(tangentAtLengthInto(start, poly, 2.5)).toBe(true);
    expect(start.x).toBeCloseTo(0.6, 10);
    expect(start.y).toBeCloseTo(0.8, 10);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(tangentAtLengthInto(out, TWO_PT, 2.5)).toBe(true);
    expect(out[0]).toBeCloseTo(0.6, 10);
    expect(out[1]).toBeCloseTo(0.8, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLengthInto — pointAtLength와 boundary owner 일치
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLengthInto - pointAtLength boundary 정합', () => {
  test('segment boundary는 pointAtLength와 같은 앞쪽 segment가 owner다', () => {
    // L_SHAPE 전체=2, boundary target=1. pointAtLength는 junction 좌표 (1,0)을 반환한다(소유 segment와
    // 무관하게 같은 vertex). tangentAtLength가 seg0 방향 (1,0)을 반환해 boundary owner=seg0을 고정한다.
    const pt = pointAtLength(L_SHAPE, 1);
    expect(pt?.x).toBeCloseTo(1, 10);
    expect(pt?.y).toBeCloseTo(0, 10);

    const tan = tangentAtLength(L_SHAPE, 1);
    expect(tan?.x).toBeCloseTo(1, 10);
    expect(tan?.y).toBeCloseTo(0, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tangentAtLength (companion)
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline tangentAtLength companion', () => {
  test('성공 시 새 {x, y} plain object를 반환한다', () => {
    const result = tangentAtLength(TWO_PT, 2.5);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0.6, 10);
    expect(result?.y).toBeCloseTo(0.8, 10);
  });

  test('실패 시 undefined를 반환한다', () => {
    expect(tangentAtLength(EMPTY, 1)).toBeUndefined();
    expect(tangentAtLength(SINGLE, 0)).toBeUndefined();
    expect(tangentAtLength(REPEATED, 0)).toBeUndefined();
  });
});
