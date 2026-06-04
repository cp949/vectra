/**
 * pose2 matrix bridge(poseToMatrix* / poseToMatrixInto) 계약 테스트.
 *
 * zero pose의 identity matrix, translation+rotation pose의 component convention,
 * matrix point transform과 transformPointByPose 동치, out object identity, tuple pose input,
 * non-finite RangeError, companion plain matrix 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { transformPointInto } from '../../../src/matrix/transform-point-into';
import { poseToMatrix } from '../../../src/pose2/pose-to-matrix';
import { poseToMatrixInto } from '../../../src/pose2/pose-to-matrix-into';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import type { MatrixWritable, Pose2Like } from '../../../src/types';

/** identity로 초기화한 새 MatrixWritable seed를 만든다. */
function makeMatrix(): MatrixWritable {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}

// ─── poseToMatrixInto ──────────────────────────────────────────────────

describe('poseToMatrixInto - component convention', () => {
  test('zero pose는 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const result = poseToMatrixInto(out, { position: { x: 0, y: 0 }, angle: 0 });
    expect(result).toBe(out);
    // c는 -sin(0) = -0이다. signed zero를 무시하고 값으로 비교한다.
    expect(out.a).toBeCloseTo(1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(1, 12);
    expect(out.tx).toBeCloseTo(0, 12);
    expect(out.ty).toBeCloseTo(0, 12);
  });

  test('translation + rotation pose가 { a: cos, b: sin, c: -sin, d: cos, tx, ty }를 기록한다', () => {
    const out = makeMatrix();
    poseToMatrixInto(out, { position: { x: 5, y: -2 }, angle: Math.PI / 2 });
    expect(out.a).toBeCloseTo(0, 12);
    expect(out.b).toBeCloseTo(1, 12);
    expect(out.c).toBeCloseTo(-1, 12);
    expect(out.d).toBeCloseTo(0, 12);
    expect(out.tx).toBeCloseTo(5, 12);
    expect(out.ty).toBeCloseTo(-2, 12);
  });

  test('matrix point transform이 transformPointByPose와 일치한다', () => {
    const pose: Pose2Like = { position: { x: 7, y: -3 }, angle: 1.2 };
    const point = { x: 2.5, y: 4.5 };
    const matrix = poseToMatrix(pose);
    const viaMatrix = transformPointInto({ x: 0, y: 0 }, matrix, point);
    const viaPose = transformPointByPose(pose, point);
    expect(viaMatrix.x).toBeCloseTo(viaPose.x, 12);
    expect(viaMatrix.y).toBeCloseTo(viaPose.y, 12);
  });

  test('tuple pose input과 object pose input이 같은 결과를 낸다', () => {
    const objectOut = poseToMatrixInto(makeMatrix(), { position: { x: 3, y: 4 }, angle: 0.7 });
    const tupleOut = poseToMatrixInto(makeMatrix(), [[3, 4], 0.7]);
    expect(tupleOut).toEqual(objectOut);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('poseToMatrix - non-finite RangeError', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    expect(() => poseToMatrixInto(makeMatrix(), { position: { x: Number.NaN, y: 0 }, angle: 0 })).toThrow(RangeError);
    expect(() => poseToMatrixInto(makeMatrix(), { position: { x: 0, y: Number.POSITIVE_INFINITY }, angle: 0 })).toThrow(
      RangeError
    );
    expect(() => poseToMatrixInto(makeMatrix(), { position: { x: 0, y: 0 }, angle: Number.NEGATIVE_INFINITY })).toThrow(
      RangeError
    );
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('poseToMatrix - companion', () => {
  test('poseToMatrix는 새 plain matrix object를 반환한다', () => {
    const result = poseToMatrix({ position: { x: 5, y: -2 }, angle: 0 });
    // c는 -sin(0) = -0이다. signed zero를 무시하고 값으로 비교한다.
    expect(result.a).toBeCloseTo(1, 12);
    expect(result.b).toBeCloseTo(0, 12);
    expect(result.c).toBeCloseTo(0, 12);
    expect(result.d).toBeCloseTo(1, 12);
    expect(result.tx).toBeCloseTo(5, 12);
    expect(result.ty).toBeCloseTo(-2, 12);
  });
});
