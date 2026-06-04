/**
 * pose2 근사 비교(poseApproxEquals) 계약 테스트.
 *
 * position epsilon 통과/실패, angle epsilon 통과/실패, 2π wrap-around shortest difference,
 * tuple pose input, non-finite pose entry RangeError, invalid positionEpsilon/angleEpsilon
 * RangeError를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { poseApproxEquals } from '../../../src/pose2/pose-approx-equals';
import type { Pose2Like } from '../../../src/types';

const TWO_PI = 2 * Math.PI;

// ─── position 비교 ─────────────────────────────────────────────────────────

describe('poseApproxEquals - position 비교', () => {
  test('동일 pose는 true', () => {
    const pose: Pose2Like = { position: { x: 1, y: 2 }, angle: 0.5 };
    expect(poseApproxEquals(pose, { position: { x: 1, y: 2 }, angle: 0.5 })).toBe(true);
  });

  test('position 차이가 default epsilon 이내면 true', () => {
    expect(poseApproxEquals({ position: { x: 0, y: 0 }, angle: 0 }, { position: { x: 5e-10, y: 0 }, angle: 0 })).toBe(
      true
    );
  });

  test('position 차이가 epsilon을 넘으면 false', () => {
    expect(poseApproxEquals({ position: { x: 0, y: 0 }, angle: 0 }, { position: { x: 0.01, y: 0 }, angle: 0 })).toBe(
      false
    );
  });

  test('position은 hypot으로 비교한다(대각선 거리)', () => {
    // dx = dy = 0.03이면 hypot ≈ 0.0424 > 0.04. 축별 비교라면 통과하지만 hypot이라 실패한다.
    const a: Pose2Like = { position: { x: 0, y: 0 }, angle: 0 };
    const b: Pose2Like = { position: { x: 0.03, y: 0.03 }, angle: 0 };
    expect(poseApproxEquals(a, b, { positionEpsilon: 0.04 })).toBe(false);
    expect(poseApproxEquals(a, b, { positionEpsilon: 0.05 })).toBe(true);
  });

  test('positionEpsilon으로 허용 범위를 넓힐 수 있다', () => {
    expect(
      poseApproxEquals(
        { position: { x: 0, y: 0 }, angle: 0 },
        { position: { x: 0.5, y: 0 }, angle: 0 },
        { positionEpsilon: 1 }
      )
    ).toBe(true);
  });
});

// ─── angle 비교 ────────────────────────────────────────────────────────────

describe('poseApproxEquals - angle 비교', () => {
  test('angle 차이가 default epsilon 이내면 true', () => {
    expect(
      poseApproxEquals({ position: { x: 0, y: 0 }, angle: 1 }, { position: { x: 0, y: 0 }, angle: 1 + 5e-10 })
    ).toBe(true);
  });

  test('angle 차이가 epsilon을 넘으면 false', () => {
    expect(poseApproxEquals({ position: { x: 0, y: 0 }, angle: 1 }, { position: { x: 0, y: 0 }, angle: 1.01 })).toBe(
      false
    );
  });

  test('2π 차이는 shortest difference로 같다고 본다', () => {
    expect(
      poseApproxEquals({ position: { x: 0, y: 0 }, angle: 0.3 }, { position: { x: 0, y: 0 }, angle: 0.3 + TWO_PI })
    ).toBe(true);
  });

  test('π 경계 wrap-around: -π+ε와 π는 shortest로 가깝다', () => {
    expect(
      poseApproxEquals(
        { position: { x: 0, y: 0 }, angle: Math.PI - 1e-10 },
        { position: { x: 0, y: 0 }, angle: -Math.PI + 1e-10 },
        { angleEpsilon: 1e-6 }
      )
    ).toBe(true);
  });

  test('정확히 +π와 -π는 shortest difference 0으로 같다', () => {
    expect(
      poseApproxEquals({ position: { x: 0, y: 0 }, angle: Math.PI }, { position: { x: 0, y: 0 }, angle: -Math.PI })
    ).toBe(true);
  });

  test('π 경계 반대 방향(-π+ε vs π-ε)도 shortest로 가깝다', () => {
    expect(
      poseApproxEquals(
        { position: { x: 0, y: 0 }, angle: -Math.PI + 1e-10 },
        { position: { x: 0, y: 0 }, angle: Math.PI - 1e-10 },
        { angleEpsilon: 1e-6 }
      )
    ).toBe(true);
  });

  test('angleEpsilon으로 허용 범위를 넓힐 수 있다', () => {
    expect(
      poseApproxEquals(
        { position: { x: 0, y: 0 }, angle: 0 },
        { position: { x: 0, y: 0 }, angle: 0.1 },
        { angleEpsilon: 0.2 }
      )
    ).toBe(true);
  });
});

// ─── tuple input ───────────────────────────────────────────────────────────

describe('poseApproxEquals - tuple input', () => {
  test('tuple pose input과 object pose input이 같은 결과를 낸다', () => {
    const tuple: Pose2Like = [[1, 2], 0.5];
    const object: Pose2Like = { position: { x: 1, y: 2 }, angle: 0.5 };
    expect(poseApproxEquals(tuple, object)).toBe(true);
  });
});

// ─── 입력 검증 ─────────────────────────────────────────────────────────────

describe('poseApproxEquals - 입력 검증', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    expect(() =>
      poseApproxEquals({ position: { x: Number.NaN, y: 0 }, angle: 0 }, { position: { x: 0, y: 0 }, angle: 0 })
    ).toThrow(RangeError);
    expect(() =>
      poseApproxEquals(
        { position: { x: 0, y: 0 }, angle: 0 },
        { position: { x: 0, y: Number.POSITIVE_INFINITY }, angle: 0 }
      )
    ).toThrow(RangeError);
    expect(() =>
      poseApproxEquals(
        { position: { x: 0, y: 0 }, angle: Number.NEGATIVE_INFINITY },
        { position: { x: 0, y: 0 }, angle: 0 }
      )
    ).toThrow(RangeError);
  });

  test('invalid positionEpsilon이면 RangeError', () => {
    const a: Pose2Like = { position: { x: 0, y: 0 }, angle: 0 };
    expect(() => poseApproxEquals(a, a, { positionEpsilon: -1 })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { positionEpsilon: Number.NaN })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { positionEpsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('invalid angleEpsilon이면 RangeError', () => {
    const a: Pose2Like = { position: { x: 0, y: 0 }, angle: 0 };
    expect(() => poseApproxEquals(a, a, { angleEpsilon: -1 })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { angleEpsilon: Number.NaN })).toThrow(RangeError);
    expect(() => poseApproxEquals(a, a, { angleEpsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });
});
