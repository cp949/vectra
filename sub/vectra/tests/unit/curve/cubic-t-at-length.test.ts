/**
 * cubicTAtLength unit test.
 *
 * 검증 방법:
 * - 직선 cubic Bezier에서 distance/totalLength ≈ t.
 * - tuple XYInput을 받는다.
 *
 * distance 경계, zero-length, 범위 [0, 1], round-trip 같은 일반 동작은 speed-length.test.ts가 검증한다.
 */

import { describe, expect, it } from 'vitest';
import { cubicLengthAtT } from '../../../src/curve/cubic-length-at-t';
import { cubicTAtLength } from '../../../src/curve/cubic-t-at-length';

function relErr(result: number, expected: number): number {
  if (expected === 0) return Math.abs(result);
  return Math.abs(result - expected) / Math.abs(expected);
}

describe('cubicTAtLength', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 1, y: 3 };
  const p2 = { x: 3, y: 3 };
  const p3 = { x: 4, y: 0 };

  it('직선 cubic Bezier에서 distance/totalLength ≈ t이다', () => {
    const a = { x: 0, y: 0 };
    const b1 = { x: 10 / 3, y: 0 };
    const b2 = { x: 20 / 3, y: 0 };
    const b = { x: 10, y: 0 };
    const t = cubicTAtLength(a, b1, b2, b, 5);
    expect(relErr(t, 0.5)).toBeLessThan(1e-6);
  });

  it('tuple XYInput을 받는다', () => {
    const targetLen = cubicLengthAtT(p0, p1, p2, p3, 0.5);
    const result = cubicTAtLength([0, 0], [1, 3], [3, 3], [4, 0], targetLen);
    const ref = cubicTAtLength(p0, p1, p2, p3, targetLen);
    expect(relErr(result, ref)).toBeLessThan(1e-12);
  });
});
