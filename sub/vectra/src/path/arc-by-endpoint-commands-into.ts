import { readX, readY } from '../internal/xy';
import type { ArcCommand, PathCommand, XYInput } from '../types/index';

/**
 * from 시작점과 SVG endpoint arc command를 move + arc, 총 2 command로 out에 기록하고 out을 반환한다.
 *
 * caller intent: SVG `A` command standalone path 변환.
 * `arcCommand` 내부 field는 변경하지 않고 그대로 push한다 (reference 공유).
 * `arcCommand.rx`, `ry`가 0 또는 음수여도, non-finite 좌표/parameter도 validation 없이 push한다.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param from arc 시작점 (XYInput)
 * @param arcCommand SVG endpoint arc command. push 시 같은 reference로 공유된다
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function arcByEndpointCommandsInto<Out extends PathCommand[]>(
  out: Out,
  from: XYInput,
  arcCommand: ArcCommand
): Out {
  out.length = 0;
  out.push({ kind: 'move', x: readX(from), y: readY(from) } as Out[number]);
  out.push(arcCommand as Out[number]);
  return out;
}
