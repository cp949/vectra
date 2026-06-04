import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { validatePoseEpsilon } from '../internal/pose2';
import { writeXY } from '../internal/xy';
import type { MatrixLike, MatrixToPoseOptions, Pose2Writable, XYWritable } from '../types';

/**
 * rigid affine matrix를 rigid pose로 복원해 out에 기록하고, rigid가 아니면 `false`를 반환한다.
 *
 * `matrix` domain의 component convention(`{ a: cos, b: sin, c: -sin, d: cos, tx, ty }`)을
 * 역으로 읽어 `out.position = { tx, ty }`, `out.angle = Math.atan2(b, a)`를 기록한다.
 * `poseToMatrixInto`의 역방향이며 rigid matrix에서 round-trip이 성립한다.
 *
 * rigid 판정은 `options.epsilon`(생략 시 `1e-9`) 허용 오차로 한다. column length
 * (`Math.hypot(a, b)`, `Math.hypot(c, d)`)가 `1`에, column dot product(`a·c + b·d`)가 `0`에,
 * determinant(`a·d − b·c`)가 `1`에 epsilon 이내여야 한다. scale/skew/shear 또는 determinant가
 * `-1`인 reflection matrix는 rigid가 아니므로 `false`를 반환하고 `out`을 수정하지 않는다.
 *
 * matrix component `a`/`b`/`c`/`d`/`tx`/`ty` 중 하나라도 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 rigid 판정 이전에 `RangeError`다. `epsilon`이 non-finite이거나 음수이면
 * `RangeError`다. angle 결과는 normalize하지 않되, `atan2`가 signed zero 경계에서 반환하는 `-π`만
 * 문서화한 `(-π, π]` 범위를 지키도록 `π`로 맞춘다. matrix component를 먼저 모두 읽으므로
 * `out.position`이 matrix object와 같은 storage여도 안전하다.
 *
 * @param out pose를 기록할 writable output
 * @param matrix pose로 복원할 rigid affine matrix
 * @param options rigid 판정 옵션. `epsilon` 생략 시 `1e-9`. non-finite/음수 epsilon은 `RangeError`.
 */
export function matrixToPoseInto<Out extends Pose2Writable<XYWritable>>(
  out: Out,
  matrix: MatrixLike,
  options?: MatrixToPoseOptions
): Out | false {
  // aliasing 안전 - matrix component를 먼저 모두 읽은 후 기록한다
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c) ||
    !Number.isFinite(d) ||
    !Number.isFinite(tx) ||
    !Number.isFinite(ty)
  ) {
    throw new RangeError(
      `matrixToPose requires finite matrix components, got (a=${String(a)}, b=${String(b)}, c=${String(c)}, d=${String(d)}, tx=${String(tx)}, ty=${String(ty)})`
    );
  }

  const epsilon = options?.epsilon ?? 1e-9;
  validatePoseEpsilon(epsilon, 'epsilon');

  // rigid 판정: column length 1, column dot product 0, determinant 1. reflection(det -1)은 실패.
  const col1Length = Math.hypot(a, b);
  const col2Length = Math.hypot(c, d);
  const dot = a * c + b * d;
  const determinant = a * d - b * c;
  if (
    Math.abs(col1Length - 1) > epsilon ||
    Math.abs(col2Length - 1) > epsilon ||
    Math.abs(dot) > epsilon ||
    Math.abs(determinant - 1) > epsilon
  ) {
    return false;
  }

  let angle = Math.atan2(b, a);
  // atan2(-0, 음수)는 -π를 반환한다. 문서화한 (-π, π] 범위를 지키도록 π로 맞춘다.
  if (angle === -Math.PI) {
    angle = Math.PI;
  }

  writeXY(out.position, tx, ty);
  out.angle = angle;
  return out;
}
