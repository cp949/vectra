/** 회전 사각형 두 개의 겹침과 접촉을 검증한다. */
import { describe, expect, test } from 'vitest';
import { overlap } from '../../../src/oriented-rect/overlap';
import type { OrientedRect } from '../../../src/types/flat-shapes.internal';

// center (0,0), size 4×2 (hw=2, hh=1), angle 0 → x in [-2,2], y in [-1,1]
const base: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };

describe('overlap - axis-aligned', () => {
  test('겹치는 두 rect는 true', () => {
    const b: OrientedRect = { cx: 1, cy: 0, width: 4, height: 2, angle: 0 };
    expect(overlap(base, b)).toBe(true);
  });

  test('edge touch(공유 edge x=2)는 closed boundary로 true', () => {
    const b: OrientedRect = { cx: 4, cy: 0, width: 4, height: 2, angle: 0 };
    expect(overlap(base, b)).toBe(true);
  });

  test('corner touch(공유 corner (2,1))는 closed boundary로 true', () => {
    // b는 x[2,6], y[1,3] → corner (2,1)이 base corner (2,1)과 일치
    const b: OrientedRect = { cx: 4, cy: 2, width: 4, height: 2, angle: 0 };
    expect(overlap(base, b)).toBe(true);
  });

  test('separated rect는 false', () => {
    const b: OrientedRect = { cx: 5, cy: 0, width: 4, height: 2, angle: 0 };
    expect(overlap(base, b)).toBe(false);
  });
});

describe('overlap - containment', () => {
  test('한 rect가 다른 rect를 완전히 포함하면 true', () => {
    const inner: OrientedRect = { cx: 0, cy: 0, width: 1, height: 1, angle: 0 };
    expect(overlap(base, inner)).toBe(true);
    expect(overlap(inner, base)).toBe(true);
  });
});

describe('overlap - 회전', () => {
  test('Math.PI / 4 회전 rect끼리 겹치면 true', () => {
    // 두 2×2 diamond. vertices at (±√2,0),(0,±√2). center 거리 1이면 겹친다.
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    const b: OrientedRect = { cx: 1, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    expect(overlap(a, b)).toBe(true);
  });

  test('Math.PI / 4 회전 rect와 separated rect는 false', () => {
    // a diamond max x = √2 ≈ 1.414, b diamond min x = 4 - √2 ≈ 2.586 → 분리
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    const b: OrientedRect = { cx: 4, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    expect(overlap(a, b)).toBe(false);
  });

  test('축이 다른 두 rect의 겹침을 SAT로 판정한다', () => {
    // axis-aligned a vs 45도 회전 b. b diamond reach 1.414 → a 우변 x=2와 분리
    const a: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };
    const overlapping: OrientedRect = { cx: 2.5, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    // b min x = 2.5 - √2 ≈ 1.086 < 2 → 겹침
    expect(overlap(a, overlapping)).toBe(true);
    const separated: OrientedRect = { cx: 3.5, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    // b min x = 3.5 - √2 ≈ 2.086 > 2 → 분리
    expect(overlap(a, separated)).toBe(false);
  });

  test('world-AABB는 겹치지만 회전 axis로 분리되면 false (naive AABB 구현 차단)', () => {
    // a: axis-aligned 2×2 @(0,0) → x,y ∈ [-1,1]
    // b: 45° 2×2 @(2,2) → diamond reach √2, world-AABB x,y ∈ [0.586,3.414]
    // world-AABB는 [0.586,1]에서 겹치지만 b 대각 edge(x+y=2.586)가 a corner (1,1)을 지나지 않아 분리.
    // b local axis L=(1/√2,1/√2)에서 centerProj 2.828 > extentA+extentB 2.414 → SAT 분리.
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: 0 };
    const b: OrientedRect = { cx: 2, cy: 2, width: 2, height: 2, angle: Math.PI / 4 };
    expect(overlap(a, b)).toBe(false);
  });

  test('world-AABB가 겹치고 회전 axis로도 겹치면 true', () => {
    // 위 케이스에서 b를 corner 쪽으로 당겨 실제로 겹치게 한다.
    // b @(1.5,1.5): b 대각 edge proj C·L-1 = 1.5√2-1 ≈ 1.121 < a corner proj √2 ≈ 1.414 → 겹침.
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: 0 };
    const b: OrientedRect = { cx: 1.5, cy: 1.5, width: 2, height: 2, angle: Math.PI / 4 };
    expect(overlap(a, b)).toBe(true);
  });
});

describe('overlap - empty size', () => {
  test('a.width === 0은 false', () => {
    const empty: OrientedRect = { cx: 0, cy: 0, width: 0, height: 2, angle: 0 };
    expect(overlap(empty, base)).toBe(false);
  });

  test('b.height < 0은 false', () => {
    const empty: OrientedRect = { cx: 0, cy: 0, width: 4, height: -2, angle: 0 };
    expect(overlap(base, empty)).toBe(false);
  });
});

describe('overlap - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => overlap({ cx: 0, cy: 0, width: NaN, height: 2, angle: 0 }, base)).toThrow(RangeError);
  });

  test('height Infinity이면 RangeError', () => {
    expect(() => overlap(base, { cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => overlap({ cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity }, base)).toThrow(RangeError);
  });
});

describe('overlap - center non-finite pass-through', () => {
  test('cx Infinity는 throw 없이 false', () => {
    const inf: OrientedRect = { cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 };
    expect(() => overlap(inf, base)).not.toThrow();
    expect(overlap(inf, base)).toBe(false);
  });

  test('cx -Infinity는 throw 없이 false', () => {
    const inf: OrientedRect = { cx: -Infinity, cy: 0, width: 4, height: 2, angle: 0 };
    expect(overlap(inf, base)).toBe(false);
  });

  test('cy NaN은 throw 없이 false', () => {
    const nan: OrientedRect = { cx: 0, cy: NaN, width: 4, height: 2, angle: 0 };
    expect(overlap(base, nan)).toBe(false);
  });
});
