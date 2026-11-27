/**
 * pose2 forward transform(transformPointByPose* / transformVectorByPose*) 계약 테스트.
 *
 * 점에는 이동을 적용하고 벡터에는 회전만 적용하는지 검증한다. 입력과 출력이 같은 경우와 유한하지 않은 값도 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import { transformPointByPoseInto } from '../../../src/pose2/transform-point-by-pose-into';
import { transformVectorByPose } from '../../../src/pose2/transform-vector-by-pose';
import { transformVectorByPoseInto } from '../../../src/pose2/transform-vector-by-pose-into';
import type { Pose2 } from '../../../src/types/flat-shapes.internal';

// ─── transformPointByPoseInto ──────────────────────────────────────────

describe('transformPointByPoseInto - rotation/translation', () => {
  test('angle 0은 translation만 적용한다', () => {
    const out = { x: 0, y: 0 };
    transformPointByPoseInto(out, { px: 10, py: 20, angle: 0 }, { x: 1, y: 2 });
    expect(out.x).toBeCloseTo(11, 12);
    expect(out.y).toBeCloseTo(22, 12);
  });

  test('angle PI/2는 회전 후 translation을 적용한다', () => {
    const out = { x: 0, y: 0 };
    transformPointByPoseInto(out, { px: 10, py: 20, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(out.x).toBeCloseTo(10, 12);
    expect(out.y).toBeCloseTo(21, 12);
  });
});

describe('transformPointByPoseInto - aliasing', () => {
  test('point와 out이 같은 object여도 안전하다', () => {
    const shared = { x: 1, y: 0 };
    transformPointByPoseInto(shared, { px: 10, py: 20, angle: Math.PI / 2 }, shared);
    expect(shared.x).toBeCloseTo(10, 12);
    expect(shared.y).toBeCloseTo(21, 12);
  });

  test('pose와 out이 같은 객체여도 산식대로 동작한다', () => {
    const shared = { x: 0, y: 0, px: 10, py: 20, angle: 0 };
    const out = transformPointByPoseInto(shared, shared, { x: 1, y: 2 });
    expect(out).toBe(shared);
    expect(shared.x).toBeCloseTo(11, 12);
    expect(shared.y).toBeCloseTo(22, 12);
  });
});

// ─── transformVectorByPoseInto ─────────────────────────────────────────

describe('transformVectorByPoseInto - rotation만', () => {
  test('translation을 무시한다', () => {
    const out = { x: 0, y: 0 };
    transformVectorByPoseInto(out, { px: 10, py: 20, angle: 0 }, { x: 1, y: 2 });
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(2, 12);
  });

  test('angle PI/2는 translation 없이 회전만 적용한다', () => {
    const out = { x: 0, y: 0 };
    transformVectorByPoseInto(out, { px: 10, py: 20, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(out.x).toBeCloseTo(0, 12);
    expect(out.y).toBeCloseTo(1, 12);
  });

  test('point transform과 같은 pose에서 translation 차이만큼 다르다', () => {
    const pose: Pose2 = { px: 10, py: 20, angle: 0.3 };
    const pointOut = transformPointByPose(pose, { x: 2, y: 3 });
    const vectorOut = transformVectorByPose(pose, { x: 2, y: 3 });
    expect(pointOut.x - vectorOut.x).toBeCloseTo(10, 12);
    expect(pointOut.y - vectorOut.y).toBeCloseTo(20, 12);
  });
});

describe('transformVectorByPoseInto - aliasing/parity', () => {
  test('vector와 out이 같은 object여도 안전하다', () => {
    const shared = { x: 1, y: 0 };
    transformVectorByPoseInto(shared, { px: 10, py: 20, angle: Math.PI / 2 }, shared);
    expect(shared.x).toBeCloseTo(0, 12);
    expect(shared.y).toBeCloseTo(1, 12);
  });

  test('pose와 out이 같은 객체여도 translation 없이 회전만 적용한다', () => {
    const shared = { x: 0, y: 0, px: 10, py: 20, angle: Math.PI / 2 };
    const out = transformVectorByPoseInto(shared, shared, { x: 1, y: 0 });
    expect(out).toBe(shared);
    expect(shared.x).toBeCloseTo(0, 12);
    expect(shared.y).toBeCloseTo(1, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('forward transform - non-finite RangeError', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    const out = { x: 0, y: 0 };
    expect(() => transformPointByPoseInto(out, { px: Number.NaN, py: 0, angle: 0 }, { x: 1, y: 1 })).toThrow(
      RangeError
    );
    expect(() =>
      transformPointByPoseInto(out, { px: 0, py: Number.POSITIVE_INFINITY, angle: 0 }, { x: 1, y: 1 })
    ).toThrow(RangeError);
    expect(() =>
      transformVectorByPoseInto(out, { px: 0, py: 0, angle: Number.NEGATIVE_INFINITY }, { x: 1, y: 1 })
    ).toThrow(RangeError);
  });

  test('point/vector entry가 non-finite이면 RangeError', () => {
    const out = { x: 0, y: 0 };
    const pose: Pose2 = { px: 0, py: 0, angle: 0 };
    expect(() => transformPointByPoseInto(out, pose, { x: Number.NaN, y: 0 })).toThrow(RangeError);
    expect(() => transformPointByPoseInto(out, pose, { x: 0, y: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => transformVectorByPoseInto(out, pose, { x: Number.NEGATIVE_INFINITY, y: 0 })).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('forward transform - companion', () => {
  test('transformPointByPose는 새 plain { x, y }를 반환한다', () => {
    const result = transformPointByPose({ px: 10, py: 20, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(result).not.toHaveProperty('position');
    expect(result.x).toBeCloseTo(10, 12);
    expect(result.y).toBeCloseTo(21, 12);
  });

  test('transformVectorByPose는 새 plain { x, y }를 반환한다', () => {
    const result = transformVectorByPose({ px: 10, py: 20, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(result.x).toBeCloseTo(0, 12);
    expect(result.y).toBeCloseTo(1, 12);
  });
});
