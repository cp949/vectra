import type { MatrixLike, MatrixToPoseOptions, Pose2Writable } from '../types';
import { matrixToPoseInto } from './matrix-to-pose-into';

/**
 * rigid affine matrix를 rigid pose로 복원해 새 plain pose object로 반환하고, rigid가 아니면
 * `undefined`를 반환한다.
 *
 * `{ position: { x: tx, y: ty }, angle: Math.atan2(b, a) }`를 반환한다. `poseToMatrix`의 역방향이며
 * rigid matrix에서 round-trip이 성립한다. rigid 판정은 `options.epsilon`(생략 시 `1e-9`) 허용 오차로
 * 한다. column length(`Math.hypot(a, b)`, `Math.hypot(c, d)`)가 `1`에, column dot product
 * (`a·c + b·d`)가 `0`에, determinant(`a·d − b·c`)가 `1`에 epsilon 이내여야 한다. scale/skew/shear
 * 또는 determinant가 `-1`인 reflection matrix는 rigid가 아니므로 `undefined`다.
 *
 * matrix component `a`/`b`/`c`/`d`/`tx`/`ty` 중 하나라도 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 rigid 판정 이전에 `RangeError`다. `epsilon`이 non-finite이거나 음수이면
 * `RangeError`다. angle 결과는 normalize하지 않되, `atan2`가 signed zero 경계에서 반환하는 `-π`만
 * 문서화한 `(-π, π]` 범위를 지키도록 `π`로 맞춘다.
 *
 * @param matrix pose로 복원할 rigid affine matrix
 * @param options rigid 판정 옵션. `epsilon` 생략 시 `1e-9`. non-finite/음수 epsilon은 `RangeError`.
 */
export function matrixToPose(matrix: MatrixLike, options?: MatrixToPoseOptions): Pose2Writable | undefined {
  const out = matrixToPoseInto({ position: { x: 0, y: 0 }, angle: 0 }, matrix, options);
  return out === false ? undefined : out;
}
