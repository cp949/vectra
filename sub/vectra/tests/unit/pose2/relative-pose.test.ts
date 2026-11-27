/**
 * pose2 relative transform(relativePose* / relativePoseInto) 계약 테스트.
 *
 * 상대 pose를 합성하면 목표 pose로 돌아오는지, 같은 객체에 기록할 수 있는지, 유한하지 않은 값을 거부하는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { relativePose } from '../../../src/pose2/relative-pose';
import { relativePoseInto } from '../../../src/pose2/relative-pose-into';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import type { Pose2, Pose2Writable } from '../../../src/types/flat-shapes.internal';

/** 위치와 각도가 0인 가변 pose를 만든다. */
function makePose(): Pose2Writable {
  return { px: 0, py: 0, angle: 0 };
}

// ─── relativePoseInto - frame round-trip ────────────────────────────────

describe('relativePoseInto - from frame 합성', () => {
  test('from에 relative를 다시 합성하면 to와 같은 결과를 낸다', () => {
    const from: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const to: Pose2 = { px: -2, py: 5, angle: -0.4 };
    const local = { x: 2.5, y: 4.5 };
    const rel = relativePose(from, to);
    const viaRelative = transformPointByPose(from, transformPointByPose(rel, local));
    const direct = transformPointByPose(to, local);
    expect(viaRelative.x).toBeCloseTo(direct.x, 12);
    expect(viaRelative.y).toBeCloseTo(direct.y, 12);
  });

  test('from === to이면 identity pose에 가깝다', () => {
    const pose: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const rel = relativePose(pose, pose);
    expect(rel.px).toBeCloseTo(0, 12);
    expect(rel.py).toBeCloseTo(0, 12);
    expect(rel.angle).toBeCloseTo(0, 12);
  });

  test('out을 반환한다', () => {
    const out = makePose();
    const result = relativePoseInto(out, { px: 1, py: 2, angle: 0.3 }, { px: 3, py: 4, angle: 0.7 });
    expect(result).toBe(out);
  });
});

describe('relativePoseInto - aliasing', () => {
  test('out과 기준 pose가 같은 객체여도 안전하다', () => {
    const out = { px: 1, py: 2, angle: 0 };
    relativePoseInto(out, out, { px: 4, py: 6, angle: 0 });
    expect(out.px).toBeCloseTo(3, 12);
    expect(out.py).toBeCloseTo(4, 12);
  });

  test('out과 목표 pose가 같은 객체여도 안전하다', () => {
    const out = { px: 4, py: 6, angle: 0 };
    relativePoseInto(out, { px: 1, py: 2, angle: 0 }, out);
    expect(out.px).toBeCloseTo(3, 12);
    expect(out.py).toBeCloseTo(4, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('relativePose - non-finite RangeError', () => {
  test('from pose entry가 non-finite이면 RangeError', () => {
    expect(() => relativePoseInto(makePose(), { px: Number.NaN, py: 0, angle: 0 }, { px: 0, py: 0, angle: 0 })).toThrow(
      RangeError
    );
    expect(() =>
      relativePoseInto(makePose(), { px: 0, py: 0, angle: Number.POSITIVE_INFINITY }, { px: 0, py: 0, angle: 0 })
    ).toThrow(RangeError);
  });

  test('to pose entry가 non-finite이면 RangeError', () => {
    expect(() =>
      relativePoseInto(makePose(), { px: 0, py: 0, angle: 0 }, { px: 0, py: Number.NEGATIVE_INFINITY, angle: 0 })
    ).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('relativePose - companion', () => {
  test('relativePose는 새 plain pose object를 반환한다', () => {
    const result = relativePose({ px: 1, py: 2, angle: 0 }, { px: 4, py: 6, angle: 0 });
    expect(result.px).toBeCloseTo(3, 12);
    expect(result.py).toBeCloseTo(4, 12);
    expect(result.angle).toBeCloseTo(0, 12);
  });
});
