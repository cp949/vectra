import { describe, expect, test } from 'vitest';
import { cropByCircle } from '../../../src/ray/crop-by-circle';
import { cropByCircleInto } from '../../../src/ray/crop-by-circle-into';
import { cropByRect } from '../../../src/ray/crop-by-rect';
import { cropByRectInto } from '../../../src/ray/crop-by-rect-into';
import type { CircleLike, RayLike, RectLike, SegmentWritable, XYObjectWritable } from '../../../src/types';

function seg(): SegmentWritable<XYObjectWritable, XYObjectWritable> {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}

// ─────────────────────────────────────────────────────────────────────────────
// ray cropByCircle
// ─────────────────────────────────────────────────────────────────────────────

describe('ray cropByCircle', () => {
  const circle: CircleLike = { center: { x: 2, y: 0 }, radius: 1 };

  test('forward two-hit ray는 entry/exit segment를 반환한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('circle 바깥 forward ray는 false / undefined', () => {
    const out = seg();
    expect(cropByCircleInto(out, { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } }, circle)).toBe(false);
    expect(cropByCircle({ origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } }, circle)).toBeUndefined();
  });

  test('hit가 backward side에만 있으면 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { origin: { x: 5, y: 0 }, direction: { x: 1, y: 0 } }, circle)).toBe(false);
  });

  test('origin이 circle 내부이면 origin/exit segment를 반환한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { origin: { x: 2, y: 0 }, direction: { x: 1, y: 0 } }, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 2, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('zero-direction ray는 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { origin: { x: 2, y: 0 }, direction: { x: 0, y: 0 } }, circle)).toBe(false);
  });

  test('tuple ray input과 object segment output을 함께 검증한다', () => {
    const out = seg();
    const tuple: RayLike = [0, 0, 1, 0];
    const ok = cropByCircleInto(out, tuple, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { origin: { x: Number.NaN, y: 0 }, direction: { x: 1, y: 0 } }, circle)).toBe(false);
    expect(
      cropByCircleInto(out, { origin: { x: Number.POSITIVE_INFINITY, y: 0 }, direction: { x: 1, y: 0 } }, circle)
    ).toBe(false);
    expect(
      cropByCircleInto(out, { origin: { x: 0, y: 0 }, direction: { x: Number.NEGATIVE_INFINITY, y: 0 } }, circle)
    ).toBe(false);
  });

  test('out과 input이 좌표를 공유해도(aliasing) 안전하다', () => {
    // out.a를 ray origin/direction object로 재사용해 clear 전 snapshot 여부를 검증한다.
    const out: SegmentWritable<XYObjectWritable, XYObjectWritable> = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    const ray: RayLike = { origin: out.a, direction: { x: 1, y: 0 } };
    const ok = cropByCircleInto(out, ray, circle);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ray cropByRect
// ─────────────────────────────────────────────────────────────────────────────

describe('ray cropByRect', () => {
  const rect: RectLike = { x: 0, y: 0, width: 4, height: 4 };

  test('crossing ray는 clipped forward segment를 반환한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { origin: { x: -2, y: 2 }, direction: { x: 1, y: 0 } }, rect);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('rect 내부 origin은 origin/exit segment를 반환한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { origin: { x: 2, y: 2 }, direction: { x: 1, y: 0 } }, rect);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 2, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('rect 바깥 ray는 false / undefined', () => {
    const out = seg();
    expect(cropByRectInto(out, { origin: { x: 10, y: 10 }, direction: { x: 1, y: 0 } }, rect)).toBe(false);
    expect(cropByRect({ origin: { x: 10, y: 10 }, direction: { x: 1, y: 0 } }, rect)).toBeUndefined();
  });

  test('zero-direction ray는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { origin: { x: 2, y: 2 }, direction: { x: 0, y: 0 } }, rect)).toBe(false);
  });

  test('empty rect는 실패한다', () => {
    const out = seg();
    expect(
      cropByRectInto(out, { origin: { x: -2, y: 2 }, direction: { x: 1, y: 0 } }, { x: 0, y: 0, width: 0, height: 4 })
    ).toBe(false);
  });

  test('tuple ray input과 object segment output을 함께 검증한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, [-2, 2, 1, 0], [0, 0, 4, 4]);
    expect(ok).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 2 });
    expect(out.b).toEqual({ x: 4, y: 2 });
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = cropByRect({ origin: { x: -2, y: 2 }, direction: { x: 1, y: 0 } }, rect);
    expect(result).toEqual({ a: { x: 0, y: 2 }, b: { x: 4, y: 2 } });
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { origin: { x: Number.NaN, y: 2 }, direction: { x: 1, y: 0 } }, rect)).toBe(false);
    expect(
      cropByRectInto(out, { origin: { x: -2, y: 2 }, direction: { x: Number.POSITIVE_INFINITY, y: 0 } }, rect)
    ).toBe(false);
  });

  test('non-finite extent rect(width/height ±Infinity)는 실패한다', () => {
    // ray own range hi가 +Infinity라 Infinity extent가 통과하면 forward exit가 non-finite가 된다.
    const out = seg();
    expect(
      cropByRectInto(
        out,
        { origin: { x: -2, y: 2 }, direction: { x: 1, y: 0 } },
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
      cropByRectInto(
        out,
        { origin: { x: 2, y: -2 }, direction: { x: 0, y: 1 } },
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
      cropByRectInto(
        out,
        { origin: { x: 1e308, y: 2 }, direction: { x: 1, y: 0 } },
        { x: 1e308, y: 0, width: 1e308, height: 4 }
      )
    ).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
  });
});
