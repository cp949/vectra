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
import type { SegmentWritable, XYWritable } from '../../../src/types';

function makeSeg(ax = 0, ay = 0, bx = 0, by = 0): SegmentWritable {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

// ─── fromPointVectorInto ─────────────────────────────────────────────────────

describe('segment builder - fromPointVectorInto', () => {
  test('object input에서 a = origin, b = origin + vec를 기록한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 1, y: 2 }, { x: 3, y: 4 });

    expect(out.a).toEqual({ x: 1, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 6 });
  });

  test('tuple input에서 같은 결과를 기록한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, [1, 2], [3, 4]);

    expect(out.a).toEqual({ x: 1, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 6 });
  });

  test('zero vector에서 zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 5, y: 7 }, { x: 0, y: 0 });

    expect(out.a).toEqual({ x: 5, y: 7 });
    expect(out.b).toEqual({ x: 5, y: 7 });
  });

  test('out을 반환한다', () => {
    const out = makeSeg();
    const result = fromPointVectorInto(out, { x: 0, y: 0 }, { x: 1, y: 1 });

    expect(result).toBe(out);
  });

  test('out.a와 origin이 같은 storage여도 aliasing이 안전하다', () => {
    const sharedA: XYWritable = { x: 3, y: 4 };
    const out: SegmentWritable = { a: sharedA, b: { x: 0, y: 0 } };
    fromPointVectorInto(out, sharedA, { x: 2, y: 1 });

    expect(out.a).toEqual({ x: 3, y: 4 });
    expect(out.b).toEqual({ x: 5, y: 5 });
  });

  test('out.b와 vec가 같은 storage여도 aliasing이 안전하다', () => {
    const sharedB: XYWritable = { x: 2, y: 1 };
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: sharedB };
    fromPointVectorInto(out, { x: 3, y: 4 }, sharedB);

    expect(out.a).toEqual({ x: 3, y: 4 });
    expect(out.b).toEqual({ x: 5, y: 5 });
  });

  test('origin에 NaN이 있으면 결과에 NaN이 흐른다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: NaN, y: 0 }, { x: 1, y: 1 });

    expect(Number.isNaN(out.a.x)).toBe(true);
    expect(Number.isNaN(out.b.x)).toBe(true);
  });

  test('vec에 Infinity가 있으면 b에 Infinity가 흐른다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 0, y: 0 }, { x: Infinity, y: 0 });

    expect(out.b.x).toBe(Infinity);
  });
});

// ─── fromMidpointAngleLengthInto ─────────────────────────────────────────────

describe('segment builder - fromMidpointAngleLengthInto', () => {
  test('angle=0, length=6이면 (mid.x - 3, mid.y) to (mid.x + 3, mid.y)를 기록한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 10, y: 5 }, 0, 6);

    expect(out.a.x).toBeCloseTo(7, 10);
    expect(out.a.y).toBeCloseTo(5, 10);
    expect(out.b.x).toBeCloseTo(13, 10);
    expect(out.b.y).toBeCloseTo(5, 10);
  });

  test('angle=Math.PI/2이면 수직 대칭 segment를 기록한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, Math.PI / 2, 10);

    expect(out.a.x).toBeCloseTo(0, 10);
    expect(out.a.y).toBeCloseTo(-5, 10);
    expect(out.b.x).toBeCloseTo(0, 10);
    expect(out.b.y).toBeCloseTo(5, 10);
  });

  test('length=0이면 midpoint zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 3, y: 7 }, 1.2, 0);

    expect(out.a).toEqual({ x: 3, y: 7 });
    expect(out.b).toEqual({ x: 3, y: 7 });
  });

  test('negative length이면 endpoint가 angle 반대 방향으로 뒤집힌다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, 0, -4);

    // half = -2, a = 0 - cos(0)*(-2) = 2, b = 0 + cos(0)*(-2) = -2
    expect(out.a.x).toBeCloseTo(2, 10);
    expect(out.b.x).toBeCloseTo(-2, 10);
  });

  test('angle=Infinity이면 cos/sin 결과 NaN이 흐른다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, Infinity, 10);

    expect(Number.isNaN(out.a.x)).toBe(true);
    expect(Number.isNaN(out.b.x)).toBe(true);
  });

  test('length=-Infinity이면 x에 ±Infinity, y에 NaN이 흐른다', () => {
    const out = makeSeg();
    // half = -Infinity/2 = -Infinity, a.x = 0 - cos(0)*(-Infinity) = Infinity, b.x = 0 + cos(0)*(-Infinity) = -Infinity
    // a.y = b.y = 0 - sin(0)*(-Infinity) = -0*(-Infinity) = NaN
    fromMidpointAngleLengthInto(out, { x: 0, y: 0 }, 0, -Infinity);

    expect(out.a.x).toBe(Infinity);
    expect(Number.isNaN(out.a.y)).toBe(true);
    expect(out.b.x).toBe(-Infinity);
    expect(Number.isNaN(out.b.y)).toBe(true);
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
    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: 5 });

    expect(out.a.x).toBeCloseTo(-5, 10);
    expect(out.a.y).toBeCloseTo(0, 10);
    expect(out.b.x).toBeCloseTo(5, 10);
    expect(out.b.y).toBeCloseTo(0, 10);
  });

  test('angle=Math.PI/2에서 vertical diameter를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: 3 }, Math.PI / 2);

    expect(out.a.x).toBeCloseTo(0, 10);
    expect(out.a.y).toBeCloseTo(-3, 10);
    expect(out.b.x).toBeCloseTo(0, 10);
    expect(out.b.y).toBeCloseTo(3, 10);
  });

  test('tuple circle input을 처리한다', () => {
    const out = makeSeg();
    fromCircleInto(out, [[2, 3], 4]);

    expect(out.a.x).toBeCloseTo(-2, 10);
    expect(out.a.y).toBeCloseTo(3, 10);
    expect(out.b.x).toBeCloseTo(6, 10);
    expect(out.b.y).toBeCloseTo(3, 10);
  });

  test('radius=0이면 zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { center: { x: 5, y: 6 }, radius: 0 });

    expect(out.a).toEqual({ x: 5, y: 6 });
    expect(out.b).toEqual({ x: 5, y: 6 });
  });

  test('negative radius이면 zero-length segment를 기록한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { center: { x: 1, y: 2 }, radius: -3 });

    expect(out.a).toEqual({ x: 1, y: 2 });
    expect(out.b).toEqual({ x: 1, y: 2 });
  });

  test('radius=Infinity이면 x에 ±Infinity, y에 NaN이 흐른다', () => {
    const out = makeSeg();
    // angle=0: a.x=-Infinity, b.x=Infinity. a.y=b.y=cy-sin(0)*Infinity=0-0*Infinity=NaN
    fromCircleInto(out, { center: { x: 0, y: 0 }, radius: Infinity });

    expect(out.a.x).toBe(-Infinity);
    expect(Number.isNaN(out.a.y)).toBe(true);
    expect(out.b.x).toBe(Infinity);
    expect(Number.isNaN(out.b.y)).toBe(true);
  });

  test('out을 반환한다', () => {
    const out = makeSeg();
    const result = fromCircleInto(out, { center: { x: 0, y: 0 }, radius: 1 });

    expect(result).toBe(out);
  });
});

