/**
 * segment scalar query — slope, perpSlope, signedDistanceToSupportingLine, sideOfSupportingLine
 */
import { describe, expect, test } from 'vitest';
import { perpSlope } from '../../../src/segment/perp-slope';
import { sideOfSupportingLine } from '../../../src/segment/side-of-supporting-line';
import { signedDistanceToSupportingLine } from '../../../src/segment/signed-distance-to-supporting-line';
import { slope } from '../../../src/segment/slope';

// --- slope ---

describe('segment slope', () => {
  test('horizontal segment의 slope는 0이다', () => {
    expect(slope({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } })).toBe(0);
  });

  test('vertical segment의 slope는 Infinity이다 (dy > 0)', () => {
    expect(slope({ a: { x: 2, y: 0 }, b: { x: 2, y: 3 } })).toBe(Infinity);
  });

  test('vertical segment의 slope는 -Infinity이다 (dy < 0)', () => {
    expect(slope({ a: { x: 2, y: 3 }, b: { x: 2, y: 0 } })).toBe(-Infinity);
  });

  test('zero-length segment의 slope는 NaN이다', () => {
    expect(Number.isNaN(slope({ a: { x: 3, y: 3 }, b: { x: 3, y: 3 } }))).toBe(true);
  });

  test('diagonal 3-4 segment의 slope는 dy/dx이다', () => {
    // dy = 4, dx = 3 → 4/3
    expect(slope({ a: { x: 0, y: 0 }, b: { x: 3, y: 4 } })).toBeCloseTo(4 / 3, 10);
  });

  test('reversed diagonal segment의 slope는 같은 기울기이다', () => {
    // a=(3,4), b=(0,0) → dy=-4, dx=-3 → slope = 4/3
    expect(slope({ a: { x: 3, y: 4 }, b: { x: 0, y: 0 } })).toBeCloseTo(4 / 3, 10);
  });

  test('음수 기울기 segment를 올바르게 반환한다', () => {
    // dy = -2, dx = 4 → -0.5
    expect(slope({ a: { x: 0, y: 2 }, b: { x: 4, y: 0 } })).toBeCloseTo(-0.5, 10);
  });

  test('tuple endpoint segment를 지원한다', () => {
    expect(
      slope([
        [0, 0],
        [3, 4],
      ])
    ).toBeCloseTo(4 / 3, 10);
  });

  describe('non-finite 입력 전파', () => {
    test('a.x = NaN이면 NaN을 반환한다', () => {
      expect(Number.isNaN(slope({ a: { x: NaN, y: 0 }, b: { x: 3, y: 4 } }))).toBe(true);
    });

    test('b.y = Infinity이면 Infinity를 반환한다', () => {
      // dy = Infinity - 0 = Infinity, dx = 3 → Infinity / 3 = Infinity
      expect(slope({ a: { x: 0, y: 0 }, b: { x: 3, y: Infinity } })).toBe(Infinity);
    });

    test('a.y = -Infinity이면 Infinity를 반환한다', () => {
      // dy = 0 - (-Infinity) = Infinity, dx = 3 → Infinity
      expect(slope({ a: { x: 0, y: -Infinity }, b: { x: 3, y: 0 } })).toBe(Infinity);
    });
  });
});

// --- perpSlope ---

describe('segment perpSlope', () => {
  test('horizontal segment의 perpSlope는 Infinity이다', () => {
    expect(perpSlope({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } })).toBe(Infinity);
  });

  test('vertical segment의 perpSlope는 0이다', () => {
    expect(perpSlope({ a: { x: 2, y: 0 }, b: { x: 2, y: 3 } })).toBe(0);
  });

  test('vertical segment (dy < 0)의 perpSlope는 0이다 (음수 dy에서도 -dx/dy=0)', () => {
    // dx=0, dy=-3 → -0 / -3 = 0
    expect(perpSlope({ a: { x: 2, y: 3 }, b: { x: 2, y: 0 } })).toBe(0);
  });

  test('zero-length segment의 perpSlope는 NaN이다', () => {
    expect(Number.isNaN(perpSlope({ a: { x: 3, y: 3 }, b: { x: 3, y: 3 } }))).toBe(true);
  });

  test('diagonal 3-4 segment의 perpSlope는 -dx/dy이다', () => {
    // dx=3, dy=4 → -3/4
    expect(perpSlope({ a: { x: 0, y: 0 }, b: { x: 3, y: 4 } })).toBeCloseTo(-3 / 4, 10);
  });

  test('reversed diagonal segment의 perpSlope는 같다', () => {
    // dx=-3, dy=-4 → -(-3)/(-4) = 3/-4 = -3/4
    expect(perpSlope({ a: { x: 3, y: 4 }, b: { x: 0, y: 0 } })).toBeCloseTo(-3 / 4, 10);
  });

  test('tuple endpoint segment를 지원한다', () => {
    expect(
      perpSlope([
        [0, 0],
        [3, 4],
      ])
    ).toBeCloseTo(-3 / 4, 10);
  });

  describe('non-finite 입력 전파', () => {
    test('a.x = NaN이면 NaN을 반환한다', () => {
      expect(Number.isNaN(perpSlope({ a: { x: NaN, y: 0 }, b: { x: 3, y: 4 } }))).toBe(true);
    });

    test('b.x = Infinity이면 -Infinity/dy를 반환한다', () => {
      // dx = Infinity - 0 = Infinity, dy = 4 → -Infinity / 4 = -Infinity
      expect(perpSlope({ a: { x: 0, y: 0 }, b: { x: Infinity, y: 4 } })).toBe(-Infinity);
    });

    test('b.y = -Infinity이면 0을 반환한다', () => {
      // dx=3, dy=-Infinity → -3 / (-Infinity) = 0 (IEEE 754)
      expect(perpSlope({ a: { x: 0, y: 0 }, b: { x: 3, y: -Infinity } })).toBe(0);
    });

    test('b.x = NaN이면 NaN을 반환한다 (dx=NaN, dy=0 — horizontal 분기가 NaN을 가로채지 않아야 한다)', () => {
      expect(Number.isNaN(perpSlope({ a: { x: 0, y: 0 }, b: { x: NaN, y: 0 } }))).toBe(true);
    });
  });
});

