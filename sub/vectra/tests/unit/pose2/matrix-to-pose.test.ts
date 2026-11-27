/**
 * pose2 matrix → pose bridge(matrixToPose* / matrixToPoseInto) 계약 테스트.
 *
 * poseToMatrix round-trip, pure translation+rotation, object/tuple matrix input,
 * out object identity, reflection/scale/skew rigid 판정 실패, 실패 시 out 미수정,
 * non-finite component RangeError, invalid epsilon RangeError, companion undefined 실패를
 * 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { matrixToPose } from '../../../src/pose2/matrix-to-pose';
import { matrixToPoseInto } from '../../../src/pose2/matrix-to-pose-into';
import { poseToMatrix } from '../../../src/pose2/pose-to-matrix';
import type { MatrixLike } from '../../../src/types';
import type { Pose2Writable } from '../../../src/types/flat-shapes.internal';

/** 원점/zero angle로 초기화한 새 Pose2Writable seed를 만든다. */
function makePose(): Pose2Writable {
  return { px: 0, py: 0, angle: 0 };
}

/** rigid rotation matrix component를 만든다. */
function rigidMatrix(angle: number, tx: number, ty: number): MatrixLike {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { a: cos, b: sin, c: -sin, d: cos, tx, ty };
}

// ─── matrixToPoseInto - rigid 성공 ────────────────────────────────────────

describe('matrixToPoseInto - rigid 성공', () => {
  test('poseToMatrix 결과를 round-trip으로 복원한다', () => {
    const angle = 1.2;
    const matrix = poseToMatrix({ px: 7, py: -3, angle });
    const out = makePose();
    const result = matrixToPoseInto(out, matrix);
    expect(result).toBe(out);
    expect(out.px).toBeCloseTo(7, 12);
    expect(out.py).toBeCloseTo(-3, 12);
    expect(out.angle).toBeCloseTo(angle, 12);
  });

  test('pure translation matrix는 angle 0과 translation을 복원한다', () => {
    const out = makePose();
    matrixToPoseInto(out, { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: -2 });
    expect(out.px).toBeCloseTo(5, 12);
    expect(out.py).toBeCloseTo(-2, 12);
    expect(out.angle).toBeCloseTo(0, 12);
  });

  test('90도 rotation matrix가 angle을 복원한다', () => {
    const out = makePose();
    matrixToPoseInto(out, rigidMatrix(Math.PI / 2, 0, 0));
    expect(out.angle).toBeCloseTo(Math.PI / 2, 12);
  });

  test('object matrix input과 tuple matrix input이 같은 결과를 낸다', () => {
    const angle = 0.7;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const objectOut = matrixToPoseInto(makePose(), { a: cos, b: sin, c: -sin, d: cos, tx: 3, ty: 4 });
    const tupleOut = matrixToPoseInto(makePose(), [cos, sin, -sin, cos, 3, 4]);
    expect(tupleOut).toEqual(objectOut);
  });

  test('atan2 signed zero 경계에서 -π를 π로 맞춘다', () => {
    // a = -1, b = -0 인 180도 rotation. atan2(-0, -1) = -π → π로 정규화한다.
    const out = makePose();
    matrixToPoseInto(out, { a: -1, b: -0, c: 0, d: -1, tx: 0, ty: 0 });
    expect(out.angle).toBe(Math.PI);
  });

  test('out과 matrix가 같은 객체여도 위치와 각도를 복원한다', () => {
    const shared = { ...rigidMatrix(0.5, 5, -2), px: 0, py: 0, angle: 0 };
    const result = matrixToPoseInto(shared, shared);
    expect(result).toBe(shared);
    expect(shared.px).toBe(5);
    expect(shared.py).toBe(-2);
    expect(shared.angle).toBeCloseTo(0.5, 12);
  });
});

// ─── matrixToPoseInto - rigid 판정 실패 ───────────────────────────────────

