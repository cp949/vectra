/**
 * pose2 합성/inverse(composePose* / invertPose*) 계약 테스트.
 *
 * left*right 합성 의미(right 먼저, left 나중), object/tuple pose input, object/tuple out.position
 * storage, aliasing 안전, forward transform round-trip으로 본 inverse 관계, non-finite RangeError,
 * companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { composePose } from '../../../src/pose2/compose-pose';
import { composePoseInto } from '../../../src/pose2/compose-pose-into';
import { invertPose } from '../../../src/pose2/invert-pose';
import { invertPoseInto } from '../../../src/pose2/invert-pose-into';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import type { Pose2Like, Pose2Writable, XYTupleWritable } from '../../../src/types';

/** object position storage를 가진 새 Pose2Writable seed를 만든다. */
function makePose(): Pose2Writable {
  return { position: { x: 0, y: 0 }, angle: 0 };
}

/** unknown 값을 x/y object로 본다. */
function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── composePoseInto ───────────────────────────────────────────────────

describe('composePoseInto - left*right 합성', () => {
  test('object pose 두 개를 합성해 known translation/angle을 기록한다', () => {
    const out = makePose();
    const result = composePoseInto(
      out,
      { position: { x: 1, y: 2 }, angle: Math.PI / 2 },
      { position: { x: 3, y: 4 }, angle: Math.PI / 2 }
    );
    expect(result).toBe(out);
    expect(asXY(out.position).x).toBeCloseTo(-3, 12);
    expect(asXY(out.position).y).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });

  test('right를 먼저, left를 나중에 적용한다', () => {
    const left: Pose2Like = { position: { x: 7, y: -3 }, angle: 1.2 };
    const right: Pose2Like = { position: { x: -2, y: 5 }, angle: -0.4 };
    const point = { x: 2.5, y: 4.5 };
    const composed = composePose(left, right);
    const direct = transformPointByPose(composed, point);
    const stepwise = transformPointByPose(left, transformPointByPose(right, point));
    expect(direct.x).toBeCloseTo(stepwise.x, 12);
    expect(direct.y).toBeCloseTo(stepwise.y, 12);
  });

  test('tuple pose input과 object pose input이 같은 결과를 낸다', () => {
    const objectOut = makePose();
    const tupleOut = makePose();
    composePoseInto(objectOut, { position: { x: 1, y: 2 }, angle: 0.7 }, { position: { x: 3, y: 4 }, angle: 0.3 });
    composePoseInto(tupleOut, [[1, 2], 0.7], [[3, 4], 0.3]);
    expect(asXY(tupleOut.position).x).toBeCloseTo(asXY(objectOut.position).x, 12);
    expect(asXY(tupleOut.position).y).toBeCloseTo(asXY(objectOut.position).y, 12);
    expect(tupleOut.angle).toBeCloseTo(objectOut.angle, 12);
  });

  test('tuple out.position storage에 기록한다', () => {
    const position: [number, number] = [0, 0];
    const out: Pose2Writable<XYTupleWritable> = { position, angle: 0 };
    composePoseInto(
      out,
      { position: { x: 1, y: 2 }, angle: Math.PI / 2 },
      { position: { x: 3, y: 4 }, angle: Math.PI / 2 }
    );
    expect(position[0]).toBeCloseTo(-3, 12);
    expect(position[1]).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });
});

