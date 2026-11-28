/**
 * 회전 사각형과 점·회전 사각형 교차의 경계와 검증 정책을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { intersectsOrientedRectOrientedRect } from '../../../src/intersects/intersects-oriented-rect-oriented-rect';
import { intersectsOrientedRectPoint } from '../../../src/intersects/intersects-oriented-rect-point';
import type { OrientedRect } from '../../../src/types/flat-shapes.internal';

// center (0,0), size 4×2 (hw=2, hh=1), angle 0 → x in [-2,2], y in [-1,1]
const flat: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };

// ─── intersectsOrientedRectPoint ─────────────────────────────────────────────────

describe('intersectsOrientedRectPoint - angle 0', () => {
  test('center는 true', () => {
    expect(intersectsOrientedRectPoint(flat, { x: 0, y: 0 })).toBe(true);
  });

  test('내부점은 true', () => {
    expect(intersectsOrientedRectPoint(flat, { x: 1, y: 0.5 })).toBe(true);
  });

  test('edge 위 point는 closed boundary로 true', () => {
    expect(intersectsOrientedRectPoint(flat, { x: 2, y: 0 })).toBe(true);
    expect(intersectsOrientedRectPoint(flat, { x: 0, y: 1 })).toBe(true);
  });

  test('corner 위 point는 closed boundary로 true', () => {
    expect(intersectsOrientedRectPoint(flat, { x: 2, y: 1 })).toBe(true);
    expect(intersectsOrientedRectPoint(flat, { x: -2, y: -1 })).toBe(true);
  });

  test('separated point는 false', () => {
    expect(intersectsOrientedRectPoint(flat, { x: 3, y: 0 })).toBe(false);
    expect(intersectsOrientedRectPoint(flat, { x: 0, y: 1.5 })).toBe(false);
  });
});

describe('intersectsOrientedRectPoint - 회전', () => {
  // size 4×2 rect를 90도 회전 → world-y 방향으로 hw=2, world-x 방향으로 hh=1
  const rotated: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 };

  test('local-space 내부점은 true', () => {
    expect(intersectsOrientedRectPoint(rotated, { x: 0, y: 1.5 })).toBe(true);
    expect(intersectsOrientedRectPoint(rotated, { x: 0.9, y: 0 })).toBe(true);
  });

  test('local-space 외부점은 false', () => {
    expect(intersectsOrientedRectPoint(rotated, { x: 0, y: 2.5 })).toBe(false);
    expect(intersectsOrientedRectPoint(rotated, { x: 1.5, y: 0 })).toBe(false);
  });
});

describe('intersectsOrientedRectPoint - empty size', () => {
  test('width === 0은 false', () => {
    expect(intersectsOrientedRectPoint({ cx: 0, cy: 0, width: 0, height: 2, angle: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('height < 0은 false', () => {
    expect(intersectsOrientedRectPoint({ cx: 0, cy: 0, width: 4, height: -2, angle: 0 }, { x: 0, y: 0 })).toBe(false);
  });
});

describe('intersectsOrientedRectPoint - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() =>
      intersectsOrientedRectPoint({ cx: 0, cy: 0, width: NaN, height: 2, angle: 0 }, { x: 0, y: 0 })
    ).toThrow(RangeError);
  });

  test('height Infinity이면 RangeError', () => {
    expect(() =>
      intersectsOrientedRectPoint({ cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 }, { x: 0, y: 0 })
    ).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() =>
      intersectsOrientedRectPoint({ cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity }, { x: 0, y: 0 })
    ).toThrow(RangeError);
  });
});

describe('intersectsOrientedRectPoint - non-finite pass-through', () => {
  test('cx Infinity는 throw 없이 false', () => {
    expect(() =>
      intersectsOrientedRectPoint({ cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })
    ).not.toThrow();
    expect(intersectsOrientedRectPoint({ cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })).toBe(
      false
    );
  });

  test('cy NaN은 throw 없이 false', () => {
    expect(intersectsOrientedRectPoint({ cx: 0, cy: NaN, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('point.x Infinity는 throw 없이 false', () => {
    expect(intersectsOrientedRectPoint(flat, { x: Infinity, y: 0 })).toBe(false);
  });

  test('point.y NaN은 throw 없이 false', () => {
    expect(intersectsOrientedRectPoint(flat, { x: 0, y: NaN })).toBe(false);
  });
});

// ─── intersectsOrientedRectOrientedRect ──────────────────────────────────────────

describe('intersectsOrientedRectOrientedRect - axis-aligned', () => {
  test('겹치는 두 rect는 true', () => {
    const b: OrientedRect = { cx: 1, cy: 0, width: 4, height: 2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, b)).toBe(true);
  });

  test('edge touch(공유 edge x=2)는 closed boundary로 true', () => {
    const b: OrientedRect = { cx: 4, cy: 0, width: 4, height: 2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, b)).toBe(true);
  });

  test('corner touch(공유 corner (2,1))는 closed boundary로 true', () => {
    const b: OrientedRect = { cx: 4, cy: 2, width: 4, height: 2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, b)).toBe(true);
  });

  test('separated rect는 false', () => {
    const b: OrientedRect = { cx: 5, cy: 0, width: 4, height: 2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, b)).toBe(false);
  });

  test('containment는 true', () => {
    const inner: OrientedRect = { cx: 0, cy: 0, width: 1, height: 1, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, inner)).toBe(true);
  });
});

describe('intersectsOrientedRectOrientedRect - 회전', () => {
  test('Math.PI / 4 회전 rect끼리 겹치면 true', () => {
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    const b: OrientedRect = { cx: 1, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    expect(intersectsOrientedRectOrientedRect(a, b)).toBe(true);
  });

  test('Math.PI / 4 회전 rect와 separated rect는 false', () => {
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    const b: OrientedRect = { cx: 4, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    expect(intersectsOrientedRectOrientedRect(a, b)).toBe(false);
  });

  test('world-AABB는 겹치지만 회전 axis로 분리되면 false (naive AABB 구현 차단)', () => {
    // a: axis-aligned 2×2 @(0,0). b: 45° 2×2 @(2,2). world-AABB는 [0.586,1]에서 겹치나
    // b local axis L=(1/√2,1/√2)에서 centerProj 2.828 > extentA+extentB 2.414 → SAT 분리.
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: 0 };
    const b: OrientedRect = { cx: 2, cy: 2, width: 2, height: 2, angle: Math.PI / 4 };
    expect(intersectsOrientedRectOrientedRect(a, b)).toBe(false);
  });

  test('world-AABB가 겹치고 회전 axis로도 겹치면 true', () => {
    const a: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: 0 };
    const b: OrientedRect = { cx: 1.5, cy: 1.5, width: 2, height: 2, angle: Math.PI / 4 };
    expect(intersectsOrientedRectOrientedRect(a, b)).toBe(true);
  });
});

describe('intersectsOrientedRectOrientedRect - empty size', () => {
  test('a.width === 0은 false', () => {
    const empty: OrientedRect = { cx: 0, cy: 0, width: 0, height: 2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(empty, flat)).toBe(false);
  });

  test('b.height < 0은 false', () => {
    const empty: OrientedRect = { cx: 0, cy: 0, width: 4, height: -2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, empty)).toBe(false);
  });
});

describe('intersectsOrientedRectOrientedRect - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => intersectsOrientedRectOrientedRect({ cx: 0, cy: 0, width: NaN, height: 2, angle: 0 }, flat)).toThrow(
      RangeError
    );
  });

  test('height Infinity이면 RangeError', () => {
    expect(() =>
      intersectsOrientedRectOrientedRect(flat, { cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 })
    ).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() =>
      intersectsOrientedRectOrientedRect({ cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity }, flat)
    ).toThrow(RangeError);
  });
});

describe('intersectsOrientedRectOrientedRect - center non-finite pass-through', () => {
  test('cx Infinity는 throw 없이 false', () => {
    const inf: OrientedRect = { cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 };
    expect(() => intersectsOrientedRectOrientedRect(inf, flat)).not.toThrow();
    expect(intersectsOrientedRectOrientedRect(inf, flat)).toBe(false);
  });

  test('cy NaN은 throw 없이 false', () => {
    const nan: OrientedRect = { cx: 0, cy: NaN, width: 4, height: 2, angle: 0 };
    expect(intersectsOrientedRectOrientedRect(flat, nan)).toBe(false);
  });
});
