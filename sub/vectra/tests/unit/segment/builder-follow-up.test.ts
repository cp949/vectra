/**
 * segment builder follow-up — fromPointVectorInto / fromMidpointAngleLengthInto /
 * fromCircleInto / fromNormalInto 와 각 companion의 unit test.
 *
 * 검증: 정상 입력, zero-length/zero-vector degenerate, negative length, non-finite(NaN/Infinity/-Infinity),
 * self-aliasing 안전성, companion-Into 일관성, out 반환값.
 */

import { describe, expect, test } from 'vitest';
import { fromCircle } from '../../../src/segment/from-circle';
import { fromCircleInto } from '../../../src/segment/from-circle-into';
import { fromMidpointAngleLength } from '../../../src/segment/from-midpoint-angle-length';
import { fromMidpointAngleLengthInto } from '../../../src/segment/from-midpoint-angle-length-into';
import { fromNormal } from '../../../src/segment/from-normal';
import { fromNormalInto } from '../../../src/segment/from-normal-into';
import { fromPointVector } from '../../../src/segment/from-point-vector';
import { fromPointVectorInto } from '../../../src/segment/from-point-vector-into';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 지정한 끝점 좌표로 선분을 만든다. */
function makeSeg(ax = 0, ay = 0, bx = 0, by = 0): SegmentWritable {
  return { x1: ax, y1: ay, x2: bx, y2: by };
}

// ─── fromPointVectorInto ─────────────────────────────────────────────────────

describe('segment builder - fromPointVectorInto', () => {
  test('시작점에 origin, 끝점에 origin + vec를 기록한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 1, y: 2 }, { x: 3, y: 4 });

    expect(out).toEqual({ x1: 1, y1: 2, x2: 4, y2: 6 });
  });

  test('zero vector에서 zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 5, y: 7 }, { x: 0, y: 0 });

    expect(out).toEqual({ x1: 5, y1: 7, x2: 5, y2: 7 });
  });

  test('out을 반환한다', () => {
    const out = makeSeg();
    const result = fromPointVectorInto(out, { x: 0, y: 0 }, { x: 1, y: 1 });

    expect(result).toBe(out);
  });

  test('origin에 NaN이 있으면 결과에 NaN이 흐른다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: NaN, y: 0 }, { x: 1, y: 1 });

    expect(Number.isNaN(out.x1)).toBe(true);
    expect(Number.isNaN(out.x2)).toBe(true);
  });

  test('vec에 Infinity가 있으면 끝점에 Infinity가 흐른다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 0, y: 0 }, { x: Infinity, y: 0 });

    expect(out.x2).toBe(Infinity);
  });
});

// ─── fromMidpointAngleLengthInto ─────────────────────────────────────────────

describe('segment builder - fromMidpointAngleLengthInto', () => {
  test('angle=0, length=6이면 (mid.x - 3, mid.y) to (mid.x + 3, mid.y)를 기록한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 10, y: 5 }, 0, 6);

    expect(out.x1).toBeCloseTo(7, 10);
    expect(out.y1).toBeCloseTo(5, 10);
    expect(out.x2).toBeCloseTo(13, 10);
    expect(out.y2).toBeCloseTo(5, 10);
  });

  test('angle=Math.PI/2이면 수직 대칭 segment를 기록한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, Math.PI / 2, 10);

    expect(out.x1).toBeCloseTo(0, 10);
    expect(out.y1).toBeCloseTo(-5, 10);
    expect(out.x2).toBeCloseTo(0, 10);
    expect(out.y2).toBeCloseTo(5, 10);
  });

  test('length=0이면 midpoint zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 3, y: 7 }, 1.2, 0);

    expect(out).toEqual({ x1: 3, y1: 7, x2: 3, y2: 7 });
  });

  test('negative length이면 endpoint가 angle 반대 방향으로 뒤집힌다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, 0, -4);

    // half = -2, a = 0 - cos(0)*(-2) = 2, b = 0 + cos(0)*(-2) = -2
    expect(out.x1).toBeCloseTo(2, 10);
    expect(out.x2).toBeCloseTo(-2, 10);
  });

  test('angle=Infinity이면 cos/sin 결과 NaN이 흐른다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, Infinity, 10);

    expect(Number.isNaN(out.x1)).toBe(true);
    expect(Number.isNaN(out.x2)).toBe(true);
  });

  test('length=-Infinity이면 x에 ±Infinity, y에 NaN이 흐른다', () => {
    const out = makeSeg();
    // half = -Infinity/2 = -Infinity, a.x = 0 - cos(0)*(-Infinity) = Infinity, b.x = 0 + cos(0)*(-Infinity) = -Infinity
    // a.y = b.y = 0 - sin(0)*(-Infinity) = -0*(-Infinity) = NaN
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, 0, -Infinity);

    expect(out.x1).toBe(Infinity);
    expect(Number.isNaN(out.y1)).toBe(true);
    expect(out.x2).toBe(-Infinity);
    expect(Number.isNaN(out.y2)).toBe(true);
  });

  test('out을 반환한다', () => {
    const out = makeSeg();
    const result = fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, 0, 4);

    expect(result).toBe(out);
  });
});

