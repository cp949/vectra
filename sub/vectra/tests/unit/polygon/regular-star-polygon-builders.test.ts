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
import type { XYObjectWritable } from '../../../src/types/index';
import { expectClose } from './_polygon-test-helpers';

// ──────────────────────────────────────────────
// regularPolygonInto
// ──────────────────────────────────────────────
describe('regularPolygonInto', () => {
  test('sides = 5에서 vertex 5개를 push하고 첫 점이 (cx, cy - radius)다', () => {
    const out: XYObjectWritable[] = [];
    const result = regularPolygonInto(out, { x: 10, y: 20 }, 3, 5);
    expect(result).toBe(out);
    expect(out).toHaveLength(5);
    expectClose(out[0].x, 10);
    expectClose(out[0].y, 20 - 3);
    // 모든 vertex가 반지름 3 원 위에 있다.
    for (let i = 0; i < 5; i++) {
      expectClose(Math.hypot(out[i].x - 10, out[i].y - 20), 3, 3);
    }
  });

  test('tuple center 입력이 object center와 동일 결과를 만든다', () => {
    const fromObject: XYObjectWritable[] = [];
    const fromTuple: XYObjectWritable[] = [];
    regularPolygonInto(fromObject, { x: 4, y: -7 }, 2, 6);
    regularPolygonInto(fromTuple, [4, -7], 2, 6);
    expect(fromTuple).toHaveLength(6);
    expect(fromObject).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expectClose(fromTuple[i].x, fromObject[i].x);
      expectClose(fromTuple[i].y, fromObject[i].y);
    }
  });

  test('기본 clockwise = true에서 vertex[1].x > cx (SVG y-down clockwise)', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 1, 5);
    // startAngle = -π/2 → second vertex 각도 = -π/2 + 2π/5. cos는 양수.
    expect(out[1].x).toBeGreaterThan(0);
  });

  test('clockwise = false에서 vertex[1].x < cx', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 1, 5, { clockwise: false });
    // startAngle = -π/2 → second vertex 각도 = -π/2 - 2π/5. cos는 음수.
    expect(out[1].x).toBeLessThan(0);
  });

  test('sides < 3이면 out을 clear한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = regularPolygonInto(out, [0, 0], 1, 2);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('non-integer sides는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 1, 3.5);
    expect(out).toEqual([]);
  });

  test('NaN sides는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 1, Number.NaN);
    expect(out).toEqual([]);
  });

  test('+Infinity sides는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 1, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('-Infinity sides는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 1, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('pre-populated out도 첫 호출에서 clear 후 새 element만 남긴다', () => {
    const out: XYObjectWritable[] = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    regularPolygonInto(out, [0, 0], 1, 4);
    expect(out).toHaveLength(4);
    expectClose(out[0].x, 0);
    expectClose(out[0].y, -1);
  });

  test('finite negative radius(-1)에서 모든 vertex가 center에 모인다 (clamp 정책)', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [5, 5], -1, 6);
    expect(out).toHaveLength(6);
    for (const v of out) {
      expectClose(v.x, 5);
      expectClose(v.y, 5);
    }
  });

  test('zero radius에서 모든 vertex가 center에 모인다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [5, 5], 0, 6);
    expect(out).toHaveLength(6);
    for (const v of out) {
      expectClose(v.x, 5);
      expectClose(v.y, 5);
    }
  });

  test('NaN radius는 NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], Number.NaN, 3);
    expect(out).toHaveLength(3);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(Number.isNaN(out[0].y)).toBe(true);
  });

  test('+Infinity radius는 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], Number.POSITIVE_INFINITY, 3);
    expect(out).toHaveLength(3);
    // 어떤 vertex도 finite 좌표를 갖지 않는다 (clamp되지 않고 그대로 흐른다).
    for (const v of out) {
      expect(Number.isFinite(v.x) && Number.isFinite(v.y)).toBe(false);
    }
  });

  test('-Infinity radius는 ±Infinity/NaN 좌표로 pass-through한다 (clamp 없음)', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], Number.NEGATIVE_INFINITY, 3);
    expect(out).toHaveLength(3);
    // -Infinity는 finite이 아니므로 0으로 clamp되지 않고 그대로 흐른다.
    for (const v of out) {
      expect(Number.isFinite(v.x) && Number.isFinite(v.y)).toBe(false);
    }
  });

  test('startAngle = 0이면 첫 vertex가 (cx + radius, cy)다', () => {
    const out: XYObjectWritable[] = [];
    regularPolygonInto(out, [0, 0], 5, 4, { startAngle: 0 });
    expectClose(out[0].x, 5);
    expectClose(out[0].y, 0);
  });
});

