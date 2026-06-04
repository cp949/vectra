/**
 * arcNormalAtInto / arcNormalAt unit test.
 *
 * 검증 방법:
 * - unit normal이 unit tangent와 직교하고 길이가 1이다.
 * - 정책: (-tangent.y, tangent.x).
 * - degenerate arc에서 zero vector를 반환한다.
 */

import { describe, expect, it } from 'vitest';
import { arcNormalAt } from '../../../src/curve/arc-normal-at';
import { arcNormalAtInto } from '../../../src/curve/arc-normal-at-into';
import { arcTangentAtInto } from '../../../src/curve/arc-tangent-at-into';
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

describe('arcNormalAtInto', () => {
  it('normal이 tangent와 직교한다 (dot product ≈ 0)', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const tangent = { x: 0, y: 0 };
      const normal = { x: 0, y: 0 };
      arcTangentAtInto(tangent, quarterCircle, t);
      arcNormalAtInto(normal, quarterCircle, t);
      const dot = tangent.x * normal.x + tangent.y * normal.y;
      expect(Math.abs(dot)).toBeLessThan(1e-12);
    }
  });

  it('normal 벡터의 길이가 1이다', () => {
    for (const t of [0.1, 0.5, 0.9]) {
      const out = { x: 0, y: 0 };
      arcNormalAtInto(out, quarterCircle, t);
      const len = Math.hypot(out.x, out.y);
      expect(relErr(len, 1)).toBeLessThan(1e-12);
    }
  });

  it('normal = (-tangent.y, tangent.x) 정책을 따른다', () => {
    for (const t of [0, 0.5, 1]) {
      const tangent = { x: 0, y: 0 };
      const normal = { x: 0, y: 0 };
      arcTangentAtInto(tangent, quarterCircle, t);
      arcNormalAtInto(normal, quarterCircle, t);
      expect(Math.abs(normal.x - -tangent.y)).toBeLessThan(1e-12);
      expect(Math.abs(normal.y - tangent.x)).toBeLessThan(1e-12);
    }
  });

  it('unit 원 t=0에서 normal은 (-1, 0)이다', () => {
    // t=0: tangent = (0, 1) → normal = (-1, 0)
    const out = { x: 0, y: 0 };
    arcNormalAtInto(out, quarterCircle, 0);
    expect(Math.abs(out.x - -1)).toBeLessThan(1e-12);
    expect(Math.abs(out.y)).toBeLessThan(1e-12);
  });

  it('degenerate (rx=0) arc에서 zero vector를 반환한다', () => {
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
    const out = { x: 1, y: 1 };
    arcNormalAtInto(out, degenerate, 0.5);
    expect(Math.abs(out.x)).toBe(0);
    expect(Math.abs(out.y)).toBe(0);
  });

  it('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ret = arcNormalAtInto(out, quarterCircle, 0.5);
    expect(ret).toBe(out);
  });
});

describe('arcNormalAt', () => {
  it('새 {x, y}를 반환한다', () => {
    const result = arcNormalAt(quarterCircle, 0);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(Math.abs(result.x - -1)).toBeLessThan(1e-12);
    expect(Math.abs(result.y)).toBeLessThan(1e-12);
  });
});
