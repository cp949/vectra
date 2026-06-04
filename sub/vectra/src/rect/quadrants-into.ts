import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RectLike, RectWritable, XYInput } from '../types';

/**
 * rect를 4개 사분면으로 분할하여 `out`의 각 사각형에 기록하고 `out`을 반환한다.
 *
 * 사분면 이름과 좌표 계산 공식 (rect: (x, y, w, h), center: (cx, cy)):
 * - `nw`: `{ x: x,  y: y,  width: cx - x,     height: cy - y     }`
 * - `ne`: `{ x: cx, y: y,  width: x + w - cx,  height: cy - y     }`
 * - `se`: `{ x: cx, y: cy, width: x + w - cx,  height: y + h - cy }`
 * - `sw`: `{ x: x,  y: cy, width: cx - x,      height: y + h - cy }`
 *
 * `center` 생략 시 raw center `(x + width / 2, y + height / 2)`를 사용한다.
 *
 * `center`가 `rect` 밖이면 negative width/height rect가 나올 수 있다. 정규화하지 않는다.
 *
 * empty rect(`width <= 0 || height <= 0`)에서도 raw 산식을 그대로 적용한다.
 *
 * **aliasing 안전**: `out`의 nested rect(`out.nw` 등)가 `rect`와 동일한 object이거나
 * `center`와 동일한 object여도 결과가 정확히 계산된다.
 * 모든 입력 값(`rect`, `center`)을 local 변수로 먼저 읽은 후 기록한다.
 *
 * @param out 사분면 rect를 기록할 writable output
 * @param rect 분할할 rect
 * @param center 분할 기준점. 생략하면 rect의 raw center
 */
export function quadrantsInto<
  Out extends {
    nw: RectWritable;
    ne: RectWritable;
    se: RectWritable;
    sw: RectWritable;
  },
>(out: Out, rect: RectLike, center?: XYInput): Out {
  // aliasing 안전 - 모든 입력 값을 먼저 local 변수로 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  const cx = center !== undefined ? readX(center) : x + w / 2;
  const cy = center !== undefined ? readY(center) : y + h / 2;

  const r = x + w;
  const b = y + h;

  out.nw.x = x;
  out.nw.y = y;
  out.nw.width = cx - x;
  out.nw.height = cy - y;

  out.ne.x = cx;
  out.ne.y = y;
  out.ne.width = r - cx;
  out.ne.height = cy - y;

  out.se.x = cx;
  out.se.y = cy;
  out.se.width = r - cx;
  out.se.height = b - cy;

  out.sw.x = x;
  out.sw.y = cy;
  out.sw.width = cx - x;
  out.sw.height = b - cy;

  return out;
}
