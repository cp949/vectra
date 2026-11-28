/**
 * regular/star polygon vertex builder unit test.
 *
 * regularPolygonInto / regularPolygon / starPolygonInto / starPolygon의
 * vertex 개수, 방향, startAngle, radius clamp(regular)와 raw(star),
 * invalid count clear, non-finite pass-through, companion freshness를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { regularPolygon } from '../../../src/polygon/regular-polygon';
import { regularPolygonInto } from '../../../src/polygon/regular-polygon-into';
import { starPolygon } from '../../../src/polygon/star-polygon';
import { starPolygonInto } from '../../../src/polygon/star-polygon-into';
import type { PointWritable } from '../../../src/types/index';
import { expectClose } from './_polygon-test-helpers';

// ──────────────────────────────────────────────
// regularPolygonInto
// ──────────────────────────────────────────────
describe('regularPolygonInto', () => {
  test('sides = 5에서 vertex 5개를 push하고 첫 점이 (cx, cy - radius)다', () => {
    const out: number[] = [];
    const result = regularPolygonInto(out, { x: 10, y: 20 }, 3, 5);
    expect(result).toBe(out);
    expect(out).toHaveLength(10);
    expectClose(out[0], 10);
    expectClose(out[1], 20 - 3);
    // 모든 vertex가 반지름 3 원 위에 있다.
    for (let i = 0; i < 5; i++) {
      expectClose(Math.hypot(out[2 * i] - 10, out[2 * i + 1] - 20), 3, 3);
    }
  });

  test('기본 clockwise = true에서 vertex[2] > cx (SVG y-down clockwise)', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, 5);
    // startAngle = -π/2 → second vertex 각도 = -π/2 + 2π/5. cos는 양수.
    expect(out[2]).toBeGreaterThan(0);
  });

  test('clockwise = false에서 vertex[2] < cx', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, 5, { startAngle: -Math.PI / 2, clockwise: false });
    // startAngle = -π/2 → second vertex 각도 = -π/2 - 2π/5. cos는 음수.
    expect(out[2]).toBeLessThan(0);
  });

  test('sides < 3이면 out을 clear한다', () => {
    const out: number[] = [9, 9];
    const result = regularPolygonInto(out, { x: 0, y: 0 }, 1, 2);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('non-integer sides는 out을 clear한다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, 3.5);
    expect(out).toEqual([]);
  });

  test('NaN sides는 out을 clear한다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, Number.NaN);
    expect(out).toEqual([]);
  });

  test('+Infinity sides는 out을 clear한다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('-Infinity sides는 out을 clear한다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('pre-populated out도 첫 호출에서 clear 후 새 element만 남긴다', () => {
    const out: number[] = [1, 1, 2, 2, 3, 3];
    regularPolygonInto(out, { x: 0, y: 0 }, 1, 4);
    expect(out).toHaveLength(8);
    expectClose(out[0], 0);
    expectClose(out[1], -1);
  });

  test('finite negative radius(-1)에서 모든 vertex가 center에 모인다 (clamp 정책)', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 5, y: 5 }, -1, 6);
    expect(out).toHaveLength(12);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], 5);
      expectClose(out[i + 1], 5);
    }
  });

  test('zero radius에서 모든 vertex가 center에 모인다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 5, y: 5 }, 0, 6);
    expect(out).toHaveLength(12);
    for (let i = 0; i < out.length; i += 2) {
      expectClose(out[i], 5);
      expectClose(out[i + 1], 5);
    }
  });

  test('NaN radius는 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, Number.NaN, 3);
    expect(out).toHaveLength(6);
    expect(Number.isNaN(out[0])).toBe(true);
    expect(Number.isNaN(out[1])).toBe(true);
  });

  test('+Infinity radius는 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY, 3);
    expect(out).toHaveLength(6);
    // 어떤 vertex도 finite 좌표를 갖지 않는다 (clamp되지 않고 그대로 흐른다).
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isFinite(out[i]) && Number.isFinite(out[i + 1])).toBe(false);
    }
  });

  test('-Infinity radius는 ±Infinity/NaN 좌표로 pass-through한다 (clamp 없음)', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY, 3);
    expect(out).toHaveLength(6);
    // -Infinity는 finite이 아니므로 0으로 clamp되지 않고 그대로 흐른다.
    for (let i = 0; i < out.length; i += 2) {
      expect(Number.isFinite(out[i]) && Number.isFinite(out[i + 1])).toBe(false);
    }
  });

  test('startAngle = 0이면 첫 vertex가 (cx + radius, cy)다', () => {
    const out: number[] = [];
    regularPolygonInto(out, { x: 0, y: 0 }, 5, 4, { startAngle: 0, clockwise: true });
    expectClose(out[0], 5);
    expectClose(out[1], 0);
  });
});

// ──────────────────────────────────────────────
// regularPolygon (companion)
// ──────────────────────────────────────────────
describe('regularPolygon', () => {
  test('regularPolygonInto 결과와 같은 좌표 배열을 반환한다', () => {
    const expected: number[] = [];
    regularPolygonInto(expected, { x: 3, y: 4 }, 2, 5);
    const actual = regularPolygon({ x: 3, y: 4 }, 2, 5);
    expect(actual).toEqual(expected);
  });

  test('매 호출마다 새 좌표 배열을 만든다', () => {
    const r1 = regularPolygon({ x: 0, y: 0 }, 1, 5);
    const r2 = regularPolygon({ x: 0, y: 0 }, 1, 5);
    expect(r1).not.toBe(r2);
  });

  test('invalid sides에서 빈 points를 반환한다', () => {
    expect(regularPolygon({ x: 0, y: 0 }, 1, 2)).toEqual([]);
    expect(regularPolygon({ x: 0, y: 0 }, 1, Number.NaN)).toEqual([]);
    expect(regularPolygon({ x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// starPolygonInto
// ──────────────────────────────────────────────
describe('starPolygonInto', () => {
  test('points = 5에서 vertex 10개를 push하고 outer/inner 거리가 교차한다', () => {
    const out: number[] = [];
    const result = starPolygonInto(out, { x: 0, y: 0 }, 1, 2, 5);
    expect(result).toBe(out);
    expect(out).toHaveLength(20);
    for (let i = 0; i < 10; i++) {
      const expectedR = i % 2 === 0 ? 2 : 1;
      expectClose(Math.hypot(out[2 * i], out[2 * i + 1]), expectedR, expectedR);
    }
    // 첫 vertex는 outer (r=2)이고 startAngle = -π/2 → (0, -2).
    expectClose(out[0], 0);
    expectClose(out[1], -2);
  });

  test('points < 3이면 out을 clear한다', () => {
    const out: number[] = [9, 9];
    starPolygonInto(out, { x: 0, y: 0 }, 1, 2, 2);
    expect(out).toEqual([]);
  });

  test('non-integer points는 out을 clear한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, 1, 2, 3.5);
    expect(out).toEqual([]);
  });

  test('NaN points는 out을 clear한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, 1, 2, Number.NaN);
    expect(out).toEqual([]);
  });

  test('+Infinity points는 out을 clear한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, 1, 2, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('-Infinity points는 out을 clear한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, 1, 2, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('pre-populated out도 첫 호출에서 clear 후 새 element만 남긴다', () => {
    const out: number[] = [7, 7, 8, 8];
    starPolygonInto(out, { x: 0, y: 0 }, 1, 2, 3);
    expect(out).toHaveLength(12);
  });

  test('clockwise = false에서 두 번째 vertex가 반대 방향에 있다', () => {
    const cw: number[] = [];
    const ccw: number[] = [];
    starPolygonInto(cw, { x: 0, y: 0 }, 1, 2, 5);
    starPolygonInto(ccw, { x: 0, y: 0 }, 1, 2, 5, { startAngle: -Math.PI / 2, clockwise: false });
    // 두 결과 모두 첫 vertex는 outer 위쪽 (0, -2)로 동일.
    expectClose(cw[0], ccw[0]);
    expectClose(cw[1], ccw[1]);
    // 두 번째 vertex는 진행 방향이 반대 → x 부호가 반대.
    expect(Math.sign(cw[2])).toBe(-Math.sign(ccw[2]));
  });

  test('finite negative innerRadius를 clamp하지 않고 좌표에 그대로 반영한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, -1, 2, 4);
    expect(out).toHaveLength(16);
    // index 1 (inner)이 r = |-1| = 1 거리에 있고 방향은 반대.
    expectClose(Math.hypot(out[2], out[3]), 1, 1);
  });

  test('finite negative outerRadius를 clamp하지 않고 좌표에 그대로 반영한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, 1, -2, 4);
    // index 0 (outer) 좌표는 (0 * -2, -1 * -2) = (0, 2). 위가 아닌 아래로 시작.
    expectClose(out[0], 0);
    expectClose(out[1], 2);
  });

  test('finite zero innerRadius에서 inner vertex가 center에 정렬된다 (정상 산출)', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 5, y: 5 }, 0, 2, 5);
    expect(out).toHaveLength(20);
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        expectClose(Math.hypot(out[2 * i] - 5, out[2 * i + 1] - 5), 2, 2);
      } else {
        expectClose(out[2 * i], 5);
        expectClose(out[2 * i + 1], 5);
      }
    }
  });

  test('finite zero outerRadius에서 outer vertex가 center에 정렬된다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 5, y: 5 }, 1, 0, 5);
    expect(out).toHaveLength(20);
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        expectClose(out[2 * i], 5);
        expectClose(out[2 * i + 1], 5);
      } else {
        expectClose(Math.hypot(out[2 * i] - 5, out[2 * i + 1] - 5), 1, 1);
      }
    }
  });

  test('NaN innerRadius를 NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, Number.NaN, 2, 3);
    expect(out).toHaveLength(12);
    // index 1이 inner.
    expect(Number.isNaN(out[2])).toBe(true);
    expect(Number.isNaN(out[3])).toBe(true);
  });

  test('+Infinity outerRadius를 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY, 3);
    expect(out).toHaveLength(12);
    // index 0이 outer. cos(-π/2)는 정확히 0이 아니라 ~6.12e-17이므로
    // (cos*Infinity, sin*Infinity) = (+Infinity, -Infinity)로 둘 다 non-finite다.
    expect(Number.isFinite(out[0]) && Number.isFinite(out[1])).toBe(false);
  });

  test('-Infinity innerRadius를 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: number[] = [];
    starPolygonInto(out, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY, 1, 3);
    // index 1이 inner. non-finite는 그대로 흐른다 (star는 clamp 없음).
    // -Infinity * finite (cos, sin) → ±Infinity 좌표.
    expect(Number.isFinite(out[2]) && Number.isFinite(out[3])).toBe(false);
  });
});

// ──────────────────────────────────────────────
// starPolygon (companion)
// ──────────────────────────────────────────────
describe('starPolygon', () => {
  test('starPolygonInto 결과와 같은 좌표 배열을 반환한다', () => {
    const expected: number[] = [];
    starPolygonInto(expected, { x: 3, y: 4 }, 1, 3, 6);
    const actual = starPolygon({ x: 3, y: 4 }, 1, 3, 6);
    expect(actual).toEqual(expected);
  });

  test('매 호출마다 새 좌표 배열을 만든다', () => {
    const r1 = starPolygon({ x: 0, y: 0 }, 1, 2, 5);
    const r2 = starPolygon({ x: 0, y: 0 }, 1, 2, 5);
    expect(r1).not.toBe(r2);
  });

  test('invalid points에서 빈 points를 반환한다', () => {
    expect(starPolygon({ x: 0, y: 0 }, 1, 2, 2)).toEqual([]);
    expect(starPolygon({ x: 0, y: 0 }, 1, 2, Number.NaN)).toEqual([]);
    expect(starPolygon({ x: 0, y: 0 }, 1, 2, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});
