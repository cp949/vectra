import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { PathCommand, RectLike } from '../types/index';
import { KAPPA } from './path-ellipse-arc.internal';
import { rectCommandsInto } from './rect-commands-into';

/**
 * rounded rect를 move + (line + cubic) × 4 + close, 총 10 command로 out에 기록하고 out을 반환한다.
 *
 * SVG y-down 좌표계 기준 clockwise: left-top → right-top → right-bottom → left-bottom → close.
 * radius는 `Math.max(0, Math.min(radius, width / 2, height / 2))`로 clamp한다.
 * clamp 결과가 정확히 `0`이면(`radius <= 0`, 음수 width/height 포함) `rectCommandsInto`로 위임해
 * 5 command를 기록한다. clamp 결과가 NaN이면(예: NaN radius) corner cubic에 NaN이 전파된다
 * (path invalid numeric pass-through). Infinity radius는 finite width/height 기준으로 clamp되어
 * 정상 corner cubic을 생성한다.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param rect 기록할 rect ({ x, y, width, height } object 또는 4-tuple)
 * @param radius corner radius. uniform. clamp 후 사용
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function roundedRectCommandsInto<Out extends PathCommand[]>(out: Out, rect: RectLike, radius: number): Out {
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  // r === 0이면 rectCommandsInto와 결과가 같다. 음수 width/height는 width/2 또는 height/2가
  // 음수가 되어 Math.max(0, ...) 결과 0으로 떨어지므로 rectCommandsInto에 위임된다.
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  if (r === 0) {
    return rectCommandsInto(out, rect);
  }

  // corner cubic Bezier handle 길이 = KAPPA * r.
  const k = KAPPA * r;
  const x0 = x;
  const x1 = x + w;
  const y0 = y;
  const y1 = y + h;

  out.length = 0;
  // 시작점: 위쪽 edge 시작. (x0 + r, y0)
  out.push({ kind: 'move', x: x0 + r, y: y0 } as Out[number]);
  // 위쪽 edge → (x1 - r, y0)
  out.push({ kind: 'line', x: x1 - r, y: y0 } as Out[number]);
  // right-top corner: (x1 - r, y0) → (x1, y0 + r)
  out.push({
    kind: 'cubic',
    x1: x1 - r + k,
    y1: y0,
    x2: x1,
    y2: y0 + r - k,
    x: x1,
    y: y0 + r,
  } as Out[number]);
  // 오른쪽 edge → (x1, y1 - r)
  out.push({ kind: 'line', x: x1, y: y1 - r } as Out[number]);
  // right-bottom corner: (x1, y1 - r) → (x1 - r, y1)
  out.push({
    kind: 'cubic',
    x1: x1,
    y1: y1 - r + k,
    x2: x1 - r + k,
    y2: y1,
    x: x1 - r,
    y: y1,
  } as Out[number]);
  // 아래쪽 edge → (x0 + r, y1)
  out.push({ kind: 'line', x: x0 + r, y: y1 } as Out[number]);
  // left-bottom corner: (x0 + r, y1) → (x0, y1 - r)
  out.push({
    kind: 'cubic',
    x1: x0 + r - k,
    y1: y1,
    x2: x0,
    y2: y1 - r + k,
    x: x0,
    y: y1 - r,
  } as Out[number]);
  // 왼쪽 edge → (x0, y0 + r)
  out.push({ kind: 'line', x: x0, y: y0 + r } as Out[number]);
  // left-top corner: (x0, y0 + r) → (x0 + r, y0)
  out.push({
    kind: 'cubic',
    x1: x0,
    y1: y0 + r - k,
    x2: x0 + r - k,
    y2: y0,
    x: x0 + r,
    y: y0,
  } as Out[number]);
  out.push({ kind: 'close' } as Out[number]);
  return out;
}
