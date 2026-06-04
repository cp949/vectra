import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, EllipseWritable, MatrixLike, XYWritable } from '../types';

/**
 * axis-aligned ellipse로 정확히 표현 가능한 matrix만 적용해 out에 기록하고 out을 반환한다.
 *
 * 지원 matrix는 두 가지뿐이다:
 * - translate + axis-aligned scale: `b === 0 && c === 0`. `radiusX *= a`, `radiusY *= d`.
 * - 90도 축 swap / reflection: `a === 0 && d === 0`. `radiusX = ry * c`, `radiusY = rx * b` (local scalar 기준).
 *
 * 위 두 형태가 아니면 회전/전단 결과가 rotated ellipse이므로 `EllipseLike`로 표현 불가하여
 * `false`를 반환하고 `out`을 수정하지 않는다. exact zero 비교만 사용한다 (tolerance 없음).
 * 음수 scale/reflection으로 음수 radius가 되는 경우는 caller 책임이다. `Math.abs`를 적용하지 않는다.
 * non-finite matrix component가 exact zero guard를 통과한 경우 산술 결과로 전파한다.
 * 성공 시 center는 full matrix transform(`a*x + c*y + tx`, `b*x + d*y + ty`)을 적용한다.
 * `out.center`가 `ellipse.center`와 alias되어도 안전하다.
 *
 * @param out transform 결과를 기록할 writable output
 * @param ellipse transform할 ellipse
 * @param matrix 적용할 2D affine matrix
 */
export function transformInto<Out extends EllipseWritable<XYWritable>>(
  out: Out,
  ellipse: EllipseLike,
  matrix: MatrixLike
): Out | false {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);

  const axisAligned = b === 0 && c === 0;
  const axisSwap = !axisAligned && a === 0 && d === 0;
  if (!axisAligned && !axisSwap) return false;

  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);
  // aliasing 안전: out에 기록하기 전에 모든 입력을 local로 읽는다
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  const newCx = a * cx + c * cy + tx;
  const newCy = b * cx + d * cy + ty;
  writeXY(out.center, newCx, newCy);
  if (axisAligned) {
    out.radiusX = rx * a;
    out.radiusY = ry * d;
  } else {
    out.radiusX = ry * c;
    out.radiusY = rx * b;
  }
  return out;
}