describe('composePoseInto - aliasing', () => {
  test('out.position이 left.position과 같은 object여도 안전하다', () => {
    const shared = { x: 1, y: 2 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    composePoseInto(out, { position: shared, angle: Math.PI / 2 }, { position: { x: 3, y: 4 }, angle: Math.PI / 2 });
    expect(shared.x).toBeCloseTo(-3, 12);
    expect(shared.y).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });

  test('out.position이 right.position과 같은 object여도 안전하다', () => {
    const shared = { x: 3, y: 4 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    composePoseInto(out, { position: { x: 1, y: 2 }, angle: Math.PI / 2 }, { position: shared, angle: Math.PI / 2 });
    expect(shared.x).toBeCloseTo(-3, 12);
    expect(shared.y).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });
});

// ─── invertPoseInto ────────────────────────────────────────────────────

describe('invertPoseInto - inverse 관계', () => {
  test('inverse pose의 forward transform은 원본 pose forward를 되돌린다', () => {
    const pose: Pose2Like = { position: { x: 7, y: -3 }, angle: 1.2 };
    const point = { x: 2.5, y: 4.5 };
    const forward = transformPointByPose(pose, point);
    const inverse = invertPoseInto(makePose(), pose);
    const back = transformPointByPose(inverse, forward);
    expect(back.x).toBeCloseTo(point.x, 12);
    expect(back.y).toBeCloseTo(point.y, 12);
  });

  test('pose와 inverse를 합성하면 identity에 가깝다', () => {
    const pose: Pose2Like = { position: { x: 7, y: -3 }, angle: 1.2 };
    const composed = composePose(pose, invertPose(pose));
    expect(asXY(composed.position).x).toBeCloseTo(0, 12);
    expect(asXY(composed.position).y).toBeCloseTo(0, 12);
    expect(composed.angle).toBeCloseTo(0, 12);
  });

  test('tuple pose input을 지원한다', () => {
    const objectInverse = invertPose({ position: { x: 3, y: 4 }, angle: 0.7 });
    const tupleInverse = invertPose([[3, 4], 0.7]);
    expect(asXY(tupleInverse.position).x).toBeCloseTo(asXY(objectInverse.position).x, 12);
    expect(asXY(tupleInverse.position).y).toBeCloseTo(asXY(objectInverse.position).y, 12);
    expect(tupleInverse.angle).toBeCloseTo(objectInverse.angle, 12);
  });

  test('out.position이 pose position과 같은 object여도 안전하다', () => {
    const shared = { x: 7, y: -3 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    const result = invertPoseInto(out, { position: shared, angle: 1.2 });
    expect(result).toBe(out);
    // R(-1.2) * -(7,-3)
    const c = Math.cos(1.2);
    const s = Math.sin(1.2);
    expect(shared.x).toBeCloseTo(-(c * 7 + s * -3), 12);
    expect(shared.y).toBeCloseTo(s * 7 - c * -3, 12);
    expect(out.angle).toBeCloseTo(-1.2, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('합성/inverse - non-finite RangeError', () => {
  test('composePose pose entry가 non-finite이면 RangeError', () => {
    expect(() =>
      composePoseInto(
        makePose(),
        { position: { x: Number.NaN, y: 0 }, angle: 0 },
        { position: { x: 0, y: 0 }, angle: 0 }
      )
    ).toThrow(RangeError);
    expect(() =>
      composePoseInto(
        makePose(),
        { position: { x: 0, y: 0 }, angle: 0 },
        { position: { x: 0, y: Number.POSITIVE_INFINITY }, angle: 0 }
      )
    ).toThrow(RangeError);
    expect(() =>
      composePoseInto(
        makePose(),
        { position: { x: 0, y: 0 }, angle: Number.NEGATIVE_INFINITY },
        { position: { x: 0, y: 0 }, angle: 0 }
      )
    ).toThrow(RangeError);
  });

  test('invertPose pose entry가 non-finite이면 RangeError', () => {
    expect(() => invertPoseInto(makePose(), { position: { x: Number.NaN, y: 0 }, angle: 0 })).toThrow(RangeError);
    expect(() => invertPoseInto(makePose(), { position: { x: 0, y: 0 }, angle: Number.POSITIVE_INFINITY })).toThrow(
      RangeError
    );
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('합성/inverse - companion', () => {
  test('composePose는 새 plain pose object를 반환한다', () => {
    const result = composePose(
      { position: { x: 1, y: 2 }, angle: Math.PI / 2 },
      { position: { x: 3, y: 4 }, angle: Math.PI / 2 }
    );
    expect(asXY(result.position).x).toBeCloseTo(-3, 12);
    expect(asXY(result.position).y).toBeCloseTo(5, 12);
    expect(result.angle).toBeCloseTo(Math.PI, 12);
  });

  test('invertPose는 새 plain pose object를 반환한다', () => {
    const result = invertPose({ position: { x: 7, y: -3 }, angle: 1.2 });
    expect(result.position).not.toBe(undefined);
    expect(result.angle).toBeCloseTo(-1.2, 12);
  });
});
