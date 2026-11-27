/**
 * circle domain construction/tangent follow-up API 계약 검증.
 * bounds companion, fromThreePointsInto/fromThreePoints, externalTangentsInto/externalTangents,
 * internalTangentsInto/internalTangents의 success/failure/degenerate/non-finite 경로를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/circle/bounds';
import { boundsInto } from '../../../src/circle/bounds-into';
import { externalTangents } from '../../../src/circle/external-tangents';
import { externalTangentsInto } from '../../../src/circle/external-tangents-into';
import { fromThreePoints } from '../../../src/circle/from-three-points';
import { fromThreePointsInto } from '../../../src/circle/from-three-points-into';
import { internalTangents } from '../../../src/circle/internal-tangents';
import { internalTangentsInto } from '../../../src/circle/internal-tangents-into';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';

// ─── bounds ─────────────────────────────────────────────────────────────────

describe('circle.bounds — boundsInto의 allocating companion', () => {
  test('boundsInto와 동일한 결과를 새 plain object로 반환한다', () => {
    const circle = { cx: 3, cy: 4, r: 2 };
    const ref = boundsInto({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, circle);
    const result = bounds(circle);
    expect(result).toEqual(ref);
  });

  test('radius > 0인 circle의 bounds를 올바르게 반환한다', () => {
    const circle = { cx: 1, cy: 2, r: 5 };
    const result = bounds(circle);
    expect(result.minX).toBe(-4);
    expect(result.minY).toBe(-3);
    expect(result.maxX).toBe(6);
    expect(result.maxY).toBe(7);
  });

  test('empty circle(radius <= 0)은 sentinel empty bounds를 반환한다', () => {
    const result = bounds({ cx: 0, cy: 0, r: 0 });
    expect(result.minX).toBe(Infinity);
    expect(result.minY).toBe(Infinity);
    expect(result.maxX).toBe(-Infinity);
    expect(result.maxY).toBe(-Infinity);
  });

  test('호출마다 새 object를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: 1 };
    expect(bounds(circle)).not.toBe(bounds(circle));
  });

  test('NaN radius는 boundsInto와 동일한 산술 결과를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: Number.NaN };
    const ref = boundsInto({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, circle);
    expect(bounds(circle)).toEqual(ref);
  });

  test('Infinity radius는 boundsInto와 동일한 산술 결과를 반환한다', () => {
    const circle = { cx: 0, cy: 0, r: Infinity };
    const ref = boundsInto({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, circle);
    expect(bounds(circle)).toEqual(ref);
  });
});

// ─── fromThreePointsInto / fromThreePoints ───────────────────────────────────

describe('circle.fromThreePointsInto — 세 점을 지나는 외접원', () => {
  test('직각삼각형 세 꼭짓점에서 외접원 center와 radius를 계산한다', () => {
    // A=(0,0), B=(4,0), C=(0,3) → center=(2, 1.5), radius=2.5
    const out = { cx: 0, cy: 0, r: 0 };
    const result = fromThreePointsInto(out, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 });
    expect(result).toBe(out);
    expect(out.cx).toBeCloseTo(2, 10);
    expect(out.cy).toBeCloseTo(1.5, 10);
    expect(out.r).toBeCloseTo(2.5, 10);
  });

  test('point 순서가 달라도 동일한 외접원을 반환한다', () => {
    const out1 = { cx: 0, cy: 0, r: 0 };
    const out2 = { cx: 0, cy: 0, r: 0 };
    fromThreePointsInto(out1, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 });
    fromThreePointsInto(out2, { x: 0, y: 3 }, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(out1.cx).toBeCloseTo(out2.cx, 10);
    expect(out1.cy).toBeCloseTo(out2.cy, 10);
    expect(out1.r).toBeCloseTo(out2.r, 10);
  });

  test('collinear 세 점은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { cx: 99, cy: 99, r: 99 };
    const result = fromThreePointsInto(out, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 });
    expect(result).toBe(false);
    expect(out.cx).toBe(99);
    expect(out.cy).toBe(99);
    expect(out.r).toBe(99);
  });

  test('duplicate point는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { cx: 1, cy: 1, r: 1 };
    const p = { x: 3, y: 4 };
    expect(fromThreePointsInto(out, p, p, { x: 5, y: 6 })).toBe(false);
    expect(out.cx).toBe(1);
  });

  test('출력 객체가 첫 입력 점과 같아도 안전하다', () => {
    const out = { x: 0, y: 0, cx: 0, cy: 0, r: 0 };
    fromThreePointsInto(out, out, { x: 4, y: 0 }, { x: 0, y: 3 });
    expect(out.cx).toBeCloseTo(2, 10);
    expect(out.cy).toBeCloseTo(1.5, 10);
    expect(out.r).toBeCloseTo(2.5, 10);
  });

  test('NaN 좌표는 false를 반환한다', () => {
    const out = { cx: 0, cy: 0, r: 0 };
    expect(fromThreePointsInto(out, { x: Number.NaN, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBe(false);
  });

  test('Infinity 좌표는 false를 반환한다', () => {
    const out = { cx: 0, cy: 0, r: 0 };
    expect(fromThreePointsInto(out, { x: Infinity, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBe(false);
  });
});

describe('circle.fromThreePoints — fromThreePointsInto의 allocating companion', () => {
  test('성공 시 새 plain circle object를 반환한다', () => {
    const result = fromThreePoints({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 });
    expect(result).not.toBeUndefined();
    if (result === undefined) throw new Error('fromThreePoints returned undefined');
    expect(result.cx).toBeCloseTo(2, 10);
    expect(result.cy).toBeCloseTo(1.5, 10);
    expect(result.r).toBeCloseTo(2.5, 10);
  });

  test('collinear 세 점은 undefined를 반환한다', () => {
    expect(fromThreePoints({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBeUndefined();
  });

  test('duplicate point는 undefined를 반환한다', () => {
    const p = { x: 1, y: 1 };
    expect(fromThreePoints(p, p, { x: 5, y: 6 })).toBeUndefined();
  });

  test('NaN 좌표는 undefined를 반환한다', () => {
    expect(fromThreePoints({ x: Number.NaN, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBeUndefined();
  });

  test('호출마다 새 object를 반환한다', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 4, y: 0 };
    const c = { x: 0, y: 3 };
    expect(fromThreePoints(a, b, c)).not.toBe(fromThreePoints(a, b, c));
  });
});

// ─── externalTangentsInto / externalTangents ─────────────────────────────────

/**
 * 두 원이 수평으로 배치되고 반지름이 같은 기본 케이스를 만든다.
 * 중심 (0,0) r=1, 중심 (5,0) r=1 → external tangent y = ±1
 */
