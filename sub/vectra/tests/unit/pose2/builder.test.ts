/**
 * pose2 builder(poseFromTranslationRotationInto / poseFromTranslationRotation) 계약 테스트.
 *
 * object/tuple translation input, object/tuple out.position storage, aliasing 안전,
 * non-finite RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import { poseFromTranslationRotation } from '../../../src/pose2/pose-from-translation-rotation';
import { poseFromTranslationRotationInto } from '../../../src/pose2/pose-from-translation-rotation-into';
import type { Pose2Writable, XYTupleWritable } from '../../../src/types';

/** object position storage를 가진 새 Pose2Writable seed를 만든다. */
function makePose(): Pose2Writable {
  return { position: { x: 0, y: 0 }, angle: 0 };
}

/** unknown 값을 x/y object로 본다. */
function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── poseFromTranslationRotationInto ───────────────────────────────────

describe('poseFromTranslationRotationInto - 기본', () => {
  test('object translation과 angle을 out에 기록하고 out을 반환한다', () => {
    const out = makePose();
    const result = poseFromTranslationRotationInto(out, { x: 3, y: 4 }, Math.PI / 6);
    expect(result).toBe(out);
    expect(asXY(out.position).x).toBeCloseTo(3, 12);
    expect(asXY(out.position).y).toBeCloseTo(4, 12);
    expect(out.angle).toBeCloseTo(Math.PI / 6, 12);
  });

  test('tuple translation input을 지원한다', () => {
    const out = makePose();
    poseFromTranslationRotationInto(out, [5, -2], 1);
    expect(asXY(out.position).x).toBeCloseTo(5, 12);
    expect(asXY(out.position).y).toBeCloseTo(-2, 12);
    expect(out.angle).toBeCloseTo(1, 12);
  });
});

describe('poseFromTranslationRotationInto - tuple position storage', () => {
  test('tuple out.position storage에 기록한다', () => {
    const position: [number, number] = [0, 0];
    const out: Pose2Writable<XYTupleWritable> = { position, angle: 0 };
    poseFromTranslationRotationInto(out, { x: 7, y: 8 }, 2);
    expect(position).toEqual([7, 8]);
    expect(out.angle).toBeCloseTo(2, 12);
  });
});

describe('poseFromTranslationRotationInto - aliasing', () => {
  test('translation과 out.position이 같은 object여도 안전하다', () => {
    const shared = { x: 9, y: 10 };
    const out: Pose2Writable = { position: shared, angle: 0 };
    poseFromTranslationRotationInto(out, shared, 0.5);
    expect(shared.x).toBeCloseTo(9, 12);
    expect(shared.y).toBeCloseTo(10, 12);
    expect(out.angle).toBeCloseTo(0.5, 12);
  });
});

describe('poseFromTranslationRotationInto - 타입', () => {
  test('subtype out을 그대로 반환한다', () => {
    const out: Pose2Writable<XYTupleWritable> = { position: [0, 0], angle: 0 };
    const result = poseFromTranslationRotationInto(out, [1, 2], 0);
    expectTypeOf(result).toEqualTypeOf<Pose2Writable<XYTupleWritable>>();
    expect(result).toBe(out);
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
  test('새 plain { position, angle } object를 반환한다', () => {
    const pose = poseFromTranslationRotation({ x: 3, y: 4 }, Math.PI / 2);
    expect(pose).toEqual({ position: { x: 3, y: 4 }, angle: Math.PI / 2 });
  });

  test('tuple translation input을 지원한다', () => {
    const pose = poseFromTranslationRotation([5, 6], 0);
    expect(asXY(pose.position).x).toBeCloseTo(5, 12);
    expect(asXY(pose.position).y).toBeCloseTo(6, 12);
    expect(pose.angle).toBeCloseTo(0, 12);
  });

  test('non-finite 입력이면 RangeError', () => {
    expect(() => poseFromTranslationRotation({ x: Number.NaN, y: 0 }, 0)).toThrow(RangeError);
    expect(() => poseFromTranslationRotation({ x: 0, y: 0 }, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
