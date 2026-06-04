import type { PathCommand, PathFlattenOptions, XYObjectWritable } from '../types/index';
import { flattenPathInto } from './flatten.internal';

/**
 * commands를 out point 배열에 polyline으로 기록하고 out을 반환한다.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * empty commands → out을 clear만 하고 반환한다.
 *
 * - 첫 drawing segment 시작점을 먼저 push한 뒤 끝점만 순차 push한다.
 * - curve segment는 curve flatten helper를 경유한다.
 * - invalid numeric(NaN, Inf)은 throw 없이 전파한다.
 *
 * @param out - 결과 object point를 기록할 mutable 배열
 * @param commands - flatten할 path command sequence
 * @param options - flatten 옵션 (flatness, maxRecursion)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function flattenInto<Out extends XYObjectWritable[]>(
  out: Out,
  commands: readonly PathCommand[],
  options?: PathFlattenOptions
): Out {
  return flattenPathInto(out, commands, options);
}
