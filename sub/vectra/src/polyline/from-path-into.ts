import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathFlattenOptions, XYObjectWritable } from '../types';

/**
 * path command sequence를 flatten해 open polyline point list로 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * curve/arc는 `PathFlattenOptions`(flatness, maxRecursion) 정책으로 flatten한다. 기본값은
 * `flattenInto` 기본값(flatness `0.5`, maxRecursion `32`)을 따른다.
 *
 * - empty path 또는 drawing segment 없는 path(move-only): 빈 point 배열을 반환한다.
 * - line/curve/arc segment: 첫 drawing segment 시작점을 먼저 push한 뒤 끝점만 순차 push한다.
 * - close command: flatten 결과 정책을 그대로 따른다. close segment endpoint가 subpath start면 point list에 포함된다.
 *
 * finite 검증은 하지 않는다. invalid numeric(NaN, Inf)은 그대로 전파한다.
 * path domain의 flatten internal helper를 공유한다.
 *
 * @param outPoints 결과 object point를 기록할 mutable 배열
 * @param commands flatten할 path command sequence
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function fromPathInto<Out extends XYObjectWritable[]>(
  outPoints: Out,
  commands: readonly PathCommand[],
  options?: PathFlattenOptions
): Out {
  return flattenPathInto(outPoints, commands, options);
}
