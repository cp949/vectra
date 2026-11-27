/**
 * pose2 builder(poseFromTranslationRotationInto / poseFromTranslationRotation) 계약 테스트.
 *
 * 이동 좌표와 회전각 기록, 입력과 출력이 같은 경우, 유한하지 않은 값의 거부, 새 pose 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { poseFromTranslationRotation } from '../../../src/pose2/pose-from-translation-rotation';
import { poseFromTranslationRotationInto } from '../../../src/pose2/pose-from-translation-rotation-into';
import type { Pose2Writable } from '../../../src/types/flat-shapes.internal';

/** 위치와 각도가 0인 가변 pose를 만든다. */
function makePose(): Pose2Writable {
  return { px: 0, py: 0, angle: 0 };
}

// ─── poseFromTranslationRotationInto ───────────────────────────────────

describe('poseFromTranslationRotationInto - 기본', () => {
  test('object translation과 angle을 out에 기록하고 out을 반환한다', () => {
    const out = makePose();
    const result = poseFromTranslationRotationInto(out, { x: 3, y: 4 }, Math.PI / 6);
    expect(result).toBe(out);
    expect(out.px).toBeCloseTo(3, 12);
    expect(out.py).toBeCloseTo(4, 12);
    expect(out.angle).toBeCloseTo(Math.PI / 6, 12);
  });
});

describe('poseFromTranslationRotationInto - aliasing', () => {
  test('translation과 out이 같은 객체여도 안전하다', () => {
    const out = { x: 9, y: 10, px: 0, py: 0, angle: 0 };
    poseFromTranslationRotationInto(out, out, 0.5);
    expect(out.px).toBeCloseTo(9, 12);
    expect(out.py).toBeCloseTo(10, 12);
    expect(out.angle).toBeCloseTo(0.5, 12);
  });
});

describe('poseFromTranslationRotationInto - non-finite', () => {
  test('translation.x가 non-finite이면 RangeError', () => {
    const out = makePose();
    expect(() => poseFromTranslationRotationInto(out, { x: Number.NaN, y: 0 }, 0)).toThrow(RangeError);
    expect(() => poseFromTranslationRotationInto(out, { x: Number.POSITIVE_INFINITY, y: 0 }, 0)).toThrow(RangeError);
    expect(() => poseFromTranslationRotationInto(out, { x: Number.NEGATIVE_INFINITY, y: 0 }, 0)).toThrow(RangeError);
  });

  test('translation.y가 non-finite이면 RangeError', () => {
    const out = makePose();
    expect(() => poseFromTranslationRotationInto(out, { x: 0, y: Number.NaN }, 0)).toThrow(RangeError);
    expect(() => poseFromTranslationRotationInto(out, { x: 0, y: Number.POSITIVE_INFINITY }, 0)).toThrow(RangeError);
    expect(() => poseFromTranslationRotationInto(out, { x: 0, y: Number.NEGATIVE_INFINITY }, 0)).toThrow(RangeError);
  });

  test('angle이 non-finite이면 RangeError', () => {
    const out = makePose();
    expect(() => poseFromTranslationRotationInto(out, { x: 0, y: 0 }, Number.NaN)).toThrow(RangeError);
    expect(() => poseFromTranslationRotationInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => poseFromTranslationRotationInto(out, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });
});

// ─── poseFromTranslationRotation ───────────────────────────────────────

describe('poseFromTranslationRotation - companion', () => {
  test('새 plain { px, py, angle } object를 반환한다', () => {
    const pose = poseFromTranslationRotation({ x: 3, y: 4 }, Math.PI / 2);
    expect(pose).toEqual({ px: 3, py: 4, angle: Math.PI / 2 });
  });

  test('non-finite 입력이면 RangeError', () => {
    expect(() => poseFromTranslationRotation({ x: Number.NaN, y: 0 }, 0)).toThrow(RangeError);
    expect(() => poseFromTranslationRotation({ x: 0, y: 0 }, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
