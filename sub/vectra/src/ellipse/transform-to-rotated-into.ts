import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, MatrixLike, RotatedEllipseWritable, XYWritable } from '../types';

function directionDot(a: number, b: number, c: number, d: number): number {
  const column1Scale = Math.max(Math.abs(a), Math.abs(b));
  const column2Scale = Math.max(Math.abs(c), Math.abs(d));
  return (a / column1Scale) * (c / column2Scale) + (b / column1Scale) * (d / column2Scale);
}

/**
 * axis-aligned ellipse에 2D affine matrix를 적용한 결과를 rotated ellipse로 out에 기록하고
 * out을 반환한다.
 *
 * 정확히 표현 가능한 조건은 linear part `[[a, c], [b, d]]`의 두 non-zero column 방향이
 * max-abs-scaled direction dot exact zero인 경우다(tolerance 없음). 직교 column은 image ellipse의 두
 * semi-axis가 서로 수직임을 보장한다. translate + scale, pure rotation, rotation + scale,
 * axis swap, reflection을 모두 포함한다.
 *
 * 성공 시:
 * - rotation = atan2(b, a) (image x-axis = column1 방향).
 * - radiusX = rx * Math.hypot(a, b), radiusY = ry * Math.hypot(c, d). column length는 비음수이므로
 *   reflection이어도 radii 부호는 입력 rx/ry 부호를 따른다. `Math.abs` 적용 없음.
 * - center = (a*cx + c*cy + tx, b*cx + d*cy + ty).
 *
 * 결과는 image ellipse outline이다. det = a*d - b*c < 0(reflection)이면 outline은 정확하지만
 * rotatedPointAtAngle의 parameter winding은 matrix를 적용한 source parameterization과 일치하지 않는다
 * (같은 set, 반대 회전 방향). per-angle 대응이 필요하면 caller가 source point에 matrix를 직접 적용한다.
 *
 * column이 직교하지 않거나, non-empty ellipse에서 zero column이면 `false`를 반환하고 out을 수정하지
 * 않는다. max-abs-scaled exact zero guard 외 별도 finite 검사를 추가하지 않는다. guard를 통과한
 * finite 산술 결과는 그대로 전파한다(caller 책임). zero column은 해당 방향 radius를 0으로 만들지만,
 * non-empty ellipse의 affine image는 line segment라서 rotated ellipse empty 정책과 충돌한다.
 * out.center가 input ellipse center와 alias되어도 안전하다.
 *
 * @param out rotated ellipse를 기록할 writable output
 * @param ellipse transform할 axis-aligned ellipse
 * @param matrix 적용할 2D affine matrix
 */
export function transformToRotatedInto<Out extends RotatedEllipseWritable<XYWritable>>(
  out: Out,
  ellipse: EllipseLike,
  matrix: MatrixLike
): Out | false {
  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);

  // aliasing 안전: out에 기록하기 전에 모든 입력을 local로 읽는다
  const center = readEllipseCenter(ellipse);
  const cx = readX(center);
  const cy = readY(center);
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  const column1Length = Math.hypot(a, b);
  const column2Length = Math.hypot(c, d);
  const hasZeroColumn = column1Length === 0 || column2Length === 0;

  if (rx > 0 && ry > 0 && hasZeroColumn) return false;

  if (!hasZeroColumn) {
    const scaledDirectionDot = directionDot(a, b, c, d);
    // column 직교 조건 위반(shear)은 rotated ellipse로 표현 불가하므로 out 미수정 후 false
    if (scaledDirectionDot !== 0) return false;
  }

  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);

  writeXY(out.center, a * cx + c * cy + tx, b * cx + d * cy + ty);
  out.radiusX = rx * column1Length;
  out.radiusY = ry * column2Length;
  out.rotation = Math.atan2(b, a);
  return out;
}
