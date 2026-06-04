import type { CircleLike, CircleWritable } from '../types';
import { createCircle } from './create-circle';
import { scaleInto } from './scale-into';

/**
 * circle의 center와 radius를 scalar로 곱한 결과를 새 plain object로 반환한다.
 *
 * radius에 Math.abs를 적용하지 않는다. 음수 scalar로 음수 radius가 되는 경우는 caller 책임이다.
 *
 * @param circle scale할 circle
 * @param scalar center 좌표와 radius에 곱할 값
 */
export function scale(circle: CircleLike, scalar: number): CircleWritable {
  return scaleInto(createCircle(), circle, scalar);
}
