/**
 * pose2 matrix bridge(poseToMatrix* / poseToMatrixInto) 계약 테스트.
 *
 * 단위 행렬과 이동·회전 성분, pose의 점 변환과 행렬의 점 변환 결과, 출력 객체의 참조와 입력 검증을 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { transformPointInto } from '../../../src/matrix/transform-point-into';
import { poseToMatrix } from '../../../src/pose2/pose-to-matrix';
import { poseToMatrixInto } from '../../../src/pose2/pose-to-matrix-into';
import { transformPointByPose } from '../../../src/pose2/transform-point-by-pose';
import type { MatrixWritable } from '../../../src/types';
import type { Pose2 } from '../../../src/types/flat-shapes.internal';

/** identity로 초기화한 새 MatrixWritable seed를 만든다. */
function makeMatrix(): MatrixWritable {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}

// ─── poseToMatrixInto ──────────────────────────────────────────────────

describe('poseToMatrixInto - component convention', () => {
  test('zero pose는 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const result = poseToMatrixInto(out, { px: 0, py: 0, angle: 0 });
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
    poseToMatrixInto(out, { px: 5, py: -2, angle: Math.PI / 2 });
    expect(out.a).toBeCloseTo(0, 12);
    expect(out.b).toBeCloseTo(1, 12);
    expect(out.c).toBeCloseTo(-1, 12);
    expect(out.d).toBeCloseTo(0, 12);
    expect(out.tx).toBeCloseTo(5, 12);
    expect(out.ty).toBeCloseTo(-2, 12);
  });

  test('matrix point transform이 transformPointByPose와 일치한다', () => {
    const pose: Pose2 = { px: 7, py: -3, angle: 1.2 };
    const point = { x: 2.5, y: 4.5 };
    const matrix = poseToMatrix(pose);
    const viaMatrix = transformPointInto({ x: 0, y: 0 }, matrix, point);
    const viaPose = transformPointByPose(pose, point);
    expect(viaMatrix.x).toBeCloseTo(viaPose.x, 12);
    expect(viaMatrix.y).toBeCloseTo(viaPose.y, 12);
  });
});

// ─── non-finite ────────────────────────────────────────────────────────

describe('poseToMatrix - non-finite RangeError', () => {
  test('pose entry가 non-finite이면 RangeError', () => {
    expect(() => poseToMatrixInto(makeMatrix(), { px: Number.NaN, py: 0, angle: 0 })).toThrow(RangeError);
    expect(() => poseToMatrixInto(makeMatrix(), { px: 0, py: Number.POSITIVE_INFINITY, angle: 0 })).toThrow(RangeError);
    expect(() => poseToMatrixInto(makeMatrix(), { px: 0, py: 0, angle: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
  });
});

// ─── companion ─────────────────────────────────────────────────────────

describe('poseToMatrix - companion', () => {
  test('poseToMatrix는 새 plain matrix object를 반환한다', () => {
    const result = poseToMatrix({ px: 5, py: -2, angle: 0 });
    // c는 -sin(0) = -0이다. signed zero를 무시하고 값으로 비교한다.
    expect(result.a).toBeCloseTo(1, 12);
    expect(result.b).toBeCloseTo(0, 12);
    expect(result.c).toBeCloseTo(0, 12);
    expect(result.d).toBeCloseTo(1, 12);
    expect(result.tx).toBeCloseTo(5, 12);
    expect(result.ty).toBeCloseTo(-2, 12);
  });
});
