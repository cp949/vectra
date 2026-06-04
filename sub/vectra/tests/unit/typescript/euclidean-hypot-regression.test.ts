/**
 * Euclidean distance/length must use Math.hypot-style scaling.
 *
 * Regression coverage for overflow/underflow-prone `Math.sqrt(dx * dx + dy * dy)`
 * paths across geometry domains.
 */

import { describe, expect, test } from 'vitest';
import { closestPointInto as circleClosestPointInto } from '../../../src/circle/closest-point-into';
import { decompose } from '../../../src/matrix/decompose';
import { distanceToPoint as segmentDistanceToPoint } from '../../../src/segment/distance-to-point';
import { normalInto } from '../../../src/segment/normal-into';
import { isRight } from '../../../src/triangle/is-right';

describe('Euclidean hypot regression', () => {
  test('segment distance preserves finite huge distance', () => {
    const distance = segmentDistanceToPoint({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } }, { x: 1e308, y: 1e308 });

    expect(distance).toBe(Math.hypot(1e308, 1e308));
  });

  test('segment normal preserves unit direction for huge segment vector', () => {
    const out = { x: 0, y: 0 };

    normalInto(out, { a: { x: 0, y: 0 }, b: { x: 1e308, y: 1e308 } });

    expect(out.x).toBeCloseTo(-Math.SQRT1_2, 12);
    expect(out.y).toBeCloseTo(Math.SQRT1_2, 12);
  });

  test('circle closest point does not treat underflowed distance square as center hit', () => {
    const out = { x: 0, y: 0 };

    circleClosestPointInto(out, { center: { x: 0, y: 0 }, radius: 1 }, { x: 1e-200, y: 1e-200 });

    expect(out.x).toBeCloseTo(Math.SQRT1_2, 12);
    expect(out.y).toBeCloseTo(Math.SQRT1_2, 12);
  });

  test('matrix decomposition preserves finite huge basis length', () => {
    const result = decompose({ a: 1e308, b: 1e308, c: 0, d: 1, tx: 0, ty: 0 });

    expect(result.scaling.x).toBe(Math.hypot(1e308, 1e308));
  });

  test('triangle isRight does not turn every huge non-right angle into right angle', () => {
    const triangle = {
      a: { x: 0, y: 0 },
      b: { x: 1e154, y: 0 },
      c: { x: 0.5e154, y: 1e154 },
    };

    expect(isRight(triangle, 0.1)).toBe(false);
  });
});
