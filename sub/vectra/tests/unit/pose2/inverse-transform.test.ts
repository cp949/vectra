/**
 * pose2 inverse transform(inverseTransformPointByPose* / inverseTransformVectorByPose*) 계약 테스트.
 *
 * 점과 벡터의 역변환, 정변환과의 왕복, 입력과 출력이 같은 경우, 유한하지 않은 값의 거부를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { inverseTransformPointByPose } from '../../../src/pose2/inverse-transform-point-by-pose';
import { inverseTransformPointByPoseInto } from '../../../src/pose2/inverse-transform-point-by-pose-into';
import { inverseTransformVectorByPose } from '../../../src/pose2/inverse-transform-vector-by-pose';
import { inverseTransformVectorByPoseInto } from '../../../src/pose2/inverse-transform-vector-by-pose-into';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import { transformVectorByPose } from '../../../src/pose2/transform-vector-by-pose';
import type { Pose2 } from '../../../src/types/flat-shapes.internal';

// ─── inverseTransformPointByPoseInto ───────────────────────────────────

describe('inverseTransformPointByPoseInto - translation/rotation', () => {
  test('angle 0은 translation을 뺀다', () => {
    const out = { x: 0, y: 0 };
    inverseTransformPointByPoseInto(out, { px: 10, py: 20, angle: 0 }, { x: 11, y: 22 });
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(2, 12);
  });

  test('angle PI/2는 known value를 반환한다', () => {
    const out = { x: 0, y: 0 };
    inverseTransformPointByPoseInto(out, { px: 10, py: 20, angle: Math.PI / 2 }, { x: 10, y: 21 });
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(0, 12);
  });
});

describe('inverseTransformPointByPoseInto - aliasing', () => {
  test('point와 out이 같은 object여도 안전하다', () => {
    const shared = { x: 11, y: 22 };
    inverseTransformPointByPoseInto(shared, { px: 10, py: 20, angle: 0 }, shared);
    expect(shared.x).toBeCloseTo(1, 12);
    expect(shared.y).toBeCloseTo(2, 12);
  });

  test('pose와 out이 같은 객체여도 산식대로 동작한다', () => {
    const shared = { x: 0, y: 0, px: 10, py: 20, angle: 0 };
    const out = inverseTransformPointByPoseInto(shared, shared, { x: 11, y: 22 });
    expect(out).toBe(shared);
    expect(shared.x).toBeCloseTo(1, 12);
    expect(shared.y).toBeCloseTo(2, 12);
  });
});

// ─── inverseTransformVectorByPoseInto ──────────────────────────────────

describe('inverseTransformVectorByPoseInto - rotation만', () => {
  test('translation을 무시한다', () => {
    const out = { x: 0, y: 0 };
    inverseTransformVectorByPoseInto(out, { px: 10, py: 20, angle: 0 }, { x: 1, y: 2 });
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(2, 12);
  });

  test('angle PI/2는 translation 없이 inverse 회전만 적용한다', () => {
    const out = { x: 0, y: 0 };
    inverseTransformVectorByPoseInto(out, { px: 10, py: 20, angle: Math.PI / 2 }, { x: 0, y: 1 });
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(0, 12);
  });
});

describe('inverseTransformVectorByPoseInto - aliasing/parity', () => {
  test('vector와 out이 같은 object여도 안전하다', () => {
    const shared = { x: 0, y: 1 };
    inverseTransformVectorByPoseInto(shared, { px: 10, py: 20, angle: Math.PI / 2 }, shared);
    expect(shared.x).toBeCloseTo(1, 12);
    expect(shared.y).toBeCloseTo(0, 12);
  });

  test('pose와 out이 같은 객체여도 translation 없이 inverse 회전만 적용한다', () => {
    const shared = { x: 0, y: 0, px: 10, py: 20, angle: Math.PI / 2 };
    const out = inverseTransformVectorByPoseInto(shared, shared, { x: 0, y: 1 });
    expect(out).toBe(shared);
    expect(shared.x).toBeCloseTo(1, 12);
    expect(shared.y).toBeCloseTo(0, 12);
  });
});

// ─── round-trip ────────────────────────────────────────────────────────

describe('forward/inverse round-trip', () => {
  test('point forward 후 inverse는 원본을 복원한다', () => {
    const pose: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const original = { x: 2.5, y: 4.5 };
    const forward = transformPointByPose(pose, original);
    const back = inverseTransformPointByPose(pose, forward);
    expect(back.x).toBeCloseTo(original.x, 12);
    expect(back.y).toBeCloseTo(original.y, 12);
  });

  test('vector forward 후 inverse는 원본을 복원한다', () => {
    const pose: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const original = { x: 2.5, y: 4.5 };
    const forward = transformVectorByPose(pose, original);
    const back = inverseTransformVectorByPose(pose, forward);
    expect(back.x).toBeCloseTo(original.x, 12);
    expect(back.y).toBeCloseTo(original.y, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('inverse transform - non-finite RangeError', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    const out = { x: 0, y: 0 };
    expect(() => inverseTransformPointByPoseInto(out, { px: Number.NaN, py: 0, angle: 0 }, { x: 1, y: 1 })).toThrow(
      RangeError
    );
    expect(() =>
      inverseTransformVectorByPoseInto(out, { px: 0, py: 0, angle: Number.POSITIVE_INFINITY }, { x: 1, y: 1 })
    ).toThrow(RangeError);
  });

  test('point/vector entry가 non-finite이면 RangeError', () => {
    const out = { x: 0, y: 0 };
    const pose: Pose2 = { px: 0, py: 0, angle: 0 };
    expect(() => inverseTransformPointByPoseInto(out, pose, { x: Number.NaN, y: 0 })).toThrow(RangeError);
    expect(() => inverseTransformPointByPoseInto(out, pose, { x: 0, y: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
    expect(() => inverseTransformVectorByPoseInto(out, pose, { x: Number.POSITIVE_INFINITY, y: 0 })).toThrow(
      RangeError
    );
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('inverse transform - companion', () => {
  test('inverseTransformPointByPose는 새 plain { x, y }를 반환한다', () => {
    const result = inverseTransformPointByPose({ px: 10, py: 20, angle: Math.PI / 2 }, { x: 10, y: 21 });
    expect(result).not.toHaveProperty('position');
    expect(result.x).toBeCloseTo(1, 12);
    expect(result.y).toBeCloseTo(0, 12);
  });

  test('inverseTransformVectorByPose는 새 plain { x, y }를 반환한다', () => {
    const result = inverseTransformVectorByPose({ px: 10, py: 20, angle: Math.PI / 2 }, { x: 0, y: 1 });
    expect(result.x).toBeCloseTo(1, 12);
    expect(result.y).toBeCloseTo(0, 12);
  });
});
