/**
 * pose2 합성/inverse(composePose* / invertPose*) 계약 테스트.
 *
 * 오른쪽 pose부터 적용하는 합성 순서, 같은 객체에 기록하는 동작, 역변환, 유한하지 않은 값의 거부를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { composePose } from '../../../src/pose2/compose-pose';
import { composePoseInto } from '../../../src/pose2/compose-pose-into';
import { invertPose } from '../../../src/pose2/invert-pose';
import { invertPoseInto } from '../../../src/pose2/invert-pose-into';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import type { Pose2, Pose2Writable } from '../../../src/types/flat-shapes.internal';

/** 위치와 각도가 0인 가변 pose를 만든다. */
function makePose(): Pose2Writable {
  return { px: 0, py: 0, angle: 0 };
}

// ─── composePoseInto ───────────────────────────────────────────────────

describe('composePoseInto - left*right 합성', () => {
  test('object pose 두 개를 합성해 known translation/angle을 기록한다', () => {
    const out = makePose();
    const result = composePoseInto(out, { px: 1, py: 2, angle: Math.PI / 2 }, { px: 3, py: 4, angle: Math.PI / 2 });
    expect(result).toBe(out);
    expect(out.px).toBeCloseTo(-3, 12);
    expect(out.py).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });

  test('right를 먼저, left를 나중에 적용한다', () => {
    const left: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const right: Pose2 = { px: -2, py: 5, angle: -0.4 };
    const point = { x: 2.5, y: 4.5 };
    const composed = composePose(left, right);
    const direct = transformPointByPose(composed, point);
    const stepwise = transformPointByPose(left, transformPointByPose(right, point));
    expect(direct.x).toBeCloseTo(stepwise.x, 12);
    expect(direct.y).toBeCloseTo(stepwise.y, 12);
  });
});

describe('composePoseInto - aliasing', () => {
  test('out과 왼쪽 pose가 같은 객체여도 안전하다', () => {
    const out = { px: 1, py: 2, angle: Math.PI / 2 };
    composePoseInto(out, out, { px: 3, py: 4, angle: Math.PI / 2 });
    expect(out.px).toBeCloseTo(-3, 12);
    expect(out.py).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });

  test('out과 오른쪽 pose가 같은 객체여도 안전하다', () => {
    const out = { px: 3, py: 4, angle: Math.PI / 2 };
    composePoseInto(out, { px: 1, py: 2, angle: Math.PI / 2 }, out);
    expect(out.px).toBeCloseTo(-3, 12);
    expect(out.py).toBeCloseTo(5, 12);
    expect(out.angle).toBeCloseTo(Math.PI, 12);
  });
});

// ─── invertPoseInto ────────────────────────────────────────────────────

describe('invertPoseInto - inverse 관계', () => {
  test('inverse pose의 forward transform은 원본 pose forward를 되돌린다', () => {
    const pose: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const point = { x: 2.5, y: 4.5 };
    const forward = transformPointByPose(pose, point);
    const inverse = invertPoseInto(makePose(), pose);
    const back = transformPointByPose(inverse, forward);
    expect(back.x).toBeCloseTo(point.x, 12);
    expect(back.y).toBeCloseTo(point.y, 12);
  });

  test('pose와 inverse를 합성하면 identity에 가깝다', () => {
    const pose: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const composed = composePose(pose, invertPose(pose));
    expect(composed.px).toBeCloseTo(0, 12);
    expect(composed.py).toBeCloseTo(0, 12);
    expect(composed.angle).toBeCloseTo(0, 12);
  });

  test('out과 입력 pose가 같은 객체여도 안전하다', () => {
    const out = { px: 7, py: -3, angle: 1.2 };
    const result = invertPoseInto(out, out);
    expect(result).toBe(out);
    // R(-1.2) * -(7,-3)
    const c = Math.cos(1.2);
    const s = Math.sin(1.2);
    expect(out.px).toBeCloseTo(-(c * 7 + s * -3), 12);
    expect(out.py).toBeCloseTo(s * 7 - c * -3, 12);
    expect(out.angle).toBeCloseTo(-1.2, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('합성/inverse - non-finite RangeError', () => {
  test('composePose pose entry가 non-finite이면 RangeError', () => {
    expect(() => composePoseInto(makePose(), { px: Number.NaN, py: 0, angle: 0 }, { px: 0, py: 0, angle: 0 })).toThrow(
      RangeError
    );
    expect(() =>
      composePoseInto(makePose(), { px: 0, py: 0, angle: 0 }, { px: 0, py: Number.POSITIVE_INFINITY, angle: 0 })
    ).toThrow(RangeError);
    expect(() =>
      composePoseInto(makePose(), { px: 0, py: 0, angle: Number.NEGATIVE_INFINITY }, { px: 0, py: 0, angle: 0 })
    ).toThrow(RangeError);
  });

  test('invertPose pose entry가 non-finite이면 RangeError', () => {
    expect(() => invertPoseInto(makePose(), { px: Number.NaN, py: 0, angle: 0 })).toThrow(RangeError);
    expect(() => invertPoseInto(makePose(), { px: 0, py: 0, angle: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('합성/inverse - companion', () => {
  test('composePose는 새 plain pose object를 반환한다', () => {
    const result = composePose({ px: 1, py: 2, angle: Math.PI / 2 }, { px: 3, py: 4, angle: Math.PI / 2 });
    expect(result.px).toBeCloseTo(-3, 12);
    expect(result.py).toBeCloseTo(5, 12);
    expect(result.angle).toBeCloseTo(Math.PI, 12);
  });

  test('invertPose는 새 plain pose object를 반환한다', () => {
    const result = invertPose({ px: 7, py: -3, angle: 1.2 });
    expect(result.px).toBeCloseTo(-(Math.cos(1.2) * 7 + Math.sin(1.2) * -3), 12);
    expect(result.angle).toBeCloseTo(-1.2, 12);
  });
});
