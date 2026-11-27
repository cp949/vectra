/** 원과 사각형으로 광선을 자를 때의 구간과 실패 정책을 검증한다. */
import { describe, expect, test } from 'vitest';
import { cropByCircle } from '../../../src/ray/crop-by-circle';
import { cropByCircleInto } from '../../../src/ray/crop-by-circle-into';
import { cropByRect } from '../../../src/ray/crop-by-rect';
import { cropByRectInto } from '../../../src/ray/crop-by-rect-into';
import type { Circle, Rect, SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 잘라낸 선분을 기록할 출력 객체를 만든다. */
function seg(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// ray cropByCircle
// ─────────────────────────────────────────────────────────────────────────────

describe('ray cropByCircle', () => {
  const circle: Circle = { cx: 2, cy: 0, r: 1 };

  test('forward two-hit ray는 entry/exit segment를 반환한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { ox: 0, oy: 0, dx: 1, dy: 0 }, circle);
    expect(ok).toBe(true);
    expect(out.x1).toBe(1);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(0);
  });

  test('circle 바깥 forward ray는 false / undefined', () => {
    const out = seg();
    expect(cropByCircleInto(out, { ox: 0, oy: 5, dx: 1, dy: 0 }, circle)).toBe(false);
    expect(cropByCircle({ ox: 0, oy: 5, dx: 1, dy: 0 }, circle)).toBeUndefined();
  });

  test('hit가 backward side에만 있으면 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { ox: 5, oy: 0, dx: 1, dy: 0 }, circle)).toBe(false);
  });

  test('origin이 circle 내부이면 origin/exit segment를 반환한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { ox: 2, oy: 0, dx: 1, dy: 0 }, circle);
    expect(ok).toBe(true);
    expect(out.x1).toBe(2);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(0);
  });

  test('zero-direction ray는 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { ox: 2, oy: 0, dx: 0, dy: 0 }, circle)).toBe(false);
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { ox: Number.NaN, oy: 0, dx: 1, dy: 0 }, circle)).toBe(false);
    expect(cropByCircleInto(out, { ox: Number.POSITIVE_INFINITY, oy: 0, dx: 1, dy: 0 }, circle)).toBe(false);
    expect(cropByCircleInto(out, { ox: 0, oy: 0, dx: Number.NEGATIVE_INFINITY, dy: 0 }, circle)).toBe(false);
  });

  test('입력과 출력이 같은 객체여도 잘라낸 선분을 기록한다', () => {
    const out = { ...seg(), ox: 0, oy: 0, dx: 1, dy: 0 };
    const ok = cropByCircleInto(out, out, circle);
    expect(ok).toBe(true);
    expect(out.x1).toBe(1);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ray cropByRect
// ─────────────────────────────────────────────────────────────────────────────

describe('ray cropByRect', () => {
  const rect: Rect = { x: 0, y: 0, width: 4, height: 4 };

  test('crossing ray는 clipped forward segment를 반환한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { ox: -2, oy: 2, dx: 1, dy: 0 }, rect);
    expect(ok).toBe(true);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(2);
    expect(out.x2).toBe(4);
    expect(out.y2).toBe(2);
  });

  test('rect 내부 origin은 origin/exit segment를 반환한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { ox: 2, oy: 2, dx: 1, dy: 0 }, rect);
    expect(ok).toBe(true);
    expect(out.x1).toBe(2);
    expect(out.y1).toBe(2);
    expect(out.x2).toBe(4);
    expect(out.y2).toBe(2);
  });

  test('rect 바깥 ray는 false / undefined', () => {
    const out = seg();
    expect(cropByRectInto(out, { ox: 10, oy: 10, dx: 1, dy: 0 }, rect)).toBe(false);
    expect(cropByRect({ ox: 10, oy: 10, dx: 1, dy: 0 }, rect)).toBeUndefined();
  });

  test('zero-direction ray는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { ox: 2, oy: 2, dx: 0, dy: 0 }, rect)).toBe(false);
  });

  test('empty rect는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { ox: -2, oy: 2, dx: 1, dy: 0 }, { x: 0, y: 0, width: 0, height: 4 })).toBe(false);
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = cropByRect({ ox: -2, oy: 2, dx: 1, dy: 0 }, rect);
    expect(result).toEqual({ x1: 0, y1: 2, x2: 4, y2: 2 });
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { ox: Number.NaN, oy: 2, dx: 1, dy: 0 }, rect)).toBe(false);
    expect(cropByRectInto(out, { ox: -2, oy: 2, dx: Number.POSITIVE_INFINITY, dy: 0 }, rect)).toBe(false);
  });

  test('non-finite extent rect(width/height ±Infinity)는 실패한다', () => {
    // ray own range hi가 +Infinity라 Infinity extent가 통과하면 forward exit가 non-finite가 된다.
    const out = seg();
    expect(
      cropByRectInto(
        out,
        { ox: -2, oy: 2, dx: 1, dy: 0 },
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
      cropByRectInto(
        out,
        { ox: 2, oy: -2, dx: 0, dy: 1 },
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
    expect(cropByRectInto(out, { ox: 1e308, oy: 2, dx: 1, dy: 0 }, { x: 1e308, y: 0, width: 1e308, height: 4 })).toBe(
      false
    );
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
  });
});
