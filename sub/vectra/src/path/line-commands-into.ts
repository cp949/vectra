import { readX, readY } from '../internal/xy';
import type { PathCommand, XYInput } from '../types/index';

/**
 * from→to 직선을 move + line 2 command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param from 시작점 (XYLike 또는 XYTuple)
 * @param to 끝점 (XYLike 또는 XYTuple)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function lineCommandsInto<Out extends PathCommand[]>(out: Out, from: XYInput, to: XYInput): Out {
  out.length = 0;
  out.push({ kind: 'move', x: readX(from), y: readY(from) } as Out[number]);
  out.push({ kind: 'line', x: readX(to), y: readY(to) } as Out[number]);
  return out;
}
