import type { CenterArcLike, XYObjectWritable } from '../types';
import { arcMiddleInto } from './arc-middle-into';

/**
 * center form arc의 중점(t=0.5) 좌표를 새 object로 반환한다.
 *
 * `arcMiddleInto`의 allocating companion이다.
 *
 * @param centerArc center form arc input
 */
export function arcMiddle(centerArc: CenterArcLike): XYObjectWritable {
  return arcMiddleInto({ x: 0, y: 0 }, centerArc);
}
