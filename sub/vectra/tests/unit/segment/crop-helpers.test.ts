import { describe, expect, test } from 'vitest';
import { cropByCircle } from '../../../src/segment/crop-by-circle';
import { cropByCircleInto } from '../../../src/segment/crop-by-circle-into';
import { cropByRect } from '../../../src/segment/crop-by-rect';
import { cropByRectInto } from '../../../src/segment/crop-by-rect-into';
import type { CircleLike, RectLike, SegmentLike, SegmentWritable, XYObjectWritable } from '../../../src/types';

function seg(): SegmentWritable<XYObjectWritable, XYObjectWritable> {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}

// ─────────────────────────────────────────────────────────────────────────────
// cropByCircle
// ─────────────────────────────────────────────────────────────────────────────

describe('segment cropByCircle', () => {
  const circle: CircleLike = { center: { x: 2, y: 0 }, radius: 1 };

  test('two-hit segment는 boundary 사이 segment를 반환한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('circle 바깥 segment는 false / undefined', () => {
    const out = seg();
    expect(cropByCircleInto(out, { a: { x: 10, y: 10 }, b: { x: 12, y: 10 } }, circle)).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(cropByCircle({ a: { x: 10, y: 10 }, b: { x: 12, y: 10 } }, circle)).toBeUndefined();
  });

  test('disk 내부 segment는 원본 좌표를 복사한다', () => {
    const out = seg();
    const ok = cropByCircleInto(
      out,
      { a: { x: 1.5, y: 0 }, b: { x: 2.5, y: 0 } },
      { center: { x: 2, y: 0 }, radius: 10 }
    );
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1.5, y: 0 });
    expect(out.b).toEqual({ x: 2.5, y: 0 });
  });

  test('tangent segment는 실패한다', () => {
    // segment y=1을 지나고 중심 (2,0) 반지름 1 → 접점 1개
    const out = seg();
    expect(cropByCircleInto(out, { a: { x: 0, y: 1 }, b: { x: 4, y: 1 } }, circle)).toBe(false);
  });

  test('zero-length segment는 disk 내부여도 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { a: { x: 2, y: 0 }, b: { x: 2, y: 0 } }, { center: { x: 2, y: 0 }, radius: 5 })).toBe(
      false
    );
  });

  test('radius가 finite positive가 아니면 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, { center: { x: 2, y: 0 }, radius: 0 })).toBe(
      false
    );
    expect(
      cropByCircleInto(
        out,
        { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
        { center: { x: 2, y: 0 }, radius: Number.POSITIVE_INFINITY }
      )
    ).toBe(false);
    expect(
      cropByCircleInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, { center: { x: 2, y: 0 }, radius: Number.NaN })
    ).toBe(false);
  });

  test('non-finite 좌표는 실패한다 (NaN/±Infinity)', () => {
    const out = seg();
    expect(cropByCircleInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 } }, circle)).toBe(false);
    expect(cropByCircleInto(out, { a: { x: Number.POSITIVE_INFINITY, y: 0 }, b: { x: 4, y: 0 } }, circle)).toBe(false);
    expect(cropByCircleInto(out, { a: { x: Number.NEGATIVE_INFINITY, y: 0 }, b: { x: 4, y: 0 } }, circle)).toBe(false);
  });

  test('tuple segment input과 object output을 함께 검증한다', () => {
    const out = seg();
    const tuple: SegmentLike = [
      [0, 0],
      [4, 0],
    ];
    const ok = cropByCircleInto(out, tuple, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('out과 input segment aliasing에서 source 좌표가 보존된다', () => {
    const shared: SegmentWritable<XYObjectWritable, XYObjectWritable> = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const ok = cropByCircleInto(shared, shared, circle);
    expect(ok).toBe(true);
    expect(shared.a).toEqual({ x: 1, y: 0 });
    expect(shared.b).toEqual({ x: 3, y: 0 });
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = cropByCircle({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, circle);
    expect(result).toEqual({ a: { x: 1, y: 0 }, b: { x: 3, y: 0 } });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cropByRect
// ─────────────────────────────────────────────────────────────────────────────

describe('segment cropByRect', () => {
  const rect: RectLike = { x: 0, y: 0, width: 4, height: 4 };

  test('crossing segment는 clipped segment를 반환한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { a: { x: -2, y: 2 }, b: { x: 6, y: 2 } }, rect);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('rect 바깥 segment는 false / undefined', () => {
    const out = seg();
    expect(cropByRectInto(out, { a: { x: 10, y: 10 }, b: { x: 12, y: 12 } }, rect)).toBe(false);
    expect(cropByRect({ a: { x: 10, y: 10 }, b: { x: 12, y: 12 } }, rect)).toBeUndefined();
  });

  test('rect 내부 segment는 원본 좌표를 복사한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { a: { x: 1, y: 1 }, b: { x: 3, y: 3 } }, rect);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 1 });
    expect(out.b).toEqual({ x: 3, y: 3 });
  });

  test('empty rect(width/height <= 0)는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { a: { x: -2, y: 2 }, b: { x: 6, y: 2 } }, { x: 0, y: 0, width: 0, height: 4 })).toBe(
      false
    );
    expect(cropByRectInto(out, { a: { x: -2, y: 2 }, b: { x: 6, y: 2 } }, { x: 0, y: 0, width: 4, height: -1 })).toBe(
      false
    );
  });

  test('zero-length segment는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { a: { x: 2, y: 2 }, b: { x: 2, y: 2 } }, rect)).toBe(false);
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { a: { x: Number.NaN, y: 2 }, b: { x: 6, y: 2 } }, rect)).toBe(false);
    expect(cropByRectInto(out, { a: { x: -2, y: Number.POSITIVE_INFINITY }, b: { x: 6, y: 2 } }, rect)).toBe(false);
    expect(cropByRectInto(out, { a: { x: Number.NEGATIVE_INFINITY, y: 2 }, b: { x: 6, y: 2 } }, rect)).toBe(false);
  });

  test('non-finite extent rect(width/height ±Infinity)는 실패한다', () => {
    const out = seg();
    expect(
      cropByRectInto(
        out,
        { a: { x: -2, y: 2 }, b: { x: 6, y: 2 } },
        {
          x: 0,
          y: 0,
          width: Number.POSITIVE_INFINITY,
          height: 4,
        }
      )
    ).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
  });

  test('finite rect라도 right/bottom edge가 overflow되면 실패한다', () => {
    const out = seg();
    expect(
      cropByRectInto(out, { a: { x: 1e308, y: 2 }, b: { x: 1e308, y: 3 } }, { x: 1e308, y: 0, width: 1e308, height: 4 })
    ).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
  });

  test('tuple segment input과 object output을 함께 검증한다', () => {
    const out = seg();
    const ok = cropByRectInto(
      out,
      [
        [-2, 2],
        [6, 2],
      ],
      [0, 0, 4, 4]
    );
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('out과 input segment aliasing에서 source 좌표가 보존된다', () => {
    const shared: SegmentWritable<XYObjectWritable, XYObjectWritable> = { a: { x: -2, y: 2 }, b: { x: 6, y: 2 } };
    const ok = cropByRectInto(shared, shared, rect);
    expect(ok).toBe(true);
    expect(shared.a).toEqual({ x: 0, y: 2 });
    expect(shared.b).toEqual({ x: 4, y: 2 });
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = cropByRect({ a: { x: -2, y: 2 }, b: { x: 6, y: 2 } }, rect);
    expect(result).toEqual({ a: { x: 0, y: 2 }, b: { x: 4, y: 2 } });
  });
});
