/**
 * pose2 look-at builder(lookAtPose* / lookAtPoseInto) 계약 테스트.
 *
 * +x/+y target의 known angle, arbitrary target의 atan2 일치, object/tuple input과 tuple
 * out.position storage, position/out.position aliasing 안전, zero direction RangeError(+0/-0
 * 포함, out 미수정), non-finite RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { lookAtPose } from '../../../src/pose2/look-at-pose';
import { lookAtPoseInto } from '../../../src/pose2/look-at-pose-into';
import type { Pose2Writable, XYTupleWritable } from '../../../src/types';

/** object position storage를 가진 새 Pose2Writable seed를 만든다. */
function makePose(): Pose2Writable {
  return { position: { x: 0, y: 0 }, angle: 0 };
}

/** unknown 값을 x/y object로 본다. */
function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── lookAtPoseInto - angle ─────────────────────────────────────────────

describe('lookAtPoseInto - 방향 angle', () => {
  test('+x target은 angle 0', () => {
    const out = makePose();
    const result = lookAtPoseInto(out, { x: 1, y: 1 }, { x: 5, y: 1 });
    expect(result).toBe(out);
    expect(asXY(out.position).x).toBeCloseTo(1, 12);
    expect(asXY(out.position).y).toBeCloseTo(1, 12);
    expect(out.angle).toBeCloseTo(0, 12);
  });

  test('+y target은 angle PI/2', () => {
    const out = makePose();
    lookAtPoseInto(out, { x: 1, y: 1 }, { x: 1, y: 5 });
    expect(out.angle).toBeCloseTo(Math.PI / 2, 12);
  });

  test('-x target은 angle PI', () => {
    const out = makePose();
    lookAtPoseInto(out, { x: 1, y: 1 }, { x: -3, y: 1 });
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });

  test('arbitrary target은 atan2(dy, dx)와 일치한다', () => {
    const out = makePose();
    lookAtPoseInto(out, { x: 2, y: -1 }, { x: 5, y: 3 });
    expect(out.angle).toBeCloseTo(Math.atan2(4, 3), 12);
  });

  test('signed zero dy + 음수 dx는 -π 대신 π를 반환한다', () => {
    const out = makePose();
    lookAtPoseInto(out, { x: 0, y: 0 }, { x: -1, y: -0 });
    expect(out.angle).toBe(Math.PI);
  });
});

describe('lookAtPoseInto - input/output storage', () => {
  test('tuple position/target input과 object input이 같은 결과를 낸다', () => {
    const objectOut = makePose();
    const tupleOut = makePose();
    lookAtPoseInto(objectOut, { x: 2, y: -1 }, { x: 5, y: 3 });
    lookAtPoseInto(tupleOut, [2, -1], [5, 3]);
    expect(asXY(tupleOut.position).x).toBeCloseTo(asXY(objectOut.position).x, 12);
    expect(asXY(tupleOut.position).y).toBeCloseTo(asXY(objectOut.position).y, 12);
    expect(tupleOut.angle).toBeCloseTo(objectOut.angle, 12);
  });

  test('tuple out.position storage에 기록한다', () => {
    const position: [number, number] = [0, 0];
    const out: Pose2Writable<XYTupleWritable> = { position, angle: 0 };
    lookAtPoseInto(out, { x: 2, y: -1 }, { x: 5, y: 3 });
    expect(position[0]).toBeCloseTo(2, 12);
    expect(position[1]).toBeCloseTo(-1, 12);
    expect(out.angle).toBeCloseTo(Math.atan2(4, 3), 12);
  });

  test('position과 out.position이 같은 object여도 안전하다', () => {
    const shared = { x: 2, y: -1 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    const result = lookAtPoseInto(out, shared, { x: 5, y: 3 });
    expect(result).toBe(out);
    expect(shared.x).toBeCloseTo(2, 12);
    expect(shared.y).toBeCloseTo(-1, 12);
    expect(out.angle).toBeCloseTo(Math.atan2(4, 3), 12);
  });
});

// ─── zero direction ──────────────────────────────────────────────────────

describe('lookAtPoseInto - zero direction RangeError', () => {
  test('position과 target이 같으면 RangeError이며 out을 수정하지 않는다', () => {
    const out: Pose2Writable = { position: { x: 9, y: 9 }, angle: 7 };
    expect(() => lookAtPoseInto(out, { x: 1, y: 2 }, { x: 1, y: 2 })).toThrow(RangeError);
    expect(asXY(out.position).x).toBe(9);
    expect(asXY(out.position).y).toBe(9);
    expect(out.angle).toBe(7);
  });

  test('+0/-0만 다른 좌표도 zero direction이다', () => {
    expect(() => lookAtPoseInto(makePose(), { x: 0, y: 0 }, { x: -0, y: -0 })).toThrow(RangeError);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('lookAtPose - non-finite RangeError', () => {
  test('position 성분이 non-finite이면 RangeError', () => {
    expect(() => lookAtPoseInto(makePose(), { x: Number.NaN, y: 0 }, { x: 1, y: 1 })).toThrow(RangeError);
    expect(() => lookAtPoseInto(makePose(), { x: 0, y: Number.POSITIVE_INFINITY }, { x: 1, y: 1 })).toThrow(RangeError);
  });

  test('target 성분이 non-finite이면 RangeError', () => {
    expect(() => lookAtPoseInto(makePose(), { x: 0, y: 0 }, { x: Number.NEGATIVE_INFINITY, y: 1 })).toThrow(RangeError);
    expect(() => lookAtPoseInto(makePose(), { x: 0, y: 0 }, { x: 1, y: Number.NaN })).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('lookAtPose - companion', () => {
  test('lookAtPose는 새 plain pose object를 반환한다', () => {
    const result = lookAtPose({ x: 2, y: -1 }, { x: 5, y: 3 });
    expect(asXY(result.position).x).toBeCloseTo(2, 12);
    expect(asXY(result.position).y).toBeCloseTo(-1, 12);
    expect(result.angle).toBeCloseTo(Math.atan2(4, 3), 12);
  });
});
