/**
 * segment의 length-based point query와 supporting line 투영 point query를 검증하는 테스트.
 *
 * - `pointAtLengthInto` / `pointAtLength`: clamp 기본값, `clamp: false` extrapolation,
 *   zero-length segment, non-finite distance, aliasing 안전성을 다룬다.
 * - `nearestPointOnSupportingLineInto` / `nearestPointOnSupportingLine`: unclamped supporting
 *   line projection, zero-length segment, non-finite, aliasing 안전성을 다룬다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import { nearestPointOnSupportingLine } from '../../../src/segment/nearest-point-on-supporting-line';
import { nearestPointOnSupportingLineInto } from '../../../src/segment/nearest-point-on-supporting-line-into';
import { pointAtLength } from '../../../src/segment/point-at-length';
import { pointAtLengthInto } from '../../../src/segment/point-at-length-into';
import type { XYWritable } from '../../../src/types';

// ─── pointAtLengthInto ──────────────────────────────────────────────────────

describe('pointAtLengthInto — clamp 기본값 (clamp: true)', () => {
  test('distance < 0이면 시작점을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = pointAtLengthInto(out, seg, -1);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('distance === 0이면 시작점을 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const seg = { a: { x: 1, y: 2 }, b: { x: 5, y: 2 } };
    pointAtLengthInto(out, seg, 0);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('distance가 중간값이면 선형 보간 결과를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, 2);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('distance === length이면 끝점을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, 4);
    expect(out).toEqual({ x: 4, y: 0 });
  });

  test('distance > length이면 끝점을 기록한다 (clamp)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, 10);
    expect(out).toEqual({ x: 4, y: 0 });
  });

  test('diagonal segment 중간 위치를 계산한다', () => {
    // (0,0)→(3,4) length=5, distance=2.5 → t=0.5 → (1.5, 2)
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    pointAtLengthInto(out, seg, 2.5);
    expect(out).toEqual({ x: 1.5, y: 2 });
  });
});

describe('pointAtLengthInto — clamp: false (extrapolation)', () => {
  test('distance < 0이면 시작점 바깥으로 extrapolation한다', () => {
    // (0,0)→(4,0) length=4, distance=-1 → t=-0.25 → (-1, 0)
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, -1, { clamp: false });
    expect(out).toEqual({ x: -1, y: 0 });
  });

  test('distance > length이면 끝점 바깥으로 extrapolation한다', () => {
    // (0,0)→(4,0) length=4, distance=5 → t=1.25 → (5, 0)
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, 5, { clamp: false });
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('distance가 유효 범위 안이면 clamp와 동일한 결과를 기록한다', () => {
    const out1: XYWritable = { x: 0, y: 0 };
    const out2: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out1, seg, 2);
    pointAtLengthInto(out2, seg, 2, { clamp: false });
    expect(out1).toEqual(out2);
  });
});

describe('pointAtLengthInto — zero-length segment', () => {
  test('zero-length segment는 distance와 무관하게 시작점을 기록한다', () => {
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };

    const out1: XYWritable = { x: 0, y: 0 };
    pointAtLengthInto(out1, seg, 100);
    expect(out1).toEqual({ x: 3, y: 4 });

    const out2: XYWritable = { x: 0, y: 0 };
    pointAtLengthInto(out2, seg, -100, { clamp: false });
    expect(out2).toEqual({ x: 3, y: 4 });
  });
});

describe('pointAtLengthInto — non-finite distance', () => {
  test('distance가 NaN이면 out에 NaN 좌표가 기록된다 (clamp 비교 모두 false)', () => {
    // NaN <= 0은 false, NaN >= length는 false → t = NaN/length = NaN → ax + NaN * dx = NaN
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, Number.NaN);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('distance가 Infinity이면 clamp 기본값에서 끝점을 기록한다 (Infinity >= length)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, Infinity);
    expect(out).toEqual({ x: 4, y: 0 });
  });

  test('distance가 -Infinity이면 clamp 기본값에서 시작점을 기록한다 (-Infinity <= 0)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, -Infinity);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('clamp: false에서 distance가 Infinity이면 out에 Infinity 좌표가 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, Infinity, { clamp: false });
    expect(out.x).toBe(Infinity);
  });

  test('clamp: false에서 distance가 -Infinity이면 out에 -Infinity 좌표가 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, -Infinity, { clamp: false });
    expect(out.x).toBe(-Infinity);
  });

  test('clamp: false에서 distance가 NaN이면 out에 NaN 좌표가 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, Number.NaN, { clamp: false });
    expect(Number.isNaN(out.x)).toBe(true);
  });
});

describe('pointAtLengthInto — aliasing 안전성', () => {
  test('out === line.a aliasing에서 올바른 결과를 기록한다', () => {
    // out이 segment 시작점 object와 같을 때 write 전 ax/ay를 읽어두므로 안전하다
    const a = { x: 0, y: 0 };
    const seg = { a, b: { x: 4, y: 0 } };
    pointAtLengthInto(a, seg, 2);
    expect(a).toEqual({ x: 2, y: 0 });
  });

  test('out === line.b aliasing에서 올바른 결과를 기록한다', () => {
    const b = { x: 4, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b };
    pointAtLengthInto(b, seg, 2);
    expect(b).toEqual({ x: 2, y: 0 });
  });
});

describe('pointAtLengthInto — 입력 형식', () => {
  test('tuple endpoint를 가진 segment에서 거리 기반 point를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    pointAtLengthInto(out, seg, 2);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = pointAtLengthInto(out, seg, 2);
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(0);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

// ─── pointAtLength (companion) ──────────────────────────────────────────────

describe('pointAtLength — companion', () => {
  test('새 { x, y } object를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = pointAtLength(seg, 2);
    expect(result).toEqual({ x: 2, y: 0 });
  });

  test('pointAtLengthInto와 동일한 결과를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    pointAtLengthInto(out, seg, 3);
    const result = pointAtLength(seg, 3);
    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });

  test('clamp: false가 companion에서도 동작한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = pointAtLength(seg, 5, { clamp: false });
    expect(result).toEqual({ x: 5, y: 0 });
  });

  test('distance < 0에서 clamp 기본값으로 시작점을 반환한다', () => {
    const seg = { a: { x: 1, y: 2 }, b: { x: 5, y: 2 } };
    const result = pointAtLength(seg, -1);
    expect(result).toEqual({ x: 1, y: 2 });
  });
});

// ─── nearestPointOnSupportingLineInto ───────────────────────────────────────

describe('nearestPointOnSupportingLineInto — interior projection', () => {
  test('수선의 발을 out에 기록하고 out을 반환한다', () => {
    // (0,0)→(4,0), point=(2,3): projection=(2,0)
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = nearestPointOnSupportingLineInto(out, seg, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('diagonal segment에서 unclamped projection을 계산한다', () => {
    // (0,0)→(3,4) length²=25, point=(3,0): t=9/25 → (1.08, 1.44)
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    nearestPointOnSupportingLineInto(out, seg, { x: 3, y: 0 });
    expect(out.x).toBeCloseTo(1.08, 10);
    expect(out.y).toBeCloseTo(1.44, 10);
  });
});

describe('nearestPointOnSupportingLineInto — endpoint 바깥 projection (unclamped)', () => {
  test('before-start point: supporting line 위 시작점 이전 점을 기록한다', () => {
    // (0,0)→(4,0), point=(-2,0): projection=(-2,0) — closestPoint는 (0,0)이지만 이 함수는 unclamped
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: -2, y: 0 });
    expect(out).toEqual({ x: -2, y: 0 });
  });

  test('after-end point: supporting line 위 끝점 이후 점을 기록한다', () => {
    // (0,0)→(4,0), point=(6,0): projection=(6,0) — closestPoint는 (4,0)이지만 이 함수는 unclamped
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: 6, y: 0 });
    expect(out).toEqual({ x: 6, y: 0 });
  });
});

describe('nearestPointOnSupportingLineInto — zero-length segment', () => {
  test('zero-length segment는 시작점을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    nearestPointOnSupportingLineInto(out, seg, { x: 100, y: 200 });
    expect(out).toEqual({ x: 3, y: 4 });
  });
});

describe('nearestPointOnSupportingLineInto — non-finite 입력', () => {
  test('point.x가 NaN이면 out에 NaN이 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: Number.NaN, y: 0 });
    expect(Number.isNaN(out.x)).toBe(true);
  });

  test('point.y가 NaN이면 out에 NaN이 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 0, y: 4 } };
    nearestPointOnSupportingLineInto(out, seg, { x: 0, y: Number.NaN });
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('point.x가 Infinity이면 out에 Infinity가 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: Infinity, y: 0 });
    expect(out.x).toBe(Infinity);
  });

  test('point.x가 -Infinity이면 out에 -Infinity가 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: -Infinity, y: 0 });
    expect(out.x).toBe(-Infinity);
  });

  test('segment endpoint가 NaN이면 out에 NaN이 기록된다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: 2, y: 0 });
    expect(Number.isNaN(out.x)).toBe(true);
  });
});

describe('nearestPointOnSupportingLineInto — aliasing 안전성', () => {
  test('out === point aliasing에서 올바른 결과를 기록한다', () => {
    // out과 point가 같은 object일 때 write 전 px/py를 읽어두므로 안전하다
    const pt = { x: 2, y: 3 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(pt, seg, pt);
    expect(pt).toEqual({ x: 2, y: 0 });
  });

  test('out === line.a aliasing에서 올바른 결과를 기록한다', () => {
    const a = { x: 0, y: 0 };
    const seg = { a, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(a, seg, { x: 2, y: 3 });
    expect(a).toEqual({ x: 2, y: 0 });
  });

  test('out === line.b aliasing에서 올바른 결과를 기록한다', () => {
    const b = { x: 4, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b };
    nearestPointOnSupportingLineInto(b, seg, { x: 2, y: 3 });
    expect(b).toEqual({ x: 2, y: 0 });
  });
});

describe('nearestPointOnSupportingLineInto — 입력 형식', () => {
  test('tuple endpoint를 가진 segment에서 projection을 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    nearestPointOnSupportingLineInto(out, seg, [2, 3]);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('mutable tuple out에 projection 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = nearestPointOnSupportingLineInto(out, seg, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(0);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

// ─── nearestPointOnSupportingLine (companion) ────────────────────────────────

describe('nearestPointOnSupportingLine — companion', () => {
  test('새 { x, y } object를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = nearestPointOnSupportingLine(seg, { x: 2, y: 3 });
    expect(result).toEqual({ x: 2, y: 0 });
  });

  test('nearestPointOnSupportingLineInto와 동일한 결과를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    nearestPointOnSupportingLineInto(out, seg, { x: 5, y: 3 });
    const result = nearestPointOnSupportingLine(seg, { x: 5, y: 3 });
    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });

  test('before-start point에서 unclamped projection을 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = nearestPointOnSupportingLine(seg, { x: -2, y: 0 });
    expect(result).toEqual({ x: -2, y: 0 });
  });

  test('zero-length segment에서 시작점을 반환한다', () => {
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const result = nearestPointOnSupportingLine(seg, { x: 10, y: 10 });
    expect(result).toEqual({ x: 3, y: 4 });
  });
});
