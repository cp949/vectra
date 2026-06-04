import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { PathCommand, RectLike } from '../types/index';

/**
 * rect를 move + 3 line + close, 총 5 command로 out에 기록하고 out을 반환한다.
 *
 * SVG y-down 좌표계 기준 clockwise: left-top → right-top → right-bottom → left-bottom → close.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * 음수 width/height는 validation 없이 그대로 사용한다 (기존 path Invalid numeric field 정책).
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param rect 기록할 rect ({ x, y, width, height } object 또는 4-tuple)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function rectCommandsInto<Out extends PathCommand[]>(out: Out, rect: RectLike): Out {
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  out.length = 0;
  out.push({ kind: 'move', x, y } as Out[number]);
  out.push({ kind: 'line', x: x + w, y } as Out[number]);
  out.push({ kind: 'line', x: x + w, y: y + h } as Out[number]);
  out.push({ kind: 'line', x, y: y + h } as Out[number]);
  out.push({ kind: 'close' } as Out[number]);
  return out;
}
