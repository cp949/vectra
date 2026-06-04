import type { PathCommand, PolygonLike } from '../types/index';
import { polygonCommandsInto } from './polygon-commands-into';

/**
 * polygon을 move + line × (N - 1) + close command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 점 0개 → 빈 배열. 점 1개 이상 → move + line × (N-1) + close.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `polygonCommandsInto`를 사용한다.
 *
 * @param polygon 변환할 polygon input
 * @returns 새로 만든 PathCommand 배열
 */
export function polygonCommands(polygon: PolygonLike): PathCommand[] {
  return polygonCommandsInto([], polygon);
}