// --- signedDistanceToSupportingLine ---

describe('segment signedDistanceToSupportingLine', () => {
  // supporting line: line through a=(0,0), b=(4,0) (horizontal)
  // direction d=(4,0), |d|=4
  // signed dist = cross(d, p-a) / |d| = (dx*(py-ay) - dy*(px-ax)) / |d|
  // cross((4,0), (px,py)) = 4*py - 0*px = 4*py
  // signed = 4*py / 4 = py
  test('supporting line 위 좌측 point는 양수 distance를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // point=(2,3): left side → positive
    expect(signedDistanceToSupportingLine(seg, { x: 2, y: 3 })).toBeCloseTo(3, 10);
  });

  test('supporting line 위 우측 point는 음수 distance를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // point=(2,-3): right side → negative
    expect(signedDistanceToSupportingLine(seg, { x: 2, y: -3 })).toBeCloseTo(-3, 10);
  });

  test('supporting line 위 point는 0을 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // point=(2,0): on line
    expect(signedDistanceToSupportingLine(seg, { x: 2, y: 0 })).toBe(0);
  });

  test('supporting line 연장선 위 point도 올바른 signed distance를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // point=(6,3): outside segment extent, but left side of supporting line
    expect(signedDistanceToSupportingLine(seg, { x: 6, y: 3 })).toBeCloseTo(3, 10);
  });

  test('diagonal segment supporting line에서 signed distance를 반환한다', () => {
    // seg a=(0,0), b=(3,4), d=(3,4), |d|=5
    // cross(d, p-a) = 3*(py-0) - 4*(px-0) = 3*py - 4*px
    // point=(4,3): 3*3 - 4*4 = 9-16 = -7 → signed = -7/5 = -1.4
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    expect(signedDistanceToSupportingLine(seg, { x: 4, y: 3 })).toBeCloseTo(-1.4, 10);
  });

  test('zero-length segment는 0을 반환한다', () => {
    const seg = { a: { x: 3, y: 3 }, b: { x: 3, y: 3 } };
    expect(signedDistanceToSupportingLine(seg, { x: 10, y: 20 })).toBe(0);
  });

  test('tuple endpoint segment를 지원한다', () => {
    const seg = [
      [0, 0],
      [4, 0],
    ] as [[number, number], [number, number]];
    expect(signedDistanceToSupportingLine(seg, [2, 3])).toBeCloseTo(3, 10);
  });

  test('tuple point input을 지원한다', () => {
    expect(signedDistanceToSupportingLine({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, [2, 3])).toBeCloseTo(3, 10);
  });

  describe('non-finite 입력 전파', () => {
    test('point.x = NaN이면 NaN을 반환한다', () => {
      const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
      expect(Number.isNaN(signedDistanceToSupportingLine(seg, { x: NaN, y: 3 }))).toBe(true);
    });

    test('point.y = NaN이면 NaN을 반환한다', () => {
      const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
      expect(Number.isNaN(signedDistanceToSupportingLine(seg, { x: 2, y: NaN }))).toBe(true);
    });

    test('point.x = Infinity이면 -Infinity를 반환한다', () => {
      // cross = 3*py - 4*px; point=(Inf,0): 3*0 - 4*Inf = -Inf → -Inf/5 = -Inf
      const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
      expect(signedDistanceToSupportingLine(seg, { x: Infinity, y: 0 })).toBe(-Infinity);
    });

    test('point.y = -Infinity이면 -Infinity를 반환한다', () => {
      // horizontal seg: signed = py → -Infinity
      const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
      expect(signedDistanceToSupportingLine(seg, { x: 2, y: -Infinity })).toBe(-Infinity);
    });

    test('a.x = NaN이면 NaN을 반환한다', () => {
      const seg = { a: { x: NaN, y: 0 }, b: { x: 4, y: 0 } };
      expect(Number.isNaN(signedDistanceToSupportingLine(seg, { x: 2, y: 3 }))).toBe(true);
    });

    test('b.y = Infinity인 vertical segment는 signed distance를 반환한다', () => {
      // d = (0, Inf), |d| = Inf; cross(d, p-a) = 0*(py-0) - Inf*(px-0) = -Inf*px
      // px=2: cross = -Inf, dist = -Inf/Inf = NaN (Inf/Inf = NaN)
      const seg = { a: { x: 0, y: 0 }, b: { x: 0, y: Infinity } };
      // -Infinity*2 / Infinity = NaN
      expect(Number.isNaN(signedDistanceToSupportingLine(seg, { x: 2, y: 3 }))).toBe(true);
    });
  });
});

