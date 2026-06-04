import type { CircleLike, CircleWritable, XYInput } from '../types';
import { createCircle } from './create-circle';
import { translateInto } from './translate-into';

/**
 * circle의 center를 offset만큼 평행 이동한 결과를 새 plain object로 반환한다.
 *
 * radius는 그대로 복사한다.
 *
 * @param circle 이동할 circle
 * @param offset center에 더할 이동 벡터
 */
export function translate(circle: CircleLike, offset: XYInput): CircleWritable {
  return translateInto(createCircle(), circle, offset);
}