describe('matrixToPoseInto - rigid 판정 실패', () => {
  test('scale matrix는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePose();
    const result = matrixToPoseInto(out, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(result).toBe(false);
    expect(out.px).toBe(0);
    expect(out.py).toBe(0);
    expect(out.angle).toBe(0);
  });

  test('skew matrix는 false를 반환한다', () => {
    const out = makePose();
    expect(matrixToPoseInto(out, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('reflection matrix(det -1)는 false를 반환한다', () => {
    // column length 1, dot 0이지만 determinant = -1이라 reflection이다.
    const out = makePose();
    expect(matrixToPoseInto(out, { a: 1, b: 0, c: 0, d: -1, tx: 0, ty: 0 })).toBe(false);
  });

  test('회전된 pure reflection(det -1, 정규직교 column)도 false를 반환한다', () => {
    // 30도 선 대칭: a=cos60, b=sin60, c=sin60, d=-cos60. column length 1, dot 0, det -1.
    // axis-aligned가 아니어도 rigid 판정이 determinant로 reflection을 거른다.
    const twoTheta = Math.PI / 3;
    const out = makePose();
    const result = matrixToPoseInto(out, {
      a: Math.cos(twoTheta),
      b: Math.sin(twoTheta),
      c: Math.sin(twoTheta),
      d: -Math.cos(twoTheta),
      tx: 0,
      ty: 0,
    });
    expect(result).toBe(false);
  });

  test('zero matrix(degenerate, det 0)는 false를 반환한다', () => {
    const out = makePose();
    expect(matrixToPoseInto(out, { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 })).toBe(false);
  });

  test('실패 시 동결한 출력에도 쓰기를 시도하지 않는다', () => {
    const out = Object.freeze(makePose());
    expect(matrixToPoseInto(out, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 })).toBe(false);
  });

  test('epsilon을 키우면 약간 비rigid한 matrix도 성공한다', () => {
    const out = makePose();
    const result = matrixToPoseInto(out, { a: 1.0001, b: 0, c: 0, d: 1.0001, tx: 0, ty: 0 }, { epsilon: 1e-3 });
    expect(result).toBe(out);
  });
});

// ─── non-finite / invalid epsilon ────────────────────────────────────────

describe('matrixToPoseInto - 입력 검증', () => {
  test('matrix component가 non-finite이면 RangeError', () => {
    expect(() => matrixToPoseInto(makePose(), { a: Number.NaN, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toThrow(RangeError);
    expect(() => matrixToPoseInto(makePose(), { a: 1, b: 0, c: 0, d: 1, tx: Number.POSITIVE_INFINITY, ty: 0 })).toThrow(
      RangeError
    );
    expect(() => matrixToPoseInto(makePose(), { a: 1, b: 0, c: 0, d: Number.NEGATIVE_INFINITY, tx: 0, ty: 0 })).toThrow(
      RangeError
    );
  });

  test('invalid epsilon이면 RangeError', () => {
    expect(() => matrixToPoseInto(makePose(), rigidMatrix(0, 0, 0), { epsilon: -1 })).toThrow(RangeError);
    expect(() => matrixToPoseInto(makePose(), rigidMatrix(0, 0, 0), { epsilon: Number.NaN })).toThrow(RangeError);
    expect(() => matrixToPoseInto(makePose(), rigidMatrix(0, 0, 0), { epsilon: Number.POSITIVE_INFINITY })).toThrow(
      RangeError
    );
  });
});

// ─── companion ───────────────────────────────────────────────────────────

describe('matrixToPose - companion', () => {
  test('rigid matrix는 새 plain pose object를 반환한다', () => {
    const result = matrixToPose(rigidMatrix(0.5, 2, 3));
    expect(result).not.toBeUndefined();
    expect(result?.px).toBeCloseTo(2, 12);
    expect(result?.py).toBeCloseTo(3, 12);
    expect(result?.angle).toBeCloseTo(0.5, 12);
  });

  test('rigid가 아니면 undefined를 반환한다', () => {
    expect(matrixToPose({ a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 })).toBeUndefined();
  });

  test('호출마다 새 pose object를 반환한다(공유 storage 없음)', () => {
    const matrix = rigidMatrix(0.5, 2, 3);
    const r1 = matrixToPose(matrix);
    const r2 = matrixToPose(matrix);
    expect(r1).not.toBe(r2);
  });

  test('non-finite component는 RangeError', () => {
    expect(() => matrixToPose({ a: Number.NaN, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toThrow(RangeError);
  });
});