// --- sideOfSupportingLine ---

describe('segment sideOfSupportingLine', () => {
  const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };

  test('좌측 point는 1을 반환한다', () => {
    // signed dist = 3 > epsilon → 1
    expect(sideOfSupportingLine(seg, { x: 2, y: 3 })).toBe(1);
  });

  test('우측 point는 -1을 반환한다', () => {
    // signed dist = -3 < -epsilon → -1
    expect(sideOfSupportingLine(seg, { x: 2, y: -3 })).toBe(-1);
  });

  test('선 위 point는 0을 반환한다', () => {
    // signed dist = 0, |0| <= epsilon → 0
    expect(sideOfSupportingLine(seg, { x: 2, y: 0 })).toBe(0);
  });

  test('signed distance가 epsilon 이하면 0을 반환한다 (경계 테스트)', () => {
    // signed dist = 5e-10 (< 1e-9) → 0
    expect(sideOfSupportingLine(seg, { x: 2, y: 5e-10 })).toBe(0);
  });

  test('signed distance가 epsilon 초과면 1을 반환한다 (경계 테스트)', () => {
    // signed dist = 2e-9 (> 1e-9) → 1
    expect(sideOfSupportingLine(seg, { x: 2, y: 2e-9 })).toBe(1);
  });

  test('명시 epsilon을 사용한 경계 판별을 지원한다', () => {
    // signed dist = 0.5 with epsilon=1 → |0.5| <= 1 → 0
    expect(sideOfSupportingLine(seg, { x: 2, y: 0.5 }, 1)).toBe(0);
    // signed dist = 1.5 with epsilon=1 → 1.5 > 1 → 1
    expect(sideOfSupportingLine(seg, { x: 2, y: 1.5 }, 1)).toBe(1);
    // signed dist = -1.5 with epsilon=1 → -1.5 < -1 → -1
    expect(sideOfSupportingLine(seg, { x: 2, y: -1.5 }, 1)).toBe(-1);
  });

  test('zero-length segment는 0을 반환한다', () => {
    const zeroSeg = { a: { x: 3, y: 3 }, b: { x: 3, y: 3 } };
    expect(sideOfSupportingLine(zeroSeg, { x: 10, y: 20 })).toBe(0);
  });

  test('NaN input은 0을 반환한다 (literal union guard)', () => {
    // signedDistance → NaN → 0
    expect(sideOfSupportingLine(seg, { x: NaN, y: 3 })).toBe(0);
    expect(sideOfSupportingLine(seg, { x: 2, y: NaN })).toBe(0);
  });

  test('a.x = NaN이면 0을 반환한다 (literal union guard)', () => {
    const nanSeg = { a: { x: NaN, y: 0 }, b: { x: 4, y: 0 } };
    expect(sideOfSupportingLine(nanSeg, { x: 2, y: 3 })).toBe(0);
  });

  test('tuple endpoint segment를 지원한다', () => {
    expect(
      sideOfSupportingLine(
        [
          [0, 0],
          [4, 0],
        ],
        { x: 2, y: 3 }
      )
    ).toBe(1);
  });

  test('tuple point input을 지원한다', () => {
    expect(sideOfSupportingLine(seg, [2, 3])).toBe(1);
    expect(sideOfSupportingLine(seg, [2, -3])).toBe(-1);
  });

  describe('non-finite 입력 전파 — literal union guard', () => {
    test('point.y = Infinity이면 1을 반환한다 (Inf > epsilon)', () => {
      expect(sideOfSupportingLine(seg, { x: 2, y: Infinity })).toBe(1);
    });

    test('point.y = -Infinity이면 -1을 반환한다 (-Inf < -epsilon)', () => {
      expect(sideOfSupportingLine(seg, { x: 2, y: -Infinity })).toBe(-1);
    });
  });
});
