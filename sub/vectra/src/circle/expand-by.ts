import type { CircleLike, CircleWritable } from '../types';
import { createCircle } from './create-circle';
import { expandByInto } from './expand-by-into';

/**
 * circle의 radius에 amount를 더한 결과를 새 plain object로 반환한다.
 *
 * amount가 음수이면 radius가 줄어든다. 결과 radius에 clamp를 적용하지 않는다.
 *
 * @param circle 기준 circle
 * @param amount radius에 더할 값 (음수 허용)
 */
export function expandBy(circle: CircleLike, amount: number): CircleWritable {
  return expandByInto(createCircle(), circle, amount);
}
