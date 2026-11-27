/** 무한 직선을 원과 사각형으로 자르는 성공 조건과 실패 경계를 검증한다. */
import { describe, expect, test } from 'vitest';
import { segmentInsideCircle } from '../../../src/infinite-line/segment-inside-circle';
import { segmentInsideCircleInto } from '../../../src/infinite-line/segment-inside-circle-into';
import { segmentInsideRect } from '../../../src/infinite-line/segment-inside-rect';
import { segmentInsideRectInto } from '../../../src/infinite-line/segment-inside-rect-into';
import type { Circle, Rect, SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 자르기 결과를 기록할 선분을 초기화한다. */
function seg(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// infinite-line segmentInsideCircle
// ─────────────────────────────────────────────────────────────────────────────

describe('infinite-line segmentInsideCircle', () => {
  const circle: Circle = { cx: 2, cy: 0, r: 1 };

  test('two-hit line은 chord segment를 반환한다', () => {
    const out = seg();
    const ok = segmentInsideCircleInto(out, { ox: 0, oy: 0, dx: 1, dy: 0 }, circle);
    expect(ok).toBe(true);
    expect(out.x1).toBe(1);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(0);
  });

  test('tangent line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { ox: 0, oy: 1, dx: 1, dy: 0 }, circle)).toBe(false);
    expect(segmentInsideCircle({ ox: 0, oy: 1, dx: 1, dy: 0 }, circle)).toBeUndefined();
  });

  test('disk와 만나지 않는 line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { ox: 0, oy: 10, dx: 1, dy: 0 }, circle)).toBe(false);
  });

  test('zero-direction infinite-line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { ox: 2, oy: 0, dx: 0, dy: 0 }, circle)).toBe(false);
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(segmentInsideCircleInto(out, { ox: 0, oy: Number.NaN, dx: 1, dy: 0 }, circle)).toBe(false);
    expect(segmentInsideCircleInto(out, { ox: 0, oy: Number.POSITIVE_INFINITY, dx: 1, dy: 0 }, circle)).toBe(false);
    expect(segmentInsideCircleInto(out, { ox: 0, oy: 0, dx: 1, dy: Number.NEGATIVE_INFINITY }, circle)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// infinite-line segmentInsideRect
// ─────────────────────────────────────────────────────────────────────────────

describe('infinite-line segmentInsideRect', () => {
  const rect: Rect = { x: 0, y: 0, width: 4, height: 4 };

  test('crossing line은 clipped segment를 반환한다', () => {
    const out = seg();
    const ok = segmentInsideRectInto(out, { ox: -1, oy: 2, dx: 1, dy: 0 }, rect);
    expect(ok).toBe(true);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(2);
    expect(out.x2).toBe(4);
    expect(out.y2).toBe(2);
  });

  test('rect 바깥 line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { ox: 0, oy: 10, dx: 1, dy: 0 }, rect)).toBe(false);
    expect(segmentInsideRect({ ox: 0, oy: 10, dx: 1, dy: 0 }, rect)).toBeUndefined();
  });

  test('empty rect는 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { ox: -1, oy: 2, dx: 1, dy: 0 }, { x: 0, y: 0, width: 4, height: 0 })).toBe(
      false
    );
  });

  test('zero-direction infinite-line은 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { ox: 2, oy: 2, dx: 0, dy: 0 }, rect)).toBe(false);
  });

  test('diagonal line을 box로 자른다', () => {
    const out = seg();
    // origin (-1,-1) dir (1,1) → x=y line, box [0,4]² → t∈[1,5] → seg(0,0)-(4,4)
    const ok = segmentInsideRectInto(out, { ox: -1, oy: -1, dx: 1, dy: 1 }, rect);
    expect(ok).toBe(true);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(4);
    expect(out.y2).toBe(4);
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = segmentInsideRect({ ox: -1, oy: 2, dx: 1, dy: 0 }, rect);
    expect(result).toEqual({ x1: 0, y1: 2, x2: 4, y2: 2 });
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(segmentInsideRectInto(out, { ox: Number.NaN, oy: 2, dx: 1, dy: 0 }, rect)).toBe(false);
    expect(segmentInsideRectInto(out, { ox: -1, oy: 2, dx: Number.POSITIVE_INFINITY, dy: 0 }, rect)).toBe(false);
  });

  test('non-finite extent rect(width/height ±Infinity)는 실패한다', () => {
    // inf-line own range가 (-∞,∞)라 Infinity extent가 통과하면 endpoint가 non-finite가 된다.
    const out = seg();
    expect(
      segmentInsideRectInto(
        out,
        { ox: -1, oy: 2, dx: 1, dy: 0 },
        {
          x: 0,
          y: 0,
          width: Number.POSITIVE_INFINITY,
          height: 4,
        }
      )
    ).toBe(false);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
    expect(
      segmentInsideRectInto(
        out,
        { ox: 2, oy: -1, dx: 0, dy: 1 },
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
      segmentInsideRectInto(out, { ox: 1e308, oy: 2, dx: 1, dy: 0 }, { x: 1e308, y: 0, width: 1e308, height: 4 })
    ).toBe(false);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
  });
});
