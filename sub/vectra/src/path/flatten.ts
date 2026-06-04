import type { PathCommand, PathFlattenOptions, XYObjectWritable } from '../types/index';
import { flattenInto } from './flatten-into';

/**
 * commands를 polyline으로 flatten한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * 첫 drawing segment 시작점을 먼저 담은 뒤 각 segment의 끝점만 순차로 담는다
 * (start point + endpoint-only sequence). curve segment는 curve flatten helper를 경유한다.
 * empty commands → 빈 배열 반환.
 * invalid numeric(NaN, Inf)은 throw 없이 전파한다.
 * 성능 최적화가 필요하면 `flattenInto`를 사용한다.
 *
 * @param commands flatten할 path command sequence
 * @param options flatten 옵션 (flatness, maxRecursion)
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function flatten(commands: readonly PathCommand[], options?: PathFlattenOptions): XYObjectWritable[] {
  return flattenInto([], commands, options);
}
