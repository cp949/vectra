import type { PathCommand, PolylineLike } from '../types';
import { toPathInto } from './to-path-into';

/**
 * polyline을 `move` + `line` command sequence로 만든 새 PathCommand 배열을 반환한다.
 *
 * empty polyline은 빈 배열, single-point polyline은 `move` 하나를 반환한다. 자세한 정책은
 * 대응 `toPathInto`를 따른다.
 * finite 검증은 하지 않는다. invalid numeric(NaN, Inf)은 그대로 전파한다.
 * buffer 재사용이 필요하면 `toPathInto`를 사용한다.
 *
 * @param polyline 변환할 polyline
 */
export function toPath(polyline: PolylineLike): PathCommand[] {
  return toPathInto([], polyline);
}