// ─── fromPointVector companion ───────────────────────────────────────────────

describe('segment companion - fromPointVector', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromPointVector({ x: 1, y: 2 }, { x: 3, y: 4 });

    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
  });

  test('fromPointVectorInto와 동일한 결과를 반환한다', () => {
    const out = makeSeg();
    fromPointVectorInto(out, { x: 5, y: 6 }, { x: -1, y: 2 });
    const result = fromPointVector({ x: 5, y: 6 }, { x: -1, y: 2 });

    expect(result.a.x).toBe(out.a.x);
    expect(result.a.y).toBe(out.a.y);
    expect(result.b.x).toBe(out.b.x);
    expect(result.b.y).toBe(out.b.y);
  });
});

// ─── fromMidpointAngleLength companion ───────────────────────────────────────

describe('segment companion - fromMidpointAngleLength', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromMidpointAngleLength({ x: 0, y: 0 }, 0, 10);

    expect(result.a.x).toBeCloseTo(-5, 10);
    expect(result.a.y).toBeCloseTo(0, 10);
    expect(result.b.x).toBeCloseTo(5, 10);
    expect(result.b.y).toBeCloseTo(0, 10);
  });

  test('fromMidpointAngleLengthInto와 동일한 결과를 반환한다', () => {
    const out = makeSeg();
    fromMidpointAngleLengthInto(out, { x: 3, y: 4 }, Math.PI / 4, 8);
    const result = fromMidpointAngleLength({ x: 3, y: 4 }, Math.PI / 4, 8);

    expect(result.a.x).toBeCloseTo(out.a.x, 10);
    expect(result.a.y).toBeCloseTo(out.a.y, 10);
    expect(result.b.x).toBeCloseTo(out.b.x, 10);
    expect(result.b.y).toBeCloseTo(out.b.y, 10);
  });
});

// ─── fromCircle companion ─────────────────────────────────────────────────────

describe('segment companion - fromCircle', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromCircle({ center: { x: 0, y: 0 }, radius: 3 });

    expect(result.a.x).toBeCloseTo(-3, 10);
    expect(result.a.y).toBeCloseTo(0, 10);
    expect(result.b.x).toBeCloseTo(3, 10);
    expect(result.b.y).toBeCloseTo(0, 10);
  });

  test('fromCircleInto와 동일한 결과를 반환한다', () => {
    const out = makeSeg();
    fromCircleInto(out, { center: { x: 2, y: 5 }, radius: 7 }, Math.PI / 3);
    const result = fromCircle({ center: { x: 2, y: 5 }, radius: 7 }, Math.PI / 3);

    expect(result.a.x).toBeCloseTo(out.a.x, 10);
    expect(result.a.y).toBeCloseTo(out.a.y, 10);
    expect(result.b.x).toBeCloseTo(out.b.x, 10);
    expect(result.b.y).toBeCloseTo(out.b.y, 10);
  });
});

