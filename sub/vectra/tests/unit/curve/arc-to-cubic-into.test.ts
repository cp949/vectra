/**
 * arcToCubicInto unit test.
 *
 * 검증 방법:
 * - 90° arc → 1개 cubic, 180° arc → 2개 cubic.
 * - 생성된 cubic의 시작/끝 점이 arc의 시작/끝 점과 일치한다.
 * - 생성된 cubic의 중간점(t=0.5) 근사 오차가 허용 범위 이하이다.
 * - zero-sweep arc는 빈 배열을 반환한다.
 * - degenerate arc는 빈 배열을 반환한다.
 * - 유효하지 않은 maxAngle은 기본 분할 각도를 사용한다.
 * - out 기존 내용이 삭제된다.
 */

import { describe, expect, it } from 'vitest';
import { arcPointAtTInto } from '../../../src/curve/arc-point-at-t-into';
import { arcToCubicInto } from '../../../src/curve/arc-to-cubic-into';
import type { CenterArcLike } from '../../../src/types';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

function cubicPointAt(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

const quarterCircle: CenterArcLike = {
  cx: 0,
  cy: 0,
  rx: 1,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI / 2,
  sweep: true,
};

const halfCircle: CenterArcLike = {
  cx: 0,
  cy: 0,
  rx: 1,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI,
  sweep: true,
};

describe('arcToCubicInto', () => {
  it('quarter arc (90°) → 1개 cubic을 반환한다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, quarterCircle);
    expect(out.length).toBe(1);
  });

  it('half arc (180°) → 2개 cubic을 반환한다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, halfCircle);
    expect(out.length).toBe(2);
  });

  it('생성된 cubic의 시작점이 arc 시작점과 일치한다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, quarterCircle);
    const arcStart = { x: 0, y: 0 };
    arcPointAtTInto(arcStart, quarterCircle, 0);
    expect(relErr(out[0].p0.x, arcStart.x)).toBeLessThan(1e-12);
    expect(Math.abs(out[0].p0.y - arcStart.y)).toBeLessThan(1e-12);
  });

  it('생성된 cubic의 끝점이 arc 끝점과 일치한다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, quarterCircle);
    const arcEnd = { x: 0, y: 0 };
    arcPointAtTInto(arcEnd, quarterCircle, 1);
    expect(Math.abs(out[0].p3.x - arcEnd.x)).toBeLessThan(1e-12);
    expect(relErr(out[0].p3.y, arcEnd.y)).toBeLessThan(1e-12);
  });

  it('연속된 cubic에서 각 segment의 끝점과 다음 시작점이 일치한다 (반원)', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, halfCircle);
    expect(out.length).toBe(2);
    expect(Math.abs(out[0].p3.x - out[1].p0.x)).toBeLessThan(1e-12);
    expect(Math.abs(out[0].p3.y - out[1].p0.y)).toBeLessThan(1e-12);
  });

  it('quarter arc cubic의 중간점(t=0.5) 근사 오차가 1e-3 이하이다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, quarterCircle);
    const seg = out[0];
    const approx = cubicPointAt(seg.p0, seg.p1, seg.p2, seg.p3, 0.5);
    const arcMid = { x: 0, y: 0 };
    arcPointAtTInto(arcMid, quarterCircle, 0.5);
    const err = Math.hypot(approx.x - arcMid.x, approx.y - arcMid.y);
    expect(err).toBeLessThan(1e-3);
  });

  it('zero-sweep arc는 빈 배열을 반환한다', () => {
    const zeroSweep: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 1,
      ry: 1,
      xRotation: 0,
      startAngle: Math.PI / 4,
      endAngle: Math.PI / 4,
      sweep: true,
    };
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, zeroSweep);
    expect(out.length).toBe(0);
  });

  it('degenerate (rx=0) arc는 빈 배열을 반환한다', () => {
    const degenerate: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, degenerate);
    expect(out.length).toBe(0);
  });

  it('out 기존 내용이 삭제된다', () => {
    const sentinel = { p0: { x: 99, y: 99 }, p1: { x: 99, y: 99 }, p2: { x: 99, y: 99 }, p3: { x: 99, y: 99 } };
    const out = [sentinel];
    arcToCubicInto(out, quarterCircle);
    expect(out.length).toBe(1);
    expect(out[0]).not.toBe(sentinel);
  });

  it('out을 반환한다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    const ret = arcToCubicInto(out, quarterCircle);
    expect(ret).toBe(out);
  });

  it('유효하지 않은 maxAngle은 기본 분할 각도를 사용한다', () => {
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, halfCircle, { maxAngle: 0 });
    expect(out.length).toBe(2);

    arcToCubicInto(out, halfCircle, { maxAngle: Number.POSITIVE_INFINITY });
    expect(out.length).toBe(2);
  });

  it('ellipse arc도 처리한다 (rx != ry)', () => {
    const ellipseArc: CenterArcLike = {
      cx: 0,
      cy: 0,
      rx: 2,
      ry: 1,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI / 2,
      sweep: true,
    };
    const out: ReturnType<typeof arcToCubicInto> = [];
    arcToCubicInto(out, ellipseArc);
    expect(out.length).toBe(1);
    // 시작점: (2, 0), 끝점: (0, 1)
    expect(relErr(out[0].p0.x, 2)).toBeLessThan(1e-12);
    expect(Math.abs(out[0].p0.y)).toBeLessThan(1e-12);
    expect(Math.abs(out[0].p3.x)).toBeLessThan(1e-12);
    expect(relErr(out[0].p3.y, 1)).toBeLessThan(1e-12);
  });
});
