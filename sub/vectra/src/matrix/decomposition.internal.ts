import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike } from '../types';

/**
 * matrix decomposition core helper 결과 shape.
 *
 * scalar-only 결과로 caller-side object 다형성이 없다. decomposition leaf module이 이 결과를
 * 받아 caller-provided writable에 기록한다.
 */
export interface MatrixDecompositionScalars {
  /** translation x */
  tx: number;

  /** translation y */
  ty: number;

  /** rotation angle (radian, (-π, π] 정규화) */
  rotation: number;

  /** scaling x. 항상 비음수. */
  scalingX: number;

  /** scaling y. reflection은 음수. */
  scalingY: number;

  /** skewing x (radian, (-π, π] 정규화) */
  skewingX: number;

  /** skewing y. 단일 skewX convention에서 항상 0. */
  skewingY: number;
}

function normalizeAtan2(angle: number): number {
  if (angle === -Math.PI) return Math.PI;
  // -0을 +0으로 정규화한다. atan2 spec상 -0 입력이 -0 결과를 만들 수 있다.
  if (angle === 0) return 0;
  return angle;
}

/**
 * matrix를 `T·R·S·K(skewX)`로 분해한 scalar 결과를 반환한다.
 *
 * 분기:
 * - `a² + b² > 0`: x-basis 기반 primary 분해.
 * - primary에 진입하지 않고 `c² + d² > 0`: y-basis 기반 fallback. scalingX = 0.
 * - 두 분기 비교가 모두 false: 모두 0.
 *
 * matrix component에 NaN/Infinity가 있으면 검증하지 않는다. `r2 > 0` → `s2 > 0` → zero
 * 순서로 분기하고, 각 분기 안의 산술은 JS 결과를 따른다. NaN 비교는 `false`이므로 해당 basis
 * 분기를 건너뛴다. 다른 basis가 finite non-zero이면 fallback에 진입하고, 두 비교가 모두 false면
 * zero 분기에 진입한다.
 *
 * `Math.atan2`가 `-π`를 반환하면 `π`로, `-0`을 반환하면 `+0`으로 정규화한다.
 */
export function decomposeMatrixCore(matrix: MatrixLike): MatrixDecompositionScalars {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);

  const r = Math.hypot(a, b);
  const s = Math.hypot(c, d);
  const r2 = a * a + b * b;
  const s2 = c * c + d * d;

  if (r2 > 0) {
    const det = a * d - b * c;
    return {
      tx,
      ty,
      rotation: normalizeAtan2(Math.atan2(b, a)),
      scalingX: r,
      scalingY: det / r,
      skewingX: normalizeAtan2(Math.atan2(a * c + b * d, r2)),
      skewingY: 0,
    };
  }

  if (s2 > 0) {
    return {
      tx,
      ty,
      rotation: normalizeAtan2(Math.atan2(-c, d)),
      scalingX: 0,
      scalingY: s,
      skewingX: 0,
      skewingY: 0,
    };
  }

  return {
    tx,
    ty,
    rotation: 0,
    scalingX: 0,
    scalingY: 0,
    skewingX: 0,
    skewingY: 0,
  };
}
