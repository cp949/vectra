import { writePolylineCommandsInto } from '../internal/polyline-path';
import type { PathCommand, PolylineLike } from '../types/index';

/**
 * polyline을 move(첫 점) + line(나머지 점), 총 N command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * 점 0개 → out clear만 하고 반환. 점 1개 → move만 기록.
 *
 * `polyline.toPathInto`와 같은 internal writer를 공유한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param polyline 기록할 polyline (`readonly XYInput[]` 또는 `{ points }` object)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function polylineCommandsInto<Out extends PathCommand[]>(out: Out, polyline: PolylineLike): Out {
  return writePolylineCommandsInto(out, polyline);
}
