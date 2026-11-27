/**
 * curve approximation polygon builder unit test.
 *
 * fromCircleApproximation* / fromEllipseApproximation*의 segments 개수, 방향, startAngle,
 * 축별 radius clamp(ellipse 각 축 독립), invalid segments clear,
 * non-finite pass-through, companion freshness를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { fromCircleApproximation } from '../../../src/polygon/from-circle-approximation';
import { fromCircleApproximationInto } from '../../../src/polygon/from-circle-approximation-into';
import { fromEllipseApproximation } from '../../../src/polygon/from-ellipse-approximation';
import { fromEllipseApproximationInto } from '../../../src/polygon/from-ellipse-approximation-into';
import type { XYObjectWritable } from '../../../src/types/index';
import { expectClose } from './_polygon-test-helpers';

// ──────────────────────────────────────────────
// fromCircleApproximationInto
// ──────────────────────────────────────────────
describe('fromCircleApproximationInto', () => {
  test('segments = 8에서 vertex 8개를 push하고 첫 점이 (cx, cy - radius)다', () => {
    const out: number[] = [];
    const result = fromCircleApproximationInto(out, { x: 10, y: 20 }, 4, 8);
    expect(result).toBe(out);
    expect(out).toHaveLength(16);
    expectClose(out[0], 10);
    expectClose(out[1], 20 - 4);
  });

  test('segments = 6에서 모든 vertex가 center로부터 radius 거리에 있다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 3, 6);
    expect(out).toHaveLength(12);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(Math.hypot(out[i], out[i + 1]), 3, 3);
    }
  });

  test('기본 clockwise = true에서 vertex[2] > cx', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, 8);
    // startAngle = -π/2 → second vertex 각도 = -π/2 + 2π/8. cos는 양수.
    expect(out[2]).toBeGreaterThan(0);
  });

  test('clockwise = false에서 vertex[2] < cx', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, 8, { startAngle: -Math.PI / 2, clockwise: false });
    // startAngle = -π/2 → second vertex 각도 = -π/2 - 2π/8. cos는 음수.
    expect(out[2]).toBeLessThan(0);
  });

  test('segments < 3이면 out을 clear한다', () => {
    const out: number[] = [9, 9];
    const result = fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, 2);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('non-integer segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, 5.5);
    expect(out).toEqual([]);
  });

  test('NaN segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, Number.NaN);
    expect(out).toEqual([]);
  });

  test('+Infinity segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('-Infinity segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('finite negative radius(-1)에서 모든 vertex가 center에 모인다 (clamp 정책)', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 5, y: 5 }, -1, 8);
    expect(out).toHaveLength(16);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], 5);
      expectClose(out[i + 1], 5);
    }
  });

  test('zero radius에서 모든 vertex가 center에 모인다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 5, y: 5 }, 0, 6);
    expect(out).toHaveLength(12);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], 5);
      expectClose(out[i + 1], 5);
    }
  });

  test('NaN radius는 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, Number.NaN, 4);
    expect(out).toHaveLength(8);
    expect(Number.isNaN(out[0])).toBe(true);
    expect(Number.isNaN(out[1])).toBe(true);
  });

  test('+Infinity radius는 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY, 4);
    expect(out).toHaveLength(8);
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isFinite(out[i]) && Number.isFinite(out[i + 1])).toBe(false);
    }
  });

  test('-Infinity radius는 ±Infinity/NaN 좌표로 pass-through한다 (clamp 없음)', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY, 4);
    expect(out).toHaveLength(8);
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isFinite(out[i]) && Number.isFinite(out[i + 1])).toBe(false);
    }
  });

  test('pre-populated out도 첫 호출에서 clear 후 새 element만 남긴다', () => {
    const out: number[] = [1, 1, 2, 2, 3, 3];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, 4);
    expect(out).toHaveLength(8);
    expectClose(out[0], 0);
    expectClose(out[1], -1);
  });

  test('NaN startAngle은 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromCircleApproximationInto(out, { x: 0, y: 0 }, 1, 3, { startAngle: Number.NaN, clockwise: true });
    expect(out).toHaveLength(6);
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isNaN(out[i])).toBe(true);
      expect(Number.isNaN(out[i + 1])).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────
// fromCircleApproximation (companion)
// ──────────────────────────────────────────────
describe('fromCircleApproximation', () => {
  test('segments 개수만큼 vertex를 만들고 첫 점이 (cx, cy - radius)다', () => {
    const result = fromCircleApproximation({ x: 10, y: 20 }, 4, 8);
    expect(result).toHaveLength(16);
    expectClose(result[0], 10);
    expectClose(result[1], 16);
  });

  test('invalid segments에서 빈 points를 반환한다', () => {
    expect(fromCircleApproximation({ x: 0, y: 0 }, 1, 2)).toEqual([]);
    expect(fromCircleApproximation({ x: 0, y: 0 }, 1, Number.NaN)).toEqual([]);
    expect(fromCircleApproximation({ x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// fromEllipseApproximationInto
// ──────────────────────────────────────────────
describe('fromEllipseApproximationInto', () => {
  test('segments = 16에서 vertex 16개를 push하고 첫 점이 (cx, cy - radiusY)다', () => {
    const out: number[] = [];
    const result = fromEllipseApproximationInto(out, { x: 10, y: 20 }, 5, 3, 16);
    expect(result).toBe(out);
    expect(out).toHaveLength(32);
    expectClose(out[0], 10);
    expectClose(out[1], 20 - 3);
  });

  test('기본 clockwise = true에서 vertex[2] > cx', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 5, 3, 8);
    // startAngle = -π/2 → second vertex 각도 = -π/2 + 2π/8. cos는 양수.
    expect(out[2]).toBeGreaterThan(0);
  });

  test('clockwise = false에서 vertex[2] < cx', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 5, 3, 8, { startAngle: -Math.PI / 2, clockwise: false });
    expect(out[2]).toBeLessThan(0);
  });

  test('radiusX = 0, radiusY > 0, segments = 8: 모든 vertex.x = cx이고 k=2,6에서 vertex가 center다', () => {
    const out: number[] = [];
    const cx = 5;
    const cy = 7;
    const ry = 4;
    fromEllipseApproximationInto(out, { x: cx, y: cy }, 0, ry, 8);
    expect(out).toHaveLength(16);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], cx);
    }
    // angle k = -π/2 + k * π/4. sin(angle) → k=2(sin 0), k=6(sin π) = 0 → center.
    expectClose(out[5], cy);
    expectClose(out[13], cy);
    // k=0: sin(-π/2) = -1 → cy - ry.
    expectClose(out[1], cy - ry);
    // k=4: sin(π/2) = 1 → cy + ry.
    expectClose(out[9], cy + ry, ry);
    // k=1: sin(-π/4) = -√2/2 → cy - ry*√2/2.
    expectClose(out[3], cy - (ry * Math.SQRT2) / 2, ry);
    // k=3: sin(π/4) = √2/2 → cy + ry*√2/2.
    expectClose(out[7], cy + (ry * Math.SQRT2) / 2, ry);
    // k=5: sin(3π/4) = √2/2 → cy + ry*√2/2.
    expectClose(out[11], cy + (ry * Math.SQRT2) / 2, ry);
    // k=7: sin(5π/4) = -√2/2 → cy - ry*√2/2.
    expectClose(out[15], cy - (ry * Math.SQRT2) / 2, ry);
  });

  test('radiusY = 0, radiusX > 0: 모든 vertex.y = cy이고 cos(angle) = 0인 k에서 center다', () => {
    const out: number[] = [];
    const cx = -2;
    const cy = 3;
    const rx = 6;
    fromEllipseApproximationInto(out, { x: cx, y: cy }, rx, 0, 8);
    expect(out).toHaveLength(16);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i + 1], cy);
    }
    // angle k = -π/2 + k * π/4. cos(angle) → k=0(cos -π/2 = 0), k=4(cos π/2 = 0) → center.
    expectClose(out[0], cx);
    expectClose(out[8], cx);
    // k=2: cos(0) = 1 → cx + rx.
    expectClose(out[4], cx + rx, rx);
    // k=6: cos(π) = -1 → cx - rx.
    expectClose(out[12], cx - rx, rx);
  });

  test('양쪽 radius가 모두 0이면 모든 vertex가 center다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 4, y: 5 }, 0, 0, 6);
    expect(out).toHaveLength(12);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], 4);
      expectClose(out[i + 1], 5);
    }
  });

  test('finite negative radiusX는 0으로 clamp된다 (radiusY는 정상)', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, -3, 4, 8);
    expect(out).toHaveLength(16);
    // clamp 결과 radiusX = 0 → 모든 vertex.x = 0.
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], 0);
    }
  });

  test('finite negative radiusY는 0으로 clamp된다 (radiusX는 정상)', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 4, -3, 8);
    expect(out).toHaveLength(16);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i + 1], 0);
    }
  });

  test('segments < 3이면 out을 clear한다', () => {
    const out: number[] = [9, 9];
    const result = fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, 1, 2);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('non-integer segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, 1, 5.5);
    expect(out).toEqual([]);
  });

  test('NaN segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, 1, Number.NaN);
    expect(out).toEqual([]);
  });

  test('+Infinity segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, 1, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('-Infinity segments는 out을 clear한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, 1, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('NaN radiusX는 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, Number.NaN, 1, 4);
    expect(out).toHaveLength(8);
    // 모든 vertex.x는 NaN. y는 일부 finite, 일부 NaN일 수 있다.
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isNaN(out[i])).toBe(true);
    }
  });

  test('NaN radiusY는 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, Number.NaN, 4);
    expect(out).toHaveLength(8);
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isNaN(out[i + 1])).toBe(true);
    }
  });

  test('+Infinity radiusX는 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY, 1, 4);
    expect(out).toHaveLength(8);
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isFinite(out[i])).toBe(false);
    }
  });

  test('-Infinity radiusY는 ±Infinity/NaN 좌표로 pass-through한다 (clamp 없음)', () => {
    const out: number[] = [];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 1, Number.NEGATIVE_INFINITY, 4);
    expect(out).toHaveLength(8);
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isFinite(out[i + 1])).toBe(false);
    }
  });

  test('pre-populated out도 첫 호출에서 clear 후 새 element만 남긴다', () => {
    const out: number[] = [1, 1, 2, 2, 3, 3];
    fromEllipseApproximationInto(out, { x: 0, y: 0 }, 2, 3, 4);
    expect(out).toHaveLength(8);
    expectClose(out[0], 0);
    expectClose(out[1], -3);
  });
});

// ──────────────────────────────────────────────
// fromEllipseApproximation (companion)
// ──────────────────────────────────────────────
describe('fromEllipseApproximation', () => {
  test('segments 개수만큼 vertex를 만들고 첫 점이 (cx, cy - radiusY)다', () => {
    const result = fromEllipseApproximation({ x: 10, y: 20 }, 5, 3, 16);
    expect(result).toHaveLength(32);
    expectClose(result[0], 10);
    expectClose(result[1], 17);
  });

  test('invalid segments에서 빈 points를 반환한다', () => {
    expect(fromEllipseApproximation({ x: 0, y: 0 }, 1, 1, 2)).toEqual([]);
    expect(fromEllipseApproximation({ x: 0, y: 0 }, 1, 1, Number.NaN)).toEqual([]);
    expect(fromEllipseApproximation({ x: 0, y: 0 }, 1, 1, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});
