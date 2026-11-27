/**
 * pose2 look-at builder(lookAtPose* / lookAtPoseInto) 계약 테스트.
 *
 * 목표 방향의 각도와 위치, 같은 객체에 기록하는 동작, 방향이 없거나 값이 유한하지 않을 때의 실패를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { lookAtPose } from '../../../src/pose2/look-at-pose';
import { lookAtPoseInto } from '../../../src/pose2/look-at-pose-into';
import type { Pose2Writable } from '../../../src/types/flat-shapes.internal';

/** 위치와 각도가 0인 가변 pose를 만든다. */
function makePose(): Pose2Writable {
  return { px: 0, py: 0, angle: 0 };
}

// ─── lookAtPoseInto - angle ─────────────────────────────────────────────

describe('lookAtPoseInto - 방향 angle', () => {
  test('+x target은 angle 0', () => {
    const out = makePose();
    const result = lookAtPoseInto(out, { x: 1, y: 1 }, { x: 5, y: 1 });
    expect(result).toBe(out);
    expect(out.px).toBeCloseTo(1, 12);
    expect(out.py).toBeCloseTo(1, 12);
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
  test('position과 out이 같은 객체여도 안전하다', () => {
    const out = { x: 2, y: -1, px: 0, py: 0, angle: 0 };
    const result = lookAtPoseInto(out, out, { x: 5, y: 3 });
    expect(result).toBe(out);
    expect(out.px).toBeCloseTo(2, 12);
    expect(out.py).toBeCloseTo(-1, 12);
    expect(out.angle).toBeCloseTo(Math.atan2(4, 3), 12);
  });
});

// ─── zero direction ──────────────────────────────────────────────────────

describe('lookAtPoseInto - zero direction RangeError', () => {
  test('position과 target이 같으면 RangeError이며 out을 수정하지 않는다', () => {
    const out: Pose2Writable = { px: 9, py: 9, angle: 7 };
    expect(() => lookAtPoseInto(out, { x: 1, y: 2 }, { x: 1, y: 2 })).toThrow(RangeError);
    expect(out.px).toBe(9);
    expect(out.py).toBe(9);
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
    expect(result.px).toBeCloseTo(2, 12);
    expect(result.py).toBeCloseTo(-1, 12);
    expect(result.angle).toBeCloseTo(Math.atan2(4, 3), 12);
  });
});
