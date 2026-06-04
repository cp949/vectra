import { describe, expect, test } from 'vitest';
import { segmentInsideCircle } from '../../../src/infinite-line/segment-inside-circle';
import { segmentInsideCircleInto } from '../../../src/infinite-line/segment-inside-circle-into';
import { segmentInsideRect } from '../../../src/infinite-line/segment-inside-rect';
import { segmentInsideRectInto } from '../../../src/infinite-line/segment-inside-rect-into';
import type { CircleLike, InfiniteLineLike, RectLike, SegmentWritable, XYObjectWritable } from '../../../src/types';

function seg(): SegmentWritable<XYObjectWritable, XYObjectWritable> {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}

// ─────────────────────────────────────────────────────────────────────────────
// infinite-line segmentInsideCircle
// ─────────────────────────────────────────────────────────────────────────────

describe('infinite-line segmentInsideCircle', () => {
  const circle: CircleLike = { center: { x: 2, y: 0 }, radius: 1 };

  test('two-hit line은 chord segment를 반환한다', () => {
    const out = seg();
    const ok = segmentInsideCircleInto(out, { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('tangent line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { origin: { x: 0, y: 1 }, direction: { x: 1, y: 0 } }, circle)).toBe(false);
    expect(segmentInsideCircle({ origin: { x: 0, y: 1 }, direction: { x: 1, y: 0 } }, circle)).toBeUndefined();
  });

  test('disk와 만나지 않는 line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { origin: { x: 0, y: 10 }, direction: { x: 1, y: 0 } }, circle)).toBe(false);
  });

  test('zero-direction infinite-line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { origin: { x: 2, y: 0 }, direction: { x: 0, y: 0 } }, circle)).toBe(false);
  });

  test('tuple infinite-line input과 object segment output을 함께 검증한다', () => {
    const out = seg();
    const tuple: InfiniteLineLike = [
      [0, 0],
      [1, 0],
    ];
    const ok = segmentInsideCircleInto(out, tuple, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { origin: { x: 0, y: Number.NaN }, direction: { x: 1, y: 0 } }, circle)).toBe(
      false
    );
    expect(
      segmentInsideCircleInto(out, { origin: { x: 0, y: Number.POSITIVE_INFINITY }, direction: { x: 1, y: 0 } }, circle)
    ).toBe(false);
    expect(
      segmentInsideCircleInto(out, { origin: { x: 0, y: 0 }, direction: { x: 1, y: Number.NEGATIVE_INFINITY } }, circle)
    ).toBe(false);
  });

  test('out과 input이 좌표를 공유해도(aliasing) 안전하다', () => {
    const out: SegmentWritable<XYObjectWritable, XYObjectWritable> = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const line: InfiniteLineLike = { origin: out.a, direction: { x: 1, y: 0 } };
    const ok = segmentInsideCircleInto(out, line, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// infinite-line segmentInsideRect
// ─────────────────────────────────────────────────────────────────────────────

describe('infinite-line segmentInsideRect', () => {
  const rect: RectLike = { x: 0, y: 0, width: 4, height: 4 };

  test('crossing line은 clipped segment를 반환한다', () => {
    const out = seg();
    const ok = segmentInsideRectInto(out, { origin: { x: -1, y: 2 }, direction: { x: 1, y: 0 } }, rect);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('rect 바깥 line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { origin: { x: 0, y: 10 }, direction: { x: 1, y: 0 } }, rect)).toBe(false);
    expect(segmentInsideRect({ origin: { x: 0, y: 10 }, direction: { x: 1, y: 0 } }, rect)).toBeUndefined();
  });

  test('empty rect는 실패한다', () => {
    const out = seg();
    expect(
      segmentInsideRectInto(
        out,
        { origin: { x: -1, y: 2 }, direction: { x: 1, y: 0 } },
        { x: 0, y: 0, width: 4, height: 0 }
      )
    ).toBe(false);
  });

  test('zero-direction infinite-line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { origin: { x: 2, y: 2 }, direction: { x: 0, y: 0 } }, rect)).toBe(false);
  });

  test('diagonal line을 box로 자른다', () => {
    const out = seg();
    // origin (-1,-1) dir (1,1) → x=y line, box [0,4]² → t∈[1,5] → seg(0,0)-(4,4)
    const ok = segmentInsideRectInto(out, { origin: { x: -1, y: -1 }, direction: { x: 1, y: 1 } }, rect);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 4, y: 4 });
  });

  test('tuple infinite-line input과 object segment output을 함께 검증한다', () => {
    const out = seg();
    const ok = segmentInsideRectInto(
      out,
      [
        [-1, 2],
        [1, 0],
      ],
      [0, 0, 4, 4]
    );
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = segmentInsideRect({ origin: { x: -1, y: 2 }, direction: { x: 1, y: 0 } }, rect);
    expect(result).toEqual({ a: { x: 0, y: 2 }, b: { x: 4, y: 2 } });
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { origin: { x: Number.NaN, y: 2 }, direction: { x: 1, y: 0 } }, rect)).toBe(
      false
    );
    expect(
      segmentInsideRectInto(out, { origin: { x: -1, y: 2 }, direction: { x: Number.POSITIVE_INFINITY, y: 0 } }, rect)
    ).toBe(false);
  });

  test('non-finite extent rect(width/height ±Infinity)는 실패한다', () => {
    // inf-line own range가 (-∞,∞)라 Infinity extent가 통과하면 endpoint가 non-finite가 된다.
    const out = seg();
    expect(
      segmentInsideRectInto(
        out,
        { origin: { x: -1, y: 2 }, direction: { x: 1, y: 0 } },
        {
          x: 0,
          y: 0,
          width: Number.POSITIVE_INFINITY,
          height: 4,
        }
      )
    ).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(
      segmentInsideRectInto(
        out,
        { origin: { x: 2, y: -1 }, direction: { x: 0, y: 1 } },
        {
          x: 0,
          y: 0,
          width: 4,
          height: Number.POSITIVE_INFINITY,
        }
      )
    ).toBe(false);
  });

  test('finite rect라도 right/bottom edge가 overflow되면 실패한다', () => {
    const out = seg();
    expect(
      segmentInsideRectInto(
        out,
        { origin: { x: 1e308, y: 2 }, direction: { x: 1, y: 0 } },
        { x: 1e308, y: 0, width: 1e308, height: 4 }
      )
    ).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
  });
});