function makeHorizontalPair() {
  return {
    a: { cx: 0, cy: 0, r: 1 },
    b: { cx: 5, cy: 0, r: 1 },
  };
}

describe('circle.externalTangentsInto — external tangent segment 계산', () => {
  test('분리된 두 원에서 2개 segment를 반환한다', () => {
    const { a, b } = makeHorizontalPair();
    const out: SegmentWritable[] = [];
    const result = externalTangentsInto(out, a, b);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
  });

  test('같은 반지름의 horizontal 두 원은 tangent endpoint y가 ±radius인 선분을 만든다', () => {
    const { a, b } = makeHorizontalPair();
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, a, b);
    const ys = out.map((s) => s.y1).sort((x, y) => x - y);
    expect(ys[0]).toBeCloseTo(-1, 10);
    expect(ys[1]).toBeCloseTo(1, 10);
    for (const seg of out) {
      expect(seg.y1).toBeCloseTo(seg.y2, 10);
    }
  });

  test('각 선분의 시작점과 끝점은 각각 첫 번째 원과 두 번째 원 위에 있다', () => {
    const { a, b } = makeHorizontalPair();
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, a, b);
    for (const seg of out) {
      // circle a 위: distance from (0,0) ≈ 1
      const distA = Math.sqrt(seg.x1 ** 2 + seg.y1 ** 2);
      expect(distA).toBeCloseTo(1, 8);
      // circle b 위: distance from (5,0) ≈ 1
      const distB = Math.sqrt((seg.x2 - 5) ** 2 + seg.y2 ** 2);
      expect(distB).toBeCloseTo(1, 8);
    }
  });

  test('한 원이 다른 원 내부에 있으면 빈 배열을 반환한다', () => {
    const big = { cx: 0, cy: 0, r: 5 };
    const small = { cx: 1, cy: 0, r: 1 };
    const out: SegmentWritable[] = [{ x1: 0, y1: 0, x2: 0, y2: 0 }];
    externalTangentsInto(out, big, small);
    expect(out).toHaveLength(0);
  });

  test('중심이 같으면 빈 배열을 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 0, cy: 0, r: 2 };
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(0);
  });

  test('empty circle이 있으면 빈 배열을 반환한다', () => {
    const empty = { cx: 0, cy: 0, r: 0 };
    const { b } = makeHorizontalPair();
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, empty, b);
    expect(out).toHaveLength(0);
  });

  test('내접 collapse case에서 중복 없이 1개 segment를 반환한다', () => {
    // r1=5, r2=3, dist=2 → |rDiff|=dist → beta=0 → 1개 tangent
    const c1 = { cx: 0, cy: 0, r: 5 };
    const c2 = { cx: 2, cy: 0, r: 3 };
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(1);
  });

  test('out.length = 0으로 기존 내용을 비운다', () => {
    const { a, b } = makeHorizontalPair();
    const out: SegmentWritable[] = [
      { x1: 999, y1: 999, x2: 999, y2: 999 },
      { x1: 999, y1: 999, x2: 999, y2: 999 },
      { x1: 999, y1: 999, x2: 999, y2: 999 },
    ];
    externalTangentsInto(out, a, b);
    expect(out).toHaveLength(2);
    const first = out[0];
    expect(first).not.toBeUndefined();
    if (first === undefined) throw new Error('externalTangentsInto returned no first segment');
    expect(first.x1).not.toBe(999);
  });

  test('NaN center는 빈 배열이 아닌 NaN 성분 segment를 반환한다 (pass-through)', () => {
    // NaN center는 distSq===0과 containment guard를 통과해 NaN angles를 계산한다.
    // Math.cos(NaN) = NaN → segment 좌표가 NaN이 된다.
    const c1 = { cx: Number.NaN, cy: 0, r: 1 };
    const { b } = makeHorizontalPair();
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, c1, b);
    expect(out.length).toBeGreaterThan(0);
    const first = out[0];
    expect(first).not.toBeUndefined();
    if (first === undefined) throw new Error('externalTangentsInto returned no first segment');
    expect(Number.isNaN(first.x1)).toBe(true);
  });

  test('Infinity radius는 containment guard를 통과해 빈 배열을 반환한다', () => {
    // |r1 - r2| = Infinity > any finite dist → 빈 배열
    const c1 = { cx: 0, cy: 0, r: Infinity };
    const { b } = makeHorizontalPair();
    const out: SegmentWritable[] = [];
    externalTangentsInto(out, c1, b);
    expect(out).toHaveLength(0);
  });
});

