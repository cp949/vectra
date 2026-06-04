import type { CenterArcLike, XYObjectWritable } from '../types';
import { arcNormalAtInto } from './arc-normal-at-into';

/**
 * center form arc 위의 파라미터 t 위치 unit normal vector를 새 object로 반환한다.
 *
 * `arcNormalAtInto`의 allocating companion이다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `arcNormalAtInto`와 동일하다.
 * @param centerArc center form arc input
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function arcNormalAt(centerArc: CenterArcLike, t: number): XYObjectWritable {
  return arcNormalAtInto({ x: 0, y: 0 }, centerArc, t);
}
