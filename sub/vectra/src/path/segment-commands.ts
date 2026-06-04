import type { PathCommand, SegmentLike } from '../types/index';
import { segmentCommandsInto } from './segment-commands-into';

/**
 * segment를 move + line 2 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 * 성능 최적화가 필요하면 `segmentCommandsInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `segmentCommandsInto`와 동일하다.
 * @param segment 변환할 segment input
 * @returns 새로 만든 PathCommand 배열
 */
export function segmentCommands(segment: SegmentLike): PathCommand[] {
  return segmentCommandsInto([], segment);
}
