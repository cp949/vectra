/**
 * pose2 결합 거리(poseDistance) 계약 테스트.
 *
 * 이동 거리와 가중 회전 거리의 결합, ±π 경계, 잘못된 입력과 계산 결과가 유한하지 않을 때의 실패를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { poseDistance } from '../../../src/pose2/pose-distance';
import type { Pose2 } from '../../../src/types/flat-shapes.internal';

const TWO_PI = 2 * Math.PI;

// ─── 기본 거리 ─────────────────────────────────────────────────────────────

describe('poseDistance - 기본 거리', () => {
  test('동일 pose는 0', () => {
    const pose: Pose2 = { px: 1, py: 2, angle: 0.5 };
    expect(poseDistance(pose, { px: 1, py: 2, angle: 0.5 })).toBe(0);
  });

  test('translation-only 차이는 Euclidean distance', () => {
    // dx = 3, dy = 4, angle 동일 → hypot(3, 4) = 5
    const a: Pose2 = { px: 0, py: 0, angle: 0.7 };
    const b: Pose2 = { px: 3, py: 4, angle: 0.7 };
    expect(poseDistance(a, b)).toBe(5);
  });

  test('angle-only 차이는 angularDistance * angularWeight(default 1)', () => {
    const a: Pose2 = { px: 2, py: 2, angle: 0 };
    const b: Pose2 = { px: 2, py: 2, angle: 0.5 };
    expect(poseDistance(a, b)).toBeCloseTo(0.5, 12);
  });

  test('translation + angle 결합은 hypot(positionDistance, weightedAngularDistance)', () => {
    // positionDistance = hypot(3, 4) = 5, angularDistance = 0.5, weight 기본 1
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 3, py: 4, angle: 0.5 };
    expect(poseDistance(a, b)).toBeCloseTo(Math.hypot(5, 0.5), 12);
  });
});

// ─── angularWeight ─────────────────────────────────────────────────────────

describe('poseDistance - angularWeight', () => {
  test('angularWeight: 0이면 angle 차이를 무시한다(translation-only)', () => {
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 3, py: 4, angle: 2 };
    expect(poseDistance(a, b, { angularWeight: 0 })).toBe(5);
  });

  test('angularWeight로 angle contribution을 scale한다', () => {
    // angle 차이 0.5, weight 4 → weightedAngular = 2.0
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 0, py: 0, angle: 0.5 };
    expect(poseDistance(a, b, { angularWeight: 4 })).toBeCloseTo(2, 12);
  });

  test('fractional angularWeight(0 < w < 1)도 angle contribution을 scale한다', () => {
    // angle 차이 0.5, weight 0.5 → weightedAngular = 0.25
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 0, py: 0, angle: 0.5 };
    expect(poseDistance(a, b, { angularWeight: 0.5 })).toBeCloseTo(0.25, 12);
  });

  test('translation + weighted angle 결합', () => {
    // positionDistance = 6, angularDistance = 0.5, weight 2 → weightedAngular = 1.0
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 6, py: 0, angle: 0.5 };
    expect(poseDistance(a, b, { angularWeight: 2 })).toBeCloseTo(Math.hypot(6, 1), 12);
  });
});

// ─── shortest angle ────────────────────────────────────────────────────────

describe('poseDistance - shortest angle', () => {
  test('2π wrap-around는 shortest difference로 0에 가깝다', () => {
    const a: Pose2 = { px: 0, py: 0, angle: 0.3 };
    const b: Pose2 = { px: 0, py: 0, angle: 0.3 + TWO_PI };
    expect(poseDistance(a, b)).toBeCloseTo(0, 9);
  });

  test('정확히 +π와 -π는 angle distance 0에 가깝다', () => {
    // 2π wrap. float sin(2π) ≈ 2.4e-16이라 정확히 0은 아니다. normalize하지 않는다.
    const a: Pose2 = { px: 0, py: 0, angle: Math.PI };
    const b: Pose2 = { px: 0, py: 0, angle: -Math.PI };
    expect(poseDistance(a, b)).toBeCloseTo(0, 12);
  });

  test('angle 차이가 π를 넘으면 shortest(2π - diff)로 접는다', () => {
    // diff = 1.5π → shortest = 0.5π
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 0, py: 0, angle: 1.5 * Math.PI };
    expect(poseDistance(a, b)).toBeCloseTo(Math.PI / 2, 12);
  });
});

// ─── 입력 검증 ─────────────────────────────────────────────────────────────

describe('poseDistance - 입력 검증', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    const ok: Pose2 = { px: 0, py: 0, angle: 0 };
    expect(() => poseDistance({ px: Number.NaN, py: 0, angle: 0 }, ok)).toThrow(RangeError);
    expect(() => poseDistance(ok, { px: 0, py: Number.POSITIVE_INFINITY, angle: 0 })).toThrow(RangeError);
    expect(() => poseDistance({ px: 0, py: 0, angle: Number.NEGATIVE_INFINITY }, ok)).toThrow(RangeError);
  });

  test('angularWeight가 음수/non-finite이면 RangeError', () => {
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 1, py: 0, angle: 0.5 };
    expect(() => poseDistance(a, b, { angularWeight: -1 })).toThrow(RangeError);
    expect(() => poseDistance(a, b, { angularWeight: Number.NaN })).toThrow(RangeError);
    expect(() => poseDistance(a, b, { angularWeight: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => poseDistance(a, b, { angularWeight: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
  });

  test('angularWeight가 빠진 옵션 객체는 기본값을 쓰지 않고 RangeError', () => {
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 1, py: 0, angle: 0.5 };
    // @ts-expect-error angularWeight는 필수 필드다
    expect(() => poseDistance(a, b, {})).toThrow(RangeError);
  });

  test('weighted angle product가 overflow하면 RangeError', () => {
    // angularDistance ≈ π(float atan2 결과라 정확히 π는 아니다), angularWeight = MAX_VALUE
    // → angularDistance * MAX_VALUE = Infinity
    const a: Pose2 = { px: 0, py: 0, angle: 0 };
    const b: Pose2 = { px: 0, py: 0, angle: Math.PI };
    expect(() => poseDistance(a, b, { angularWeight: Number.MAX_VALUE })).toThrow(RangeError);
  });

  test('angularWeight: 0이어도 non-finite pose angle은 RangeError', () => {
    // pose finite 검증이 angularWeight 적용보다 먼저 실행되므로 weight 0이 angle을 가리지 못한다.
    const ok: Pose2 = { px: 0, py: 0, angle: 0 };
    expect(() => poseDistance(ok, { px: 0, py: 0, angle: Number.NaN }, { angularWeight: 0 })).toThrow(RangeError);
  });

  test('position 차이가 overflow해 결과가 non-finite이면 RangeError', () => {
    // ax - bx = MAX_VALUE - (-MAX_VALUE) = Infinity
    const a: Pose2 = { px: Number.MAX_VALUE, py: 0, angle: 0 };
    const b: Pose2 = { px: -Number.MAX_VALUE, py: 0, angle: 0 };
    expect(() => poseDistance(a, b)).toThrow(RangeError);
  });
});
