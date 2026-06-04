import type { EllipseLike, EllipseWritable, MatrixLike } from '../types';
import { createEllipse } from './create-ellipse';
import { transformInto } from './transform-into';

/**
 * axis-aligned ellipse로 정확히 표현 가능한 matrix만 적용해 새 plain object로 반환한다.
 *
 * 지원 matrix는 두 가지뿐이다:
 * - translate + axis-aligned scale: `b === 0 && c === 0`. `radiusX *= a`, `radiusY *= d`.
 * - 90도 축 swap / reflection: `a === 0 && d === 0`. `radiusX = ry * c`, `radiusY = rx * b` (local scalar 기준).
 *
 * 회전/전단(rotated/sheared) matrix는 axis-aligned `EllipseLike`로 표현 불가하므로
 * `undefined`를 반환한다. exact zero 비교만 사용한다 (tolerance 없음).
 * 음수 scale/reflection으로 음수 radius가 되는 경우는 caller 책임이다. `Math.abs`를 적용하지 않는다.
 * non-finite matrix component가 exact zero guard를 통과한 경우 산술 결과로 전파한다.
 *
 * @param ellipse transform할 ellipse
 * @param matrix 적용할 2D affine matrix
 */
export function transform(ellipse: EllipseLike, matrix: MatrixLike): EllipseWritable | undefined {
  const out = createEllipse();
  return transformInto(out, ellipse, matrix) === false ? undefined : out;
}