describe('circle.externalTangents — externalTangentsInto의 allocating companion', () => {
  test('Into와 동일한 결과를 새 배열로 반환한다', () => {
    const { a, b } = makeHorizontalPair();
    const ref: SegmentWritable[] = [];
    externalTangentsInto(ref, a, b);
    expect(externalTangents(a, b)).toEqual(ref);
  });

  test('새 배열을 반환한다', () => {
    const { a, b } = makeHorizontalPair();
    expect(externalTangents(a, b)).not.toBe(externalTangents(a, b));
  });

  test('tangent가 없으면 undefined가 아닌 빈 배열을 반환한다', () => {
    const empty = { cx: 0, cy: 0, r: 0 };
    const { b } = makeHorizontalPair();
    const result = externalTangents(empty, b);
    expect(result).toEqual([]);
    expect(result).not.toBeUndefined();
  });
});

// ─── internalTangentsInto / internalTangents ─────────────────────────────────

describe('circle.internalTangentsInto — internal tangent segment 계산', () => {
  test('분리된 두 원에서 2개 segment를 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const out: SegmentWritable[] = [];
    const result = internalTangentsInto(out, c1, c2);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
  });

  test('각 선분의 시작점과 끝점은 각각 첫 번째 원과 두 번째 원 위에 있다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, c1, c2);
    for (const seg of out) {
      const distA = Math.sqrt(seg.x1 ** 2 + seg.y1 ** 2);
      expect(distA).toBeCloseTo(1, 8);
      const distB = Math.sqrt((seg.x2 - 5) ** 2 + seg.y2 ** 2);
      expect(distB).toBeCloseTo(1, 8);
    }
  });

  test('겹치는 두 원은 빈 배열을 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 3 };
    const c2 = { cx: 2, cy: 0, r: 3 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(0);
  });

  test('중심이 같으면 빈 배열을 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 0, cy: 0, r: 2 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(0);
  });

  test('empty circle이 있으면 빈 배열을 반환한다', () => {
    const empty = { cx: 0, cy: 0, r: 0 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, empty, c2);
    expect(out).toHaveLength(0);
  });

  test('외접 collapse case에서 중복 없이 1개 segment를 반환한다', () => {
    // r1=2, r2=3, dist=5 → rSum=dist → beta=0 → 1개 tangent
    const c1 = { cx: 0, cy: 0, r: 2 };
    const c2 = { cx: 5, cy: 0, r: 3 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(1);
  });

  test('out.length = 0으로 기존 내용을 비운다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const out: SegmentWritable[] = [{ x1: 999, y1: 999, x2: 999, y2: 999 }];
    internalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(2);
    const first = out[0];
    expect(first).not.toBeUndefined();
    if (first === undefined) throw new Error('internalTangentsInto returned no first segment');
    expect(first.x1).not.toBe(999);
  });

  test('NaN center는 빈 배열이 아닌 NaN 성분 segment를 반환한다 (pass-through)', () => {
    // NaN center는 distSq===0과 overlap guard를 통과해 NaN angles를 계산한다.
    // Math.cos(NaN) = NaN → segment 좌표가 NaN이 된다.
    const c1 = { cx: Number.NaN, cy: 0, r: 1 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, c1, c2);
    expect(out.length).toBeGreaterThan(0);
    const first = out[0];
    expect(first).not.toBeUndefined();
    if (first === undefined) throw new Error('internalTangentsInto returned no first segment');
    expect(Number.isNaN(first.x1)).toBe(true);
  });

  test('Infinity radius는 overlap guard를 통과해 빈 배열을 반환한다', () => {
    // r1 + r2 = Infinity > any finite dist → 빈 배열
    const c1 = { cx: 0, cy: 0, r: Infinity };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const out: SegmentWritable[] = [];
    internalTangentsInto(out, c1, c2);
    expect(out).toHaveLength(0);
  });
});

describe('circle.internalTangents — internalTangentsInto의 allocating companion', () => {
  test('Into와 동일한 결과를 새 배열로 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    const ref: SegmentWritable[] = [];
    internalTangentsInto(ref, c1, c2);
    expect(internalTangents(c1, c2)).toEqual(ref);
  });

  test('새 배열을 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 1 };
    const c2 = { cx: 5, cy: 0, r: 1 };
    expect(internalTangents(c1, c2)).not.toBe(internalTangents(c1, c2));
  });

  test('tangent가 없으면 undefined가 아닌 빈 배열을 반환한다', () => {
    const c1 = { cx: 0, cy: 0, r: 3 };
    const c2 = { cx: 2, cy: 0, r: 3 };
    const result = internalTangents(c1, c2);
    expect(result).toEqual([]);
    expect(result).not.toBeUndefined();
  });
});
