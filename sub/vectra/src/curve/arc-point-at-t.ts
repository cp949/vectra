import type { CenterArcLike, XYObjectWritable } from '../types';
import { arcPointAtTInto } from './arc-point-at-t-into';

/**
 * center form arc 위의 파라미터 t 위치 point를 새 object로 반환한다.
 *
 * `arcPointAtTInto`의 allocating companion. 결과는 새 plain `{ x, y }`이다.
 *
 * t는 startAngle(0)과 endAngle(1)을 선형 보간한 angle 위치다. clamp 없이 외삽을 허용한다.
 * rx <= 0 또는 ry <= 0인 degenerate arc는 center 좌표를 반환한다.
 *
 * @param centerArc center form arc input
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns 새 plain `{ x, y }` object
 */
export function arcPointAtT(centerArc: CenterArcLike, t: number): XYObjectWritable {
  return arcPointAtTInto({ x: 0, y: 0 }, centerArc, t);
}