// ─── fromNormalInto ───────────────────────────────────────────────────────────

describe('segment builder - fromNormalInto', () => {
  // 일반 horizontal segment
  test('horizontal segment t=0.5, length=3이면 a=(2,0) b=(2,3)을 기록한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    fromNormalInto(out, seg, 0.5, 3);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b).toEqual({ x: 2, y: 3 });
  });

  // t < 0, t > 1 extrapolation
  test('t=2이면 supporting line 위 extrapolation a를 기록한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    fromNormalInto(out, seg, 2, 1);
    expect(out.a).toEqual({ x: 8, y: 0 });
    expect(out.b).toEqual({ x: 8, y: 1 });
  });

  // length = 0
  test('length=0이면 a = b = pointAtT를 기록한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    fromNormalInto(out, seg, 0.5, 0);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b).toEqual({ x: 2, y: 0 });
  });

  // negative length → right normal
  test('negative length이면 endpoint가 right normal 방향으로 뒤집힌다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    fromNormalInto(out, seg, 0.5, -3);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b).toEqual({ x: 2, y: -3 });
  });

  // zero-length segment
  test('zero-length 기준 segment에서 finite t이면 a = b = segment.a를 기록한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 3, y: 5 }, b: { x: 3, y: 5 } };
    fromNormalInto(out, seg, 0.5, 10);
    expect(out.a).toEqual({ x: 3, y: 5 });
    expect(out.b).toEqual({ x: 3, y: 5 });
  });

  test('zero-length 기준 segment에서 t=Infinity이면 Infinity*0=NaN이 흐른다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 3, y: 5 }, b: { x: 3, y: 5 } };
    fromNormalInto(out, seg, Infinity, 10);
    expect(Number.isNaN(out.a.x)).toBe(true);
    expect(Number.isNaN(out.b.x)).toBe(true);
  });

  // tuple segment input
  test('tuple segment input을 처리한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    fromNormalInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
      ],
      0.5,
      3
    );
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b).toEqual({ x: 2, y: 3 });
  });

  // self-aliasing
  test('out과 segment가 같은 object여도 입력 좌표를 보존한 결과가 나온다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    fromNormalInto(out, out, 0.5, 3);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b).toEqual({ x: 2, y: 3 });
  });

  // non-finite: length = Infinity
  test('length=Infinity이면 b.y에 Infinity, b.x에 NaN이 흐른다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    fromNormalInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 0.5, Infinity);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b.y).toBe(Infinity);
    expect(Number.isNaN(out.b.x)).toBe(true);
  });

  // diagonal segment
  test('diagonal segment에서 left unit normal이 정규화되어 length만큼 적용된다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    // (0,0) -> (3,4), length=5, t=0 → a=(0,0), left normal = (-4/5, 3/5), b=(0 + (-4/5)*5, 0 + (3/5)*5) = (-4, 3)
    fromNormalInto(out, { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } }, 0, 5);
    expect(out.a.x).toBeCloseTo(0, 10);
    expect(out.a.y).toBeCloseTo(0, 10);
    expect(out.b.x).toBeCloseTo(-4, 10);
    expect(out.b.y).toBeCloseTo(3, 10);
  });

  // t = Infinity
  test('t=Infinity이면 a.x에 Infinity가 흐른다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    fromNormalInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, Infinity, 1);
    expect(out.a.x).toBe(Infinity);
  });

  // non-finite: length = -Infinity
  test('length=-Infinity이면 b.y에 -Infinity, b.x에 NaN이 흐른다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    fromNormalInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 0.5, -Infinity);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b.y).toBe(-Infinity);
    expect(Number.isNaN(out.b.x)).toBe(true);
  });

  // input endpoint NaN
  test('segment.a에 NaN이 있으면 결과에 NaN이 흐른다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    fromNormalInto(out, { a: { x: NaN, y: 0 }, b: { x: 4, y: 0 } }, 0.5, 1);
    expect(Number.isNaN(out.a.x)).toBe(true);
  });

  test('segment.b에 NaN이 있으면 결과에 NaN이 흐른다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    fromNormalInto(out, { a: { x: 0, y: 0 }, b: { x: NaN, y: 0 } }, 0.5, 1);
    expect(Number.isNaN(out.a.x)).toBe(true);
  });

  // out 반환
  test('out을 반환한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const result = fromNormalInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 0.5, 1);
    expect(result).toBe(out);
  });
});

// ─── fromNormal companion ─────────────────────────────────────────────────────

describe('segment companion - fromNormal', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromNormal({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 0.5, 3);
    expect(result.a).toEqual({ x: 2, y: 0 });
    expect(result.b).toEqual({ x: 2, y: 3 });
  });

  test('fromNormalInto와 동일한 결과를 반환한다', () => {
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    fromNormalInto(out, seg, 0.5, 3);
    const result = fromNormal(seg, 0.5, 3);
    expect(result.a.x).toBe(out.a.x);
    expect(result.a.y).toBe(out.a.y);
    expect(result.b.x).toBe(out.b.x);
    expect(result.b.y).toBe(out.b.y);
  });
});
