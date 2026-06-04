import type { EllipseLike, MatrixLike, RotatedEllipseWritable } from '../types';
import { transformToRotatedInto } from './transform-to-rotated-into';

/**
 * axis-aligned ellipse에 2D affine matrix를 적용한 결과를 rotated ellipse plain object로 반환한다.
 *
 * 정확히 표현 가능한 조건은 linear part `[[a, c], [b, d]]`의 두 non-zero column 방향이
 * max-abs-scaled direction dot exact zero인 경우다(tolerance 없음). translate + scale, pure rotation,
 * rotation + scale, axis swap, reflection을 모두 포함한다.
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
 * column이 직교하지 않거나 non-empty ellipse에서 zero column이면 `undefined`를 반환한다.
 * max-abs-scaled exact zero guard 외 별도 finite 검사를 추가하지 않는다. guard를 통과한 finite 산술
 * 결과는 그대로 전파한다(caller 책임). non-empty ellipse의 zero-column affine image는 line segment라서
 * rotated ellipse empty 정책으로 정확히 표현하지 않는다.
 *
 * @param ellipse transform할 axis-aligned ellipse
 * @param matrix 적용할 2D affine matrix
 */
export function transformToRotated(ellipse: EllipseLike, matrix: MatrixLike): RotatedEllipseWritable | undefined {
  const out = transformToRotatedInto({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0, rotation: 0 }, ellipse, matrix);
  return out === false ? undefined : out;
}
