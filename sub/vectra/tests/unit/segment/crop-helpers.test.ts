/** 원과 사각형으로 선분을 잘랐을 때의 끝점, 실패 조건, 입력과 출력이 같은 경우를 검증한다. */
import { describe, expect, test } from 'vitest';
import { cropByCircle } from '../../../src/segment/crop-by-circle';
import { cropByCircleInto } from '../../../src/segment/crop-by-circle-into';
import { cropByRect } from '../../../src/segment/crop-by-rect';
import { cropByRectInto } from '../../../src/segment/crop-by-rect-into';
import type { Circle, Rect, SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 두 끝점이 원점인 출력 선분을 만든다. */
function seg(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// cropByCircle
// ─────────────────────────────────────────────────────────────────────────────

describe('segment cropByCircle', () => {
  const circle: Circle = { cx: 2, cy: 0, r: 1 };

  test('two-hit segment는 boundary 사이 segment를 반환한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, circle);
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 1, y1: 0, x2: 3, y2: 0 });
  });

  test('circle 바깥 segment는 false / undefined', () => {
    const out = seg();
    expect(cropByCircleInto(out, { x1: 10, y1: 10, x2: 12, y2: 10 }, circle)).toBe(false);
    expect(out).toEqual({ x1: 0, y1: 0, x2: 0, y2: 0 });
    expect(cropByCircle({ x1: 10, y1: 10, x2: 12, y2: 10 }, circle)).toBeUndefined();
  });

  test('disk 내부 segment는 원본 좌표를 복사한다', () => {
    const out = seg();
    const ok = cropByCircleInto(out, { x1: 1.5, y1: 0, x2: 2.5, y2: 0 }, { cx: 2, cy: 0, r: 10 });
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 1.5, y1: 0, x2: 2.5, y2: 0 });
  });

  test('tangent segment는 실패한다', () => {
    // segment y=1을 지나고 중심 (2,0) 반지름 1 → 접점 1개
    const out = seg();
    expect(cropByCircleInto(out, { x1: 0, y1: 1, x2: 4, y2: 1 }, circle)).toBe(false);
  });

  test('zero-length segment는 disk 내부여도 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { x1: 2, y1: 0, x2: 2, y2: 0 }, { cx: 2, cy: 0, r: 5 })).toBe(false);
  });

  test('radius가 finite positive가 아니면 실패한다', () => {
    const out = seg();
    expect(cropByCircleInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, { cx: 2, cy: 0, r: 0 })).toBe(false);
    expect(cropByCircleInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, { cx: 2, cy: 0, r: Number.POSITIVE_INFINITY })).toBe(
      false
    );
    expect(cropByCircleInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, { cx: 2, cy: 0, r: Number.NaN })).toBe(false);
  });

  test('non-finite 좌표는 실패한다 (NaN/±Infinity)', () => {
    const out = seg();
    expect(cropByCircleInto(out, { x1: Number.NaN, y1: 0, x2: 4, y2: 0 }, circle)).toBe(false);
    expect(cropByCircleInto(out, { x1: Number.POSITIVE_INFINITY, y1: 0, x2: 4, y2: 0 }, circle)).toBe(false);
    expect(cropByCircleInto(out, { x1: Number.NEGATIVE_INFINITY, y1: 0, x2: 4, y2: 0 }, circle)).toBe(false);
  });

  test('out과 input segment aliasing에서 source 좌표가 보존된다', () => {
    const shared: SegmentWritable = { x1: 0, y1: 0, x2: 4, y2: 0 };
    const ok = cropByCircleInto(shared, shared, circle);
    expect(ok).toBe(true);
    expect(shared).toEqual({ x1: 1, y1: 0, x2: 3, y2: 0 });
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = cropByCircle({ x1: 0, y1: 0, x2: 4, y2: 0 }, circle);
    expect(result).toEqual({ x1: 1, y1: 0, x2: 3, y2: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cropByRect
// ─────────────────────────────────────────────────────────────────────────────

describe('segment cropByRect', () => {
  const rect: Rect = { x: 0, y: 0, width: 4, height: 4 };

  test('crossing segment는 clipped segment를 반환한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { x1: -2, y1: 2, x2: 6, y2: 2 }, rect);
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 0, y1: 2, x2: 4, y2: 2 });
  });

  test('rect 바깥 segment는 false / undefined', () => {
    const out = seg();
    expect(cropByRectInto(out, { x1: 10, y1: 10, x2: 12, y2: 12 }, rect)).toBe(false);
    expect(cropByRect({ x1: 10, y1: 10, x2: 12, y2: 12 }, rect)).toBeUndefined();
  });

  test('rect 내부 segment는 원본 좌표를 복사한다', () => {
    const out = seg();
    const ok = cropByRectInto(out, { x1: 1, y1: 1, x2: 3, y2: 3 }, rect);
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 1, y1: 1, x2: 3, y2: 3 });
  });

  test('empty rect(width/height <= 0)는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { x1: -2, y1: 2, x2: 6, y2: 2 }, { x: 0, y: 0, width: 0, height: 4 })).toBe(false);
    expect(cropByRectInto(out, { x1: -2, y1: 2, x2: 6, y2: 2 }, { x: 0, y: 0, width: 4, height: -1 })).toBe(false);
  });

  test('zero-length segment는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { x1: 2, y1: 2, x2: 2, y2: 2 }, rect)).toBe(false);
  });

  test('non-finite 좌표(NaN/±Infinity)는 실패한다', () => {
    const out = seg();
    expect(cropByRectInto(out, { x1: Number.NaN, y1: 2, x2: 6, y2: 2 }, rect)).toBe(false);
    expect(cropByRectInto(out, { x1: -2, y1: Number.POSITIVE_INFINITY, x2: 6, y2: 2 }, rect)).toBe(false);
    expect(cropByRectInto(out, { x1: Number.NEGATIVE_INFINITY, y1: 2, x2: 6, y2: 2 }, rect)).toBe(false);
  });

  test('non-finite extent rect(width/height ±Infinity)는 실패한다', () => {
    const out = seg();
    expect(
      cropByRectInto(
        out,
        { x1: -2, y1: 2, x2: 6, y2: 2 },
        {
          x: 0,
          y: 0,
          width: Number.POSITIVE_INFINITY,
          height: 4,
        }
      )
    ).toBe(false);
    expect(out).toEqual({ x1: 0, y1: 0, x2: 0, y2: 0 });
  });

  test('finite rect라도 right/bottom edge가 overflow되면 실패한다', () => {
    const out = seg();
    expect(
      cropByRectInto(out, { x1: 1e308, y1: 2, x2: 1e308, y2: 3 }, { x: 1e308, y: 0, width: 1e308, height: 4 })
    ).toBe(false);
    expect(out).toEqual({ x1: 0, y1: 0, x2: 0, y2: 0 });
  });

  test('out과 input segment aliasing에서 source 좌표가 보존된다', () => {
    const shared: SegmentWritable = { x1: -2, y1: 2, x2: 6, y2: 2 };
    const ok = cropByRectInto(shared, shared, rect);
    expect(ok).toBe(true);
    expect(shared).toEqual({ x1: 0, y1: 2, x2: 4, y2: 2 });
  });

  test('companion은 새 segment object를 반환한다', () => {
    const result = cropByRect({ x1: -2, y1: 2, x2: 6, y2: 2 }, rect);
    expect(result).toEqual({ x1: 0, y1: 2, x2: 4, y2: 2 });
  });
});
