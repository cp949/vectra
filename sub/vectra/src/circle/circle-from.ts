import type { CircleLike, CircleWritable, XYInput } from '../types';
import { copyInto } from './copy-into';
import { createCircle } from './create-circle';

/**
 * `CircleLike` source의 center와 radius를 새 plain object로 복사해 반환한다.
 *
 * @param circle 복사할 source circle
 */
export function circleFrom(circle: CircleLike): CircleWritable;
/**
 * center와 radius component로 새 plain circle writable을 만든다.
 */
export function circleFrom(center: XYInput, radius: number): CircleWritable;
export function circleFrom(circleOrCenter: CircleLike | XYInput, radius?: number): CircleWritable {
  if (radius === undefined) {
    return copyInto(createCircle(), circleOrCenter as CircleLike);
  }
  return copyInto(createCircle(), circleOrCenter as XYInput, radius);
}
