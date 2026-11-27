import type { Segment } from '../types/flat-shapes.internal';
import type { PathCommand } from '../types/index';

/**
 * segment를 move + line 2 command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다 (path invalid numeric pass-through).
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param segment 변환할 선분 (`{ x1, y1, x2, y2 }`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function segmentCommandsInto(out: PathCommand[], segment: Segment): PathCommand[] {
  out.length = 0;
  out.push({ kind: 'move', x: segment.x1, y: segment.y1 });
  out.push({ kind: 'line', x: segment.x2, y: segment.y2 });
  return out;
}
