/**
 * pose2 근사 비교(poseApproxEquals) 계약 테스트.
 *
 * 위치와 각도를 따로 비교하는 허용 오차, 2π 경계, 유한하지 않은 입력과 잘못된 허용 오차의 거부를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { poseApproxEquals } from '../../../src/pose2/pose-approx-equals';
import type { Pose2 } from '../../../src/types/flat-shapes.internal';

const TWO_PI = 2 * Math.PI;

// ─── position 비교 ─────────────────────────────────────────────────────────

describe('poseApproxEquals - position 비교', () => {
  test('동일 pose는 true', () => {
    const pose: Pose2 = { px: 1, py: 2, angle: 0.5 };
    expect(poseApproxEquals(pose, { px: 1, py: 2, angle: 0.5 })).toBe(true);
  });

  test('position 차이가 default epsilon 이내면 true', () => {
    expect(poseApproxEquals({ px: 0, py: 0, angle: 0 }, { px: 5e-10, py: 0, angle: 0 })).toBe(true);
  });

  test('position 차이가 epsilon을 넘으면 false', () => {
    expect(poseApproxEquals({ px: 0, py: 0, angle: 0 }, { px: 0.01, py: 0, angle: 0 })).toBe(false);
  });

  test('position은 hypot으로 비교한다(대각선 거리)', () => {
    // dx = dy = 0.03이면 hypot ≈ 0.0424 > 0.04. 축별 비교라면 통과하지만 hypot이라 실패한다.
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 0.03, py: 0.03, angle: 0 };
    expect(poseApproxEquals(a, b, { positionEpsilon: 0.04, angleEpsilon: 1e-9 })).toBe(false);
    expect(poseApproxEquals(a, b, { positionEpsilon: 0.05, angleEpsilon: 1e-9 })).toBe(true);
  });

  test('positionEpsilon으로 허용 범위를 넓힐 수 있다', () => {
    expect(
      poseApproxEquals(
        { px: 0, py: 0, angle: 0 },
        { px: 0.5, py: 0, angle: 0 },
        { positionEpsilon: 1, angleEpsilon: 1e-9 }
      )
    ).toBe(true);
  });
});

// ─── angle 비교 ────────────────────────────────────────────────────────────

describe('poseApproxEquals - angle 비교', () => {
  test('angle 차이가 default epsilon 이내면 true', () => {
    expect(poseApproxEquals({ px: 0, py: 0, angle: 1 }, { px: 0, py: 0, angle: 1 + 5e-10 })).toBe(true);
  });

  test('angle 차이가 epsilon을 넘으면 false', () => {
    expect(poseApproxEquals({ px: 0, py: 0, angle: 1 }, { px: 0, py: 0, angle: 1.01 })).toBe(false);
  });

  test('2π 차이는 shortest difference로 같다고 본다', () => {
    expect(poseApproxEquals({ px: 0, py: 0, angle: 0.3 }, { px: 0, py: 0, angle: 0.3 + TWO_PI })).toBe(true);
  });

  test('π 경계 wrap-around: -π+ε와 π는 shortest로 가깝다', () => {
    expect(
      poseApproxEquals(
        { px: 0, py: 0, angle: Math.PI - 1e-10 },
        { px: 0, py: 0, angle: -Math.PI + 1e-10 },
        { positionEpsilon: 1e-9, angleEpsilon: 1e-6 }
      )
    ).toBe(true);
  });

  test('정확히 +π와 -π는 shortest difference 0으로 같다', () => {
    expect(poseApproxEquals({ px: 0, py: 0, angle: Math.PI }, { px: 0, py: 0, angle: -Math.PI })).toBe(true);
  });

  test('π 경계 반대 방향(-π+ε vs π-ε)도 shortest로 가깝다', () => {
    expect(
      poseApproxEquals(
        { px: 0, py: 0, angle: -Math.PI + 1e-10 },
        { px: 0, py: 0, angle: Math.PI - 1e-10 },
        { positionEpsilon: 1e-9, angleEpsilon: 1e-6 }
      )
    ).toBe(true);
  });

  test('angleEpsilon으로 허용 범위를 넓힐 수 있다', () => {
    expect(
      poseApproxEquals(
        { px: 0, py: 0, angle: 0 },
        { px: 0, py: 0, angle: 0.1 },
        { positionEpsilon: 1e-9, angleEpsilon: 0.2 }
      )
    ).toBe(true);
  });
});

// ─── 입력 검증 ─────────────────────────────────────────────────────────────

describe('poseApproxEquals - 입력 검증', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    expect(() => poseApproxEquals({ px: Number.NaN, py: 0, angle: 0 }, { px: 0, py: 0, angle: 0 })).toThrow(RangeError);
    expect(() =>
      poseApproxEquals({ px: 0, py: 0, angle: 0 }, { px: 0, py: Number.POSITIVE_INFINITY, angle: 0 })
    ).toThrow(RangeError);
    expect(() =>
      poseApproxEquals({ px: 0, py: 0, angle: Number.NEGATIVE_INFINITY }, { px: 0, py: 0, angle: 0 })
    ).toThrow(RangeError);
  });

  test('invalid positionEpsilon이면 RangeError', () => {
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    expect(() => poseApproxEquals(a, a, { positionEpsilon: -1, angleEpsilon: 1e-9 })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { positionEpsilon: Number.NaN, angleEpsilon: 1e-9 })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { positionEpsilon: Number.POSITIVE_INFINITY, angleEpsilon: 1e-9 })).toThrow(
      RangeError
    );
  });

  test('invalid angleEpsilon이면 RangeError', () => {
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    expect(() => poseApproxEquals(a, a, { positionEpsilon: 1e-9, angleEpsilon: -1 })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { positionEpsilon: 1e-9, angleEpsilon: Number.NaN })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { positionEpsilon: 1e-9, angleEpsilon: Number.POSITIVE_INFINITY })).toThrow(
      RangeError
    );
  });
});