// ──────────────────────────────────────────────
// regularPolygon (companion)
// ──────────────────────────────────────────────
describe('regularPolygon', () => {
  test('regularPolygonInto 결과와 동등한 { points } 를 반환한다', () => {
    const expected: XYObjectWritable[] = [];
    regularPolygonInto(expected, [3, 4], 2, 5);
    const actual = regularPolygon([3, 4], 2, 5);
    expect(actual.points).toEqual(expected);
  });

  test('매 호출마다 새 { points } object와 새 plain { x, y } element를 만든다', () => {
    const r1 = regularPolygon([0, 0], 1, 5);
    const r2 = regularPolygon([0, 0], 1, 5);
    expect(r1).not.toBe(r2);
    expect(r1.points).not.toBe(r2.points);
    expect(r1.points[0]).not.toBe(r2.points[0]);
    // element는 plain object여야 한다 (Object.getPrototypeOf === Object.prototype).
    expect(Object.getPrototypeOf(r1.points[0])).toBe(Object.prototype);
  });

  test('invalid sides에서 빈 points를 반환한다', () => {
    expect(regularPolygon([0, 0], 1, 2).points).toEqual([]);
    expect(regularPolygon([0, 0], 1, Number.NaN).points).toEqual([]);
    expect(regularPolygon([0, 0], 1, Number.POSITIVE_INFINITY).points).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// starPolygonInto
// ──────────────────────────────────────────────
describe('starPolygonInto', () => {
  test('points = 5에서 vertex 10개를 push하고 outer/inner 거리가 교차한다', () => {
    const out: XYObjectWritable[] = [];
    const result = starPolygonInto(out, [0, 0], 1, 2, 5);
    expect(result).toBe(out);
    expect(out).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      const expectedR = i % 2 === 0 ? 2 : 1;
      expectClose(Math.hypot(out[i].x, out[i].y), expectedR, expectedR);
    }
    // 첫 vertex는 outer (r=2)이고 startAngle = -π/2 → (0, -2).
    expectClose(out[0].x, 0);
    expectClose(out[0].y, -2);
  });

  test('tuple center가 object center와 동일 결과를 만든다', () => {
    const fromObject: XYObjectWritable[] = [];
    const fromTuple: XYObjectWritable[] = [];
    starPolygonInto(fromObject, { x: -2, y: 5 }, 1, 3, 4);
    starPolygonInto(fromTuple, [-2, 5], 1, 3, 4);
    expect(fromTuple).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      expectClose(fromTuple[i].x, fromObject[i].x);
      expectClose(fromTuple[i].y, fromObject[i].y);
    }
  });

  test('points < 3이면 out을 clear한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    starPolygonInto(out, [0, 0], 1, 2, 2);
    expect(out).toEqual([]);
  });

  test('non-integer points는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], 1, 2, 3.5);
    expect(out).toEqual([]);
  });

  test('NaN points는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], 1, 2, Number.NaN);
    expect(out).toEqual([]);
  });

  test('+Infinity points는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], 1, 2, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('-Infinity points는 out을 clear한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], 1, 2, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('pre-populated out도 첫 호출에서 clear 후 새 element만 남긴다', () => {
    const out: XYObjectWritable[] = [
      { x: 7, y: 7 },
      { x: 8, y: 8 },
    ];
    starPolygonInto(out, [0, 0], 1, 2, 3);
    expect(out).toHaveLength(6);
  });

  test('clockwise = false에서 두 번째 vertex가 반대 방향에 있다', () => {
    const cw: XYObjectWritable[] = [];
    const ccw: XYObjectWritable[] = [];
    starPolygonInto(cw, [0, 0], 1, 2, 5);
    starPolygonInto(ccw, [0, 0], 1, 2, 5, { clockwise: false });
    // 두 결과 모두 첫 vertex는 outer 위쪽 (0, -2)로 동일.
    expectClose(cw[0].x, ccw[0].x);
    expectClose(cw[0].y, ccw[0].y);
    // 두 번째 vertex는 진행 방향이 반대 → x 부호가 반대.
    expect(Math.sign(cw[1].x)).toBe(-Math.sign(ccw[1].x));
  });

  test('finite negative innerRadius를 clamp하지 않고 좌표에 그대로 반영한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], -1, 2, 4);
    expect(out).toHaveLength(8);
    // index 1 (inner)이 r = |-1| = 1 거리에 있고 방향은 반대.
    expectClose(Math.hypot(out[1].x, out[1].y), 1, 1);
  });

  test('finite negative outerRadius를 clamp하지 않고 좌표에 그대로 반영한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], 1, -2, 4);
    // index 0 (outer) 좌표는 (0 * -2, -1 * -2) = (0, 2). 위가 아닌 아래로 시작.
    expectClose(out[0].x, 0);
    expectClose(out[0].y, 2);
  });

  test('finite zero innerRadius에서 inner vertex가 center에 정렬된다 (정상 산출)', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [5, 5], 0, 2, 5);
    expect(out).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        expectClose(Math.hypot(out[i].x - 5, out[i].y - 5), 2, 2);
      } else {
        expectClose(out[i].x, 5);
        expectClose(out[i].y, 5);
      }
    }
  });

  test('finite zero outerRadius에서 outer vertex가 center에 정렬된다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [5, 5], 1, 0, 5);
    expect(out).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        expectClose(out[i].x, 5);
        expectClose(out[i].y, 5);
      } else {
        expectClose(Math.hypot(out[i].x - 5, out[i].y - 5), 1, 1);
      }
    }
  });

  test('NaN innerRadius를 NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], Number.NaN, 2, 3);
    expect(out).toHaveLength(6);
    // index 1이 inner.
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(Number.isNaN(out[1].y)).toBe(true);
  });

  test('+Infinity outerRadius를 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], 1, Number.POSITIVE_INFINITY, 3);
    expect(out).toHaveLength(6);
    // index 0이 outer. cos(-π/2)는 정확히 0이 아니라 ~6.12e-17이므로
    // (cos*Infinity, sin*Infinity) = (+Infinity, -Infinity)로 둘 다 non-finite다.
    expect(Number.isFinite(out[0].x) && Number.isFinite(out[0].y)).toBe(false);
  });

  test('-Infinity innerRadius를 ±Infinity/NaN 좌표로 pass-through한다', () => {
    const out: XYObjectWritable[] = [];
    starPolygonInto(out, [0, 0], Number.NEGATIVE_INFINITY, 1, 3);
    // index 1이 inner. non-finite는 그대로 흐른다 (star는 clamp 없음).
    // -Infinity * finite (cos, sin) → ±Infinity 좌표.
    expect(Number.isFinite(out[1].x) && Number.isFinite(out[1].y)).toBe(false);
  });
});

