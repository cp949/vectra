/**
 * arcMiddleInto / arcMiddle unit test.
 *
 * 검증 방법:
 * - arcPointAtTInto(t=0.5)와 동일한 결과를
 * - 단위 원 quarter arc에서 중점이 (√2/2, √2/2)이다.
 * - out을 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { arcMiddle } from '../../../src/curve/arc-middle';
import { arcMiddleInto } from '../../../src/curve/arc-middle-into';
import { arcPointAtTInto } from '../../../src/curve/arc-point-at-t-into';
import type { CenterArcLike } from '../../../src/types';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
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

describe('arcMiddleInto', () => {
  it('arcPointAtTInto(t=0.5)와 동일한 결과이다', () => {
    const ref = { x: 0, y: 0 };
    arcPointAtTInto(ref, quarterCircle, 0.5);
    const out = { x: 0, y: 0 };
    arcMiddleInto(out, quarterCircle);
    expect(Math.abs(out.x - ref.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - ref.y)).toBeLessThan(1e-12);
  });

  it('단위 원 quarter arc 중점이 (√2/2, √2/2)이다', () => {
    const out = { x: 0, y: 0 };
    arcMiddleInto(out, quarterCircle);
    expect(relErr(out.x, Math.SQRT1_2)).toBeLessThan(1e-12);
    expect(relErr(out.y, Math.SQRT1_2)).toBeLessThan(1e-12);
  });

  it('center가 이동된 ellipse에서도 정확하다', () => {
    const ellipse: CenterArcLike = {
      cx: 10,
      cy: 5,
      rx: 2,
      ry: 3,
      xRotation: 0,
      startAngle: 0,
      endAngle: Math.PI,
      sweep: true,
    };
    const ref = { x: 0, y: 0 };
    arcPointAtTInto(ref, ellipse, 0.5);
    const out = { x: 0, y: 0 };
    arcMiddleInto(out, ellipse);
    expect(Math.abs(out.x - ref.x)).toBeLessThan(1e-12);
    expect(Math.abs(out.y - ref.y)).toBeLessThan(1e-12);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = arcMiddleInto(out, quarterCircle);
    expect(ret).toBe(out);
  });
});

describe('arcMiddle', () => {
  it('새 {x, y}를 반환한다', () => {
    const result = arcMiddle(quarterCircle);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(relErr(result.x, Math.SQRT1_2)).toBeLessThan(1e-12);
    expect(relErr(result.y, Math.SQRT1_2)).toBeLessThan(1e-12);
  });
});
