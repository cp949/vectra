import type { CircleLike, CircleWritable } from '../types';
import { createCircle } from './create-circle';
import { shrinkByInto } from './shrink-by-into';

/**
 * circle의 radius에서 amount를 뺀 새 CircleWritable을 반환한다.
 *
 * center는 그대로 복사된다. amount가 음수이면 radius가 늘어난다. 결과 radius에 clamp를
 * 적용하지 않는다.
 *
 * NaN/Infinity amount는 결과 radius에 그대로 전파된다. amount가 음수인 경우와 결과 radius가
 * 음수가 되는 경우는 caller 책임이다.
 *
 * @param circle 기준 circle
 * @param amount radius에서 뺄 값 (음수 허용)
 */
export function shrinkBy(circle: CircleLike, amount: number): CircleWritable {
  return shrinkByInto(createCircle(), circle, amount);
}
