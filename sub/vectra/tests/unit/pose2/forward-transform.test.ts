/**
 * pose2 forward transform(transformPointByPose* / transformVectorByPose*) 계약 테스트.
 *
 * point는 translation을 적용하고 vector는 무시한다. object/tuple pose input, object/tuple out,
 * aliasing 안전, non-finite RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import { transformPointByPoseInto } from '../../../src/pose2/transform-point-by-pose-into';
import { transformVectorByPose } from '../../../src/pose2/transform-vector-by-pose';
import { transformVectorByPoseInto } from '../../../src/pose2/transform-vector-by-pose-into';
import type { Pose2Like, XYTupleWritable } from '../../../src/types';

/** unknown 값을 x/y object로 본다. */
function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── transformPointByPoseInto ──────────────────────────────────────────

describe('transformPointByPoseInto - rotation/translation', () => {
  test('angle 0은 translation만 적용한다', () => {
    const out = { x: 0, y: 0 };
    transformPointByPoseInto(out, { position: { x: 10, y: 20 }, angle: 0 }, { x: 1, y: 2 });
    expect(out.x).toBeCloseTo(11, 12);
    expect(out.y).toBeCloseTo(22, 12);
  });

  test('angle PI/2는 회전 후 translation을 적용한다', () => {
    const out = { x: 0, y: 0 };
    transformPointByPoseInto(out, { position: { x: 10, y: 20 }, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(out.x).toBeCloseTo(10, 12);
    expect(out.y).toBeCloseTo(21, 12);
  });

  test('tuple pose input과 object pose input이 같은 결과를 낸다', () => {
    const objectOut = { x: 0, y: 0 };
    const tupleOut = { x: 0, y: 0 };
    const objectPose: Pose2Like = { position: { x: 3, y: 4 }, angle: 0.7 };
    const tuplePose: Pose2Like = [[3, 4], 0.7];
    transformPointByPoseInto(objectOut, objectPose, { x: 5, y: 6 });
    transformPointByPoseInto(tupleOut, tuplePose, { x: 5, y: 6 });
    expect(tupleOut.x).toBeCloseTo(objectOut.x, 12);
    expect(tupleOut.y).toBeCloseTo(objectOut.y, 12);
  });

  test('tuple out storage에 기록한다', () => {
    const out: XYTupleWritable = [0, 0];
    transformPointByPoseInto(out, { position: { x: 10, y: 20 }, angle: Math.PI / 2 }, [1, 0]);
    expect(out[0]).toBeCloseTo(10, 12);
    expect(out[1]).toBeCloseTo(21, 12);
  });
});

describe('transformPointByPoseInto - aliasing', () => {
  test('point와 out이 같은 object여도 안전하다', () => {
    const shared = { x: 1, y: 0 };
    transformPointByPoseInto(shared, { position: { x: 10, y: 20 }, angle: Math.PI / 2 }, shared);
    expect(shared.x).toBeCloseTo(10, 12);
    expect(shared.y).toBeCloseTo(21, 12);
  });

  test('pose position과 out이 같은 object여도 산식대로 동작한다', () => {
    const shared = { x: 10, y: 20 };
    const out = transformPointByPoseInto(shared, { position: shared, angle: 0 }, { x: 1, y: 2 });
    expect(out).toBe(shared);
    expect(shared.x).toBeCloseTo(11, 12);
    expect(shared.y).toBeCloseTo(22, 12);
  });
});

// ─── transformVectorByPoseInto ─────────────────────────────────────────

describe('transformVectorByPoseInto - rotation만', () => {
  test('translation을 무시한다', () => {
    const out = { x: 0, y: 0 };
    transformVectorByPoseInto(out, { position: { x: 10, y: 20 }, angle: 0 }, { x: 1, y: 2 });
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(2, 12);
  });

  test('angle PI/2는 translation 없이 회전만 적용한다', () => {
    const out = { x: 0, y: 0 };
    transformVectorByPoseInto(out, { position: { x: 10, y: 20 }, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(out.x).toBeCloseTo(0, 12);
    expect(out.y).toBeCloseTo(1, 12);
  });

  test('point transform과 같은 pose에서 translation 차이만큼 다르다', () => {
    const pose: Pose2Like = { position: { x: 10, y: 20 }, angle: 0.3 };
    const pointOut = transformPointByPose(pose, { x: 2, y: 3 });
    const vectorOut = transformVectorByPose(pose, { x: 2, y: 3 });
    expect(pointOut.x - vectorOut.x).toBeCloseTo(10, 12);
    expect(pointOut.y - vectorOut.y).toBeCloseTo(20, 12);
  });

  test('tuple out storage에 기록한다', () => {
    const out: XYTupleWritable = [0, 0];
    transformVectorByPoseInto(out, [[10, 20], Math.PI / 2], [1, 0]);
    expect(out[0]).toBeCloseTo(0, 12);
    expect(out[1]).toBeCloseTo(1, 12);
  });
});

describe('transformVectorByPoseInto - aliasing/parity', () => {
  test('vector와 out이 같은 object여도 안전하다', () => {
    const shared = { x: 1, y: 0 };
    transformVectorByPoseInto(shared, { position: { x: 10, y: 20 }, angle: Math.PI / 2 }, shared);
    expect(shared.x).toBeCloseTo(0, 12);
    expect(shared.y).toBeCloseTo(1, 12);
  });

  test('pose position과 out이 같은 object여도 translation 없이 회전만 적용한다', () => {
    const shared = { x: 10, y: 20 };
    const out = transformVectorByPoseInto(shared, { position: shared, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(out).toBe(shared);
    expect(shared.x).toBeCloseTo(0, 12);
    expect(shared.y).toBeCloseTo(1, 12);
  });

  test('tuple pose input과 object pose input이 같은 결과를 낸다', () => {
    const objectOut = { x: 0, y: 0 };
    const tupleOut = { x: 0, y: 0 };
    transformVectorByPoseInto(objectOut, { position: { x: 3, y: 4 }, angle: 0.7 }, { x: 5, y: 6 });
    transformVectorByPoseInto(tupleOut, [[3, 4], 0.7], { x: 5, y: 6 });
    expect(tupleOut.x).toBeCloseTo(objectOut.x, 12);
    expect(tupleOut.y).toBeCloseTo(objectOut.y, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('forward transform - non-finite RangeError', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    const out = { x: 0, y: 0 };
    expect(() =>
      transformPointByPoseInto(out, { position: { x: Number.NaN, y: 0 }, angle: 0 }, { x: 1, y: 1 })
    ).toThrow(RangeError);
    expect(() =>
      transformPointByPoseInto(out, { position: { x: 0, y: Number.POSITIVE_INFINITY }, angle: 0 }, { x: 1, y: 1 })
    ).toThrow(RangeError);
    expect(() =>
      transformVectorByPoseInto(out, { position: { x: 0, y: 0 }, angle: Number.NEGATIVE_INFINITY }, { x: 1, y: 1 })
    ).toThrow(RangeError);
  });

  test('point/vector entry가 non-finite이면 RangeError', () => {
    const out = { x: 0, y: 0 };
    const pose: Pose2Like = { position: { x: 0, y: 0 }, angle: 0 };
    expect(() => transformPointByPoseInto(out, pose, { x: Number.NaN, y: 0 })).toThrow(RangeError);
    expect(() => transformPointByPoseInto(out, pose, { x: 0, y: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => transformVectorByPoseInto(out, pose, { x: Number.NEGATIVE_INFINITY, y: 0 })).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('forward transform - companion', () => {
  test('transformPointByPose는 새 plain { x, y }를 반환한다', () => {
    const result = transformPointByPose({ position: { x: 10, y: 20 }, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(result).not.toHaveProperty('position');
    expect(asXY(result).x).toBeCloseTo(10, 12);
    expect(asXY(result).y).toBeCloseTo(21, 12);
  });

  test('transformVectorByPose는 새 plain { x, y }를 반환한다', () => {
    const result = transformVectorByPose({ position: { x: 10, y: 20 }, angle: Math.PI / 2 }, { x: 1, y: 0 });
    expect(asXY(result).x).toBeCloseTo(0, 12);
    expect(asXY(result).y).toBeCloseTo(1, 12);
  });
});
