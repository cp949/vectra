import type { PathCommand, PathFlattenOptions } from '../types';
import type { PointWritable } from '../types/flat-shapes.internal';
import { fromPathInto } from './from-path-into';

/**
 * path command sequence를 flatten한 새 open polyline point 배열을 반환한다.
 *
 * empty path 또는 drawing segment 없는 path는 빈 배열을 반환한다. curve/arc flatten 정책은
 * `PathFlattenOptions`를 따른다. 자세한 정책은 대응 `fromPathInto`를 따른다.
 * finite 검증은 하지 않는다. invalid numeric(NaN, Inf)은 그대로 전파한다.
 * buffer 재사용이 필요하면 `fromPathInto`를 사용한다.
 *
 * @param commands flatten할 path command sequence
 * @param options flatten 옵션. 생략하면 `{ flatness: 0.5, maxRecursion: 32 }`를 쓴다.
 */
export function fromPath(commands: readonly PathCommand[], options?: PathFlattenOptions): PointWritable[] {
  return fromPathInto([], commands, options);
}
