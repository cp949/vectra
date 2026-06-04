/**
 * pose2 relative transform(relativePose* / relativePoseInto) 계약 테스트.
 *
 * `relativePose(from, to) = invert(from) * to` 의미를 frame round-trip으로 고정한다. identity
 * relative case, object/tuple pose input, object/tuple out.position storage, aliasing 안전,
 * non-finite RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { relativePose } from '../../../src/pose2/relative-pose';
import { relativePoseInto } from '../../../src/pose2/relative-pose-into';
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

// ─── relativePoseInto - frame round-trip ────────────────────────────────

describe('relativePoseInto - from frame 합성', () => {
  test('from에 relative를 다시 합성하면 to와 같은 결과를 낸다', () => {
    const from: Pose2Like = { position: { x: 7, y: -3 }, angle: 1.2 };
    const to: Pose2Like = { position: { x: -2, y: 5 }, angle: -0.4 };
    const local = { x: 2.5, y: 4.5 };
    const rel = relativePose(from, to);
    const viaRelative = transformPointByPose(from, transformPointByPose(rel, local));
    const direct = transformPointByPose(to, local);
    expect(viaRelative.x).toBeCloseTo(direct.x, 12);
    expect(viaRelative.y).toBeCloseTo(direct.y, 12);
  });

  test('from === to이면 identity pose에 가깝다', () => {
    const pose: Pose2Like = { position: { x: 7, y: -3 }, angle: 1.2 };
    const rel = relativePose(pose, pose);
    expect(asXY(rel.position).x).toBeCloseTo(0, 12);
    expect(asXY(rel.position).y).toBeCloseTo(0, 12);
    expect(rel.angle).toBeCloseTo(0, 12);
  });

  test('out을 반환한다', () => {
    const out = makePose();
    const result = relativePoseInto(
      out,
      { position: { x: 1, y: 2 }, angle: 0.3 },
      { position: { x: 3, y: 4 }, angle: 0.7 }
    );
    expect(result).toBe(out);
  });

  test('tuple pose input과 object pose input이 같은 결과를 낸다', () => {
    const objectOut = makePose();
    const tupleOut = makePose();
    relativePoseInto(objectOut, { position: { x: 1, y: 2 }, angle: 0.7 }, { position: { x: 3, y: 4 }, angle: 0.3 });
    relativePoseInto(tupleOut, [[1, 2], 0.7], [[3, 4], 0.3]);
    expect(asXY(tupleOut.position).x).toBeCloseTo(asXY(objectOut.position).x, 12);
    expect(asXY(tupleOut.position).y).toBeCloseTo(asXY(objectOut.position).y, 12);
    expect(tupleOut.angle).toBeCloseTo(objectOut.angle, 12);
  });

  test('tuple out.position storage에 기록한다', () => {
    const position: [number, number] = [0, 0];
    const out: Pose2Writable<XYTupleWritable> = { position, angle: 0 };
    relativePoseInto(out, { position: { x: 1, y: 2 }, angle: 0 }, { position: { x: 4, y: 6 }, angle: 0 });
    expect(position[0]).toBeCloseTo(3, 12);
    expect(position[1]).toBeCloseTo(4, 12);
    expect(out.angle).toBeCloseTo(0, 12);
  });
});

describe('relativePoseInto - aliasing', () => {
  test('out.position이 from.position과 같은 object여도 안전하다', () => {
    const shared = { x: 1, y: 2 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    relativePoseInto(out, { position: shared, angle: 0 }, { position: { x: 4, y: 6 }, angle: 0 });
    expect(shared.x).toBeCloseTo(3, 12);
    expect(shared.y).toBeCloseTo(4, 12);
  });

  test('out.position이 to.position과 같은 object여도 안전하다', () => {
    const shared = { x: 4, y: 6 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    relativePoseInto(out, { position: { x: 1, y: 2 }, angle: 0 }, { position: shared, angle: 0 });
    expect(shared.x).toBeCloseTo(3, 12);
    expect(shared.y).toBeCloseTo(4, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('relativePose - non-finite RangeError', () => {
  test('from pose entry가 non-finite이면 RangeError', () => {
    expect(() =>
      relativePoseInto(
        makePose(),
        { position: { x: Number.NaN, y: 0 }, angle: 0 },
        { position: { x: 0, y: 0 }, angle: 0 }
      )
    ).toThrow(RangeError);
    expect(() =>
      relativePoseInto(
        makePose(),
        { position: { x: 0, y: 0 }, angle: Number.POSITIVE_INFINITY },
        { position: { x: 0, y: 0 }, angle: 0 }
      )
    ).toThrow(RangeError);
  });

  test('to pose entry가 non-finite이면 RangeError', () => {
    expect(() =>
      relativePoseInto(
        makePose(),
        { position: { x: 0, y: 0 }, angle: 0 },
        { position: { x: 0, y: Number.NEGATIVE_INFINITY }, angle: 0 }
      )
    ).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('relativePose - companion', () => {
  test('relativePose는 새 plain pose object를 반환한다', () => {
    const result = relativePose({ position: { x: 1, y: 2 }, angle: 0 }, { position: { x: 4, y: 6 }, angle: 0 });
    expect(asXY(result.position).x).toBeCloseTo(3, 12);
    expect(asXY(result.position).y).toBeCloseTo(4, 12);
    expect(result.angle).toBeCloseTo(0, 12);
  });
});
