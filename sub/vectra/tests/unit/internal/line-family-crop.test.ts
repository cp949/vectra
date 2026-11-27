/** 선분, 반직선, 무한 직선을 원과 사각형으로 자르는 내부 계산과 실패 조건을 검증한다. */

import { describe, expect, test } from 'vitest';
import { cropLineFamilyByCircleInto, cropLineFamilyByRectInto } from '../../../src/internal/line-family-crop';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 출력용 선분을 원점으로 초기화한다. */
function flatSeg(): SegmentWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// circle crop core
// ─────────────────────────────────────────────────────────────────────────────

describe('line-family crop core - circle', () => {
  test('segment interval [0,1]을 chord [0.25,0.75]로 자른다', () => {
    // x축 segment (0,0)→(4,0), 중심 (2,0) 반지름 1 → chord t∈[0.25,0.75]
    const out = flatSeg();
    const ok = cropLineFamilyByCircleInto(out, 0, 0, 4, 0, 'finite', 2, 0, 1);
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 1, y1: 0, x2: 3, y2: 0 });
  });

  test('segment 전체가 disk 내부이면 segment 양끝을 그대로 기록한다', () => {
    const out = flatSeg();
    const ok = cropLineFamilyByCircleInto(out, 1, 0, 2, 0, 'finite', 2, 0, 10);
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 1, y1: 0, x2: 3, y2: 0 });
  });

  test('tangent(single contact)는 실패한다', () => {
    // x축 line y=0, 중심 (2,1) 반지름 1 → 접점 1개 (disc===0)
    const out = flatSeg();
    const ok = cropLineFamilyByCircleInto(out, 0, 0, 4, 0, 'inf', 2, 1, 1);
    expect(ok).toBe(false);
  });

  test('disk 바깥 segment는 실패한다', () => {
    const out = flatSeg();
    const ok = cropLineFamilyByCircleInto(out, 0, 0, 1, 0, 'finite', 10, 10, 1);
    expect(ok).toBe(false);
  });

  test('ray가 disk 내부에서 시작하면 origin부터 forward exit까지 기록한다', () => {
    // ray origin (2,0) dir (1,0), 중심 (2,0) 반지름 1 → t∈[-1,1], ray clip [0,1]
    const out = flatSeg();
    const ok = cropLineFamilyByCircleInto(out, 2, 0, 1, 0, 'ray', 2, 0, 1);
    expect(ok).toBe(true);
    expect(out.x1).toBe(2);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(0);
  });

  test('ray hit가 backward에만 있으면 실패한다', () => {
    // ray origin (5,0) dir (1,0), 중심 (2,0) 반지름 1 → chord t∈[-4,-2], ray clip 없음
    const out = flatSeg();
    const ok = cropLineFamilyByCircleInto(out, 5, 0, 1, 0, 'ray', 2, 0, 1);
    expect(ok).toBe(false);
  });

  test('radius가 0 이하이면 실패한다', () => {
    expect(cropLineFamilyByCircleInto(flatSeg(), 0, 0, 4, 0, 'finite', 2, 0, 0)).toBe(false);
    expect(cropLineFamilyByCircleInto(flatSeg(), 0, 0, 4, 0, 'finite', 2, 0, -1)).toBe(false);
  });

  test('radius가 Infinity/NaN이면 실패한다', () => {
    expect(cropLineFamilyByCircleInto(flatSeg(), 0, 0, 4, 0, 'finite', 2, 0, Number.POSITIVE_INFINITY)).toBe(false);
    expect(cropLineFamilyByCircleInto(flatSeg(), 0, 0, 4, 0, 'finite', 2, 0, Number.NaN)).toBe(false);
  });

  test('degenerate direction(zero-length)은 실패한다', () => {
    expect(cropLineFamilyByCircleInto(flatSeg(), 2, 0, 0, 0, 'finite', 2, 0, 5)).toBe(false);
  });

  test('non-finite 좌표는 실패한다(out 미수정)', () => {
    const out = flatSeg();
    expect(cropLineFamilyByCircleInto(out, Number.NaN, 0, 4, 0, 'finite', 2, 0, 1)).toBe(false);
    expect(out).toEqual(flatSeg());
    expect(cropLineFamilyByCircleInto(flatSeg(), Number.POSITIVE_INFINITY, 0, 4, 0, 'finite', 2, 0, 1)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rect crop core
// ─────────────────────────────────────────────────────────────────────────────

describe('line-family crop core - rect', () => {
  test('crossing segment를 box boundary로 자른다', () => {
    // segment (-1,1)→(5,1), rect x:0 y:0 w:4 h:4 → t∈[1/6, 5/6] → x∈[0,4]
    const out = flatSeg();
    const ok = cropLineFamilyByRectInto(out, -1, 1, 6, 0, 'finite', 0, 0, 4, 4);
    expect(ok).toBe(true);
    expect(out.x1).toBeCloseTo(0, 12);
    expect(out.y1).toBeCloseTo(1, 12);
    expect(out.x2).toBeCloseTo(4, 12);
    expect(out.y2).toBeCloseTo(1, 12);
  });

  test('box 내부 segment는 양끝을 그대로 기록한다', () => {
    const out = flatSeg();
    const ok = cropLineFamilyByRectInto(out, 1, 1, 2, 2, 'finite', 0, 0, 4, 4);
    expect(ok).toBe(true);
    expect(out).toEqual({ x1: 1, y1: 1, x2: 3, y2: 3 });
  });

  test('box 바깥 segment는 실패한다', () => {
    const out = flatSeg();
    const ok = cropLineFamilyByRectInto(out, 10, 10, 1, 0, 'finite', 0, 0, 4, 4);
    expect(ok).toBe(false);
  });

  test('empty rect(width/height <= 0)는 실패한다', () => {
    expect(cropLineFamilyByRectInto(flatSeg(), -1, 1, 6, 0, 'finite', 0, 0, 0, 4)).toBe(false);
    expect(cropLineFamilyByRectInto(flatSeg(), -1, 1, 6, 0, 'finite', 0, 0, 4, -1)).toBe(false);
  });

  test('degenerate direction은 실패한다', () => {
    expect(cropLineFamilyByRectInto(flatSeg(), 1, 1, 0, 0, 'finite', 0, 0, 4, 4)).toBe(false);
  });

  test('infinite-line은 box를 가로지르는 clipped chord를 반환한다', () => {
    // line origin (0,2) dir (1,0), rect x:1 y:0 w:2 h:4 → x∈[1,3]
    const out = flatSeg();
    const ok = cropLineFamilyByRectInto(out, 0, 2, 1, 0, 'inf', 1, 0, 2, 4);
    expect(ok).toBe(true);
    expect(out.x1).toBe(1);
    expect(out.y1).toBe(2);
    expect(out.x2).toBe(3);
    expect(out.y2).toBe(2);
  });

  test('non-finite 좌표는 실패한다', () => {
    expect(cropLineFamilyByRectInto(flatSeg(), Number.NaN, 1, 6, 0, 'finite', 0, 0, 4, 4)).toBe(false);
    expect(cropLineFamilyByRectInto(flatSeg(), Number.NEGATIVE_INFINITY, 1, 6, 0, 'finite', 0, 0, 4, 4)).toBe(false);
  });

  test('non-finite extent(width/height ±Infinity·NaN)는 실패하고 out을 수정하지 않는다', () => {
    // ray/inf kind는 own range hi가 +Infinity라 Infinity extent가 통과하면 non-finite endpoint를
    // 기록한다. 가드가 rw/rh finite를 거르는지 회귀로 고정한다.
    const out = flatSeg();
    expect(cropLineFamilyByRectInto(out, -1, 1, 1, 0, 'inf', 0, 0, Number.POSITIVE_INFINITY, 4)).toBe(false);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(0);
    expect(out.y2).toBe(0);
    expect(cropLineFamilyByRectInto(flatSeg(), 0, -1, 0, 1, 'ray', 0, 0, 4, Number.POSITIVE_INFINITY)).toBe(false);
    expect(cropLineFamilyByRectInto(flatSeg(), -1, 1, 1, 0, 'finite', 0, 0, Number.NaN, 4)).toBe(false);
  });

  test('finite extent라도 right/bottom edge가 overflow되면 실패하고 out을 수정하지 않는다', () => {
    const out = flatSeg();
    expect(cropLineFamilyByRectInto(out, 1e308, 1, 1, 0, 'ray', 1e308, 0, 1e308, 4)).toBe(false);
    expect(out.x1).toBe(0);
    expect(out.y1).toBe(0);
    expect(out.x2).toBe(0);
    expect(out.y2).toBe(0);
    expect(cropLineFamilyByRectInto(flatSeg(), 1, 1e308, 0, 1, 'inf', 0, 1e308, 4, 1e308)).toBe(false);
  });
});