// ──────────────────────────────────────────────
// starPolygon (companion)
// ──────────────────────────────────────────────
describe('starPolygon', () => {
  test('starPolygonInto 결과와 동등한 { points } 를 반환한다', () => {
    const expected: XYObjectWritable[] = [];
    starPolygonInto(expected, [3, 4], 1, 3, 6);
    const actual = starPolygon([3, 4], 1, 3, 6);
    expect(actual.points).toEqual(expected);
  });

  test('매 호출마다 새 { points } object와 새 plain { x, y } element를 만든다', () => {
    const r1 = starPolygon([0, 0], 1, 2, 5);
    const r2 = starPolygon([0, 0], 1, 2, 5);
    expect(r1).not.toBe(r2);
    expect(r1.points).not.toBe(r2.points);
    expect(r1.points[0]).not.toBe(r2.points[0]);
    expect(Object.getPrototypeOf(r1.points[0])).toBe(Object.prototype);
  });

  test('invalid points에서 빈 points를 반환한다', () => {
    expect(starPolygon([0, 0], 1, 2, 2).points).toEqual([]);
    expect(starPolygon([0, 0], 1, 2, Number.NaN).points).toEqual([]);
    expect(starPolygon([0, 0], 1, 2, Number.POSITIVE_INFINITY).points).toEqual([]);
  });
});
