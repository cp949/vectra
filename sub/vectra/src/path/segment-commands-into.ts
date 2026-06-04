import { readSegmentA, readSegmentB } from '../internal/segment';
import type { PathCommand, SegmentLike } from '../types/index';
import { lineCommandsInto } from './line-commands-into';

/**
 * segment를 move + line 2 command로 out에 기록하고 out을 반환한다.
 *
 * `lineCommandsInto(out, a, b)`에 위임하지만 caller intent가 segment 입력일 때 사용한다.
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * invalid numeric(NaN, Inf)은 throw 없이 그대로 전파한다 (path invalid numeric pass-through).
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param segment 두 endpoint로 표현하는 structural segment (`{ a, b }` 또는 `[a, b]`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function segmentCommandsInto<Out extends PathCommand[]>(out: Out, segment: SegmentLike): Out {
  return lineCommandsInto(out, readSegmentA(segment), readSegmentB(segment));
}