// ─── fromCircleInto ──────────────────────────────────────────────────────────

describe('segment builder - fromCircleInto', () => {
  test('default angle=0에서 horizontal diameter를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { cx: 0, cy: 0, r: 5 });

    expect(out.x1).toBeCloseTo(-5, 10);
    expect(out.y1).toBeCloseTo(0, 10);
    expect(out.x2).toBeCloseTo(5, 10);
    expect(out.y2).toBeCloseTo(0, 10);
  });

  test('angle=Math.PI/2에서 vertical diameter를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { cx: 0, cy: 0, r: 3 }, Math.PI / 2);

    expect(out.x1).toBeCloseTo(0, 10);
    expect(out.y1).toBeCloseTo(-3, 10);
    expect(out.x2).toBeCloseTo(0, 10);
    expect(out.y2).toBeCloseTo(3, 10);
  });

  test('radius=0이면 zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { cx: 5, cy: 6, r: 0 });

    expect(out).toEqual({ x1: 5, y1: 6, x2: 5, y2: 6 });
  });

  test('negative radius이면 zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { cx: 1, cy: 2, r: -3 });

    expect(out).toEqual({ x1: 1, y1: 2, x2: 1, y2: 2 });
  });

  test('radius=Infinity이면 x에 ±Infinity, y에 NaN이 흐른다', () => {
    const out = makeSeg();
    // angle=0: a.x=-Infinity, b.x=Infinity. a.y=b.y=cy-sin(0)*Infinity=0-0*Infinity=NaN
    fromCircleInto(out, { cx: 0, cy: 0, r: Infinity });

    expect(out.x1).toBe(-Infinity);
    expect(Number.isNaN(out.y1)).toBe(true);
    expect(out.x2).toBe(Infinity);
    expect(Number.isNaN(out.y2)).toBe(true);
  });

  test('out을 반환한다', () => {
    const out = makeSeg();
    const result = fromCircleInto(out, { cx: 0, cy: 0, r: 1 });

    expect(result).toBe(out);
  });
});

// ─── fromPointVector companion ───────────────────────────────────────────────

describe('segment companion - fromPointVector', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromPointVector({ x: 1, y: 2 }, { x: 3, y: 4 });

    expect(result).toEqual({ x1: 1, y1: 2, x2: 4, y2: 6 });
  });

  test('fromPointVectorInto와 동일한 결과를 반환한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 5, y: 6 }, { x: -1, y: 2 });
    const result = fromPointVector({ x: 5, y: 6 }, { x: -1, y: 2 });

    expect(result.x1).toBe(out.x1);
    expect(result.y1).toBe(out.y1);
    expect(result.x2).toBe(out.x2);
    expect(result.y2).toBe(out.y2);
  });
});

// ─── fromMidpointAngleLength companion ───────────────────────────────────────

describe('segment companion - fromMidpointAngleLength', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromMidpointAngleLength({ x: 0, y: 0 }, 0, 10);

    expect(result.x1).toBeCloseTo(-5, 10);
    expect(result.y1).toBeCloseTo(0, 10);
    expect(result.x2).toBeCloseTo(5, 10);
    expect(result.y2).toBeCloseTo(0, 10);
  });

  test('fromMidpointAngleLengthInto와 동일한 결과를 반환한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 3, y: 4 }, Math.PI / 4, 8);
    const result = fromMidpointAngleLength({ x: 3, y: 4 }, Math.PI / 4, 8);

    expect(result.x1).toBeCloseTo(out.x1, 10);
    expect(result.y1).toBeCloseTo(out.y1, 10);
    expect(result.x2).toBeCloseTo(out.x2, 10);
    expect(result.y2).toBeCloseTo(out.y2, 10);
  });
});

// ─── fromCircle companion ─────────────────────────────────────────────────────

describe('segment companion - fromCircle', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromCircle({ cx: 0, cy: 0, r: 3 });

    expect(result.x1).toBeCloseTo(-3, 10);
    expect(result.y1).toBeCloseTo(0, 10);
    expect(result.x2).toBeCloseTo(3, 10);
    expect(result.y2).toBeCloseTo(0, 10);
  });

  test('fromCircleInto와 동일한 결과를 반환한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { cx: 2, cy: 5, r: 7 }, Math.PI / 3);
    const result = fromCircle({ cx: 2, cy: 5, r: 7 }, Math.PI / 3);

    expect(result.x1).toBeCloseTo(out.x1, 10);
    expect(result.y1).toBeCloseTo(out.y1, 10);
    expect(result.x2).toBeCloseTo(out.x2, 10);
    expect(result.y2).toBeCloseTo(out.y2, 10);
  });
});

// ─── fromNormalInto ───────────────────────────────────────────────────────────

