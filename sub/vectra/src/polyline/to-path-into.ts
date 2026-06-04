import { writePolylineCommandsInto } from '../internal/polyline-path';
import type { PathCommand, PolylineLike } from '../types';

/**
 * polyline을 `move` + `line` command sequence로 outCommands에 기록한다.
 *
 * outCommands는 먼저 clear된 뒤 결과 command가 push되며, 같은 outCommands를 반환한다.
 * 좌표는 모두 절대좌표다.
 *
 * - empty polyline: out을 clear하고 빈 command 배열을 반환한다.
 * - single-point polyline: `move` command 하나만 기록한다.
 * - N-point polyline: 첫 점 `move`, 나머지 점 `line`.
 *
 * finite 검증은 하지 않는다. invalid numeric(NaN, Inf)은 그대로 전파한다.
 * `path.polylineCommandsInto`와 같은 internal writer를 공유한다.
 *
 * @param outCommands command를 기록할 mutable PathCommand 배열
 * @param polyline 변환할 polyline
 */
export function toPathInto<Out extends PathCommand[]>(outCommands: Out, polyline: PolylineLike): Out {
  return writePolylineCommandsInto(outCommands, polyline);
}
