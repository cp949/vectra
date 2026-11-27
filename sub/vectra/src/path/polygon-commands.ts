import type { Polygon } from '../types/flat-shapes.internal';
import type { PathCommand } from '../types/index';
import { polygonCommandsInto } from './polygon-commands-into';

/**
 * polygon을 move + line × (N - 1) + close command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * 점 0개 → 빈 배열. 점 1개 이상 → move + line × (N-1) + close.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `polygonCommandsInto`를 사용한다.
 *
 * @param polygon 변환할 다각형 좌표 배열 (`[x0, y0, x1, y1, …]`, 길이는 짝수)
 * @returns 새로 만든 PathCommand 배열
 */
export function polygonCommands(polygon: Polygon): PathCommand[] {
  return polygonCommandsInto([], polygon);
}