describe('segment builder - fromNormalInto', () => {
  // 일반 horizontal segment
  test('horizontal segment t=0.5, length=3이면 (2,0)에서 (2,3)까지 기록한다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 0, y1: 0, x2: 4, y2: 0 };
    fromNormalInto(out, seg, 0.5, 3);
    expect(out).toEqual({ x1: 2, y1: 0, x2: 2, y2: 3 });
  });

  // t < 0, t > 1 extrapolation
  test('t=2이면 supporting line 위 extrapolation 시작점을 기록한다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 0, y1: 0, x2: 4, y2: 0 };
    fromNormalInto(out, seg, 2, 1);
    expect(out).toEqual({ x1: 8, y1: 0, x2: 8, y2: 1 });
  });

  // length = 0
  test('length=0이면 두 끝점에 pointAtT를 기록한다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 0, y1: 0, x2: 4, y2: 0 };
    fromNormalInto(out, seg, 0.5, 0);
    expect(out).toEqual({ x1: 2, y1: 0, x2: 2, y2: 0 });
  });

  // negative length → right normal
  test('negative length이면 endpoint가 right normal 방향으로 뒤집힌다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 0, y1: 0, x2: 4, y2: 0 };
    fromNormalInto(out, seg, 0.5, -3);
    expect(out).toEqual({ x1: 2, y1: 0, x2: 2, y2: -3 });
  });

  // zero-length segment
  test('zero-length 기준 segment에서 finite t이면 두 끝점에 기준 시작점을 기록한다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 3, y1: 5, x2: 3, y2: 5 };
    fromNormalInto(out, seg, 0.5, 10);
    expect(out).toEqual({ x1: 3, y1: 5, x2: 3, y2: 5 });
  });

  test('zero-length 기준 segment에서 t=Infinity이면 Infinity*0=NaN이 흐른다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 3, y1: 5, x2: 3, y2: 5 };
    fromNormalInto(out, seg, Infinity, 10);
    expect(Number.isNaN(out.x1)).toBe(true);
    expect(Number.isNaN(out.x2)).toBe(true);
  });

  // self-aliasing
  test('out과 segment가 같은 object여도 입력 좌표를 보존한 결과가 나온다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 4, y2: 0 };
    fromNormalInto(out, out, 0.5, 3);
    expect(out).toEqual({ x1: 2, y1: 0, x2: 2, y2: 3 });
  });

  // non-finite: length = Infinity
  test('length=Infinity이면 y2에 Infinity, x2에 NaN이 흐른다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    fromNormalInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, 0.5, Infinity);
    expect([out.x1, out.y1]).toEqual([2, 0]);
    expect(out.y2).toBe(Infinity);
    expect(Number.isNaN(out.x2)).toBe(true);
  });

  // diagonal segment
  test('diagonal segment에서 left unit normal이 정규화되어 length만큼 적용된다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    // (0,0) -> (3,4), length=5, t=0 → 시작점 (0,0), left normal = (-4/5, 3/5), 끝점 (0 + (-4/5)*5, 0 + (3/5)*5) = (-4, 3)
    fromNormalInto(out, { x1: 0, y1: 0, x2: 3, y2: 4 }, 0, 5);
    expect(out.x1).toBeCloseTo(0, 10);
    expect(out.y1).toBeCloseTo(0, 10);
    expect(out.x2).toBeCloseTo(-4, 10);
    expect(out.y2).toBeCloseTo(3, 10);
  });

  // t = Infinity
  test('t=Infinity이면 x1에 Infinity가 흐른다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    fromNormalInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, Infinity, 1);
    expect(out.x1).toBe(Infinity);
  });

  // non-finite: length = -Infinity
  test('length=-Infinity이면 y2에 -Infinity, x2에 NaN이 흐른다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    fromNormalInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, 0.5, -Infinity);
    expect([out.x1, out.y1]).toEqual([2, 0]);
    expect(out.y2).toBe(-Infinity);
    expect(Number.isNaN(out.x2)).toBe(true);
  });

  // input endpoint NaN
  test('기준 segment 시작점에 NaN이 있으면 결과에 NaN이 흐른다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    fromNormalInto(out, { x1: NaN, y1: 0, x2: 4, y2: 0 }, 0.5, 1);
    expect(Number.isNaN(out.x1)).toBe(true);
  });

  test('기준 segment 끝점에 NaN이 있으면 결과에 NaN이 흐른다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    fromNormalInto(out, { x1: 0, y1: 0, x2: NaN, y2: 0 }, 0.5, 1);
    expect(Number.isNaN(out.x1)).toBe(true);
  });

  // out 반환
  test('out을 반환한다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const result = fromNormalInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, 0.5, 1);
    expect(result).toBe(out);
  });
});

// ─── fromNormal companion ─────────────────────────────────────────────────────

describe('segment companion - fromNormal', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromNormal({ x1: 0, y1: 0, x2: 4, y2: 0 }, 0.5, 3);
    expect(result).toEqual({ x1: 2, y1: 0, x2: 2, y2: 3 });
  });

  test('fromNormalInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const seg = { x1: 0, y1: 0, x2: 4, y2: 0 };
    fromNormalInto(out, seg, 0.5, 3);
    const result = fromNormal(seg, 0.5, 3);
    expect(result.x1).toBe(out.x1);
    expect(result.y1).toBe(out.y1);
    expect(result.x2).toBe(out.x2);
    expect(result.y2).toBe(out.y2);
  });
});
