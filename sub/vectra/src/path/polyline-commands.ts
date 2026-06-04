import type { PathCommand, PolylineLike } from '../types/index';
import { polylineCommandsInto } from './polyline-commands-into';

/**
 * polyline을 move + line × (N - 1) command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 점 0개 → 빈 배열. 점 1개 → move만.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `polylineCommandsInto`를 사용한다.
 *
 * @param polyline 변환할 polyline input
 * @returns 새로 만든 PathCommand 배열
 */
export function polylineCommands(polyline: PolylineLike): PathCommand[] {
  return polylineCommandsInto([], polyline);
}
