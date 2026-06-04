import type { RectLike, XYInput } from '../types';
import { quadrantsInto } from './quadrants-into';

/**
 * rect를 4개 사분면으로 분할하여 새 nested object로 반환한다.
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
 * 매 호출마다 `nw`, `ne`, `se`, `sw` 4개의 새 `{ x, y, width, height }` object를 포함한
 * 새 object를 반환한다. 입력 `rect`는 mutation하지 않는다.
 *
 * @param rect 분할할 rect
 * @param center 분할 기준점. 생략하면 rect의 raw center
 */
export function quadrants(
  rect: RectLike,
  center?: XYInput
): {
  nw: { x: number; y: number; width: number; height: number };
  ne: { x: number; y: number; width: number; height: number };
  se: { x: number; y: number; width: number; height: number };
  sw: { x: number; y: number; width: number; height: number };
} {
  return quadrantsInto(
    {
      nw: { x: 0, y: 0, width: 0, height: 0 },
      ne: { x: 0, y: 0, width: 0, height: 0 },
      se: { x: 0, y: 0, width: 0, height: 0 },
      sw: { x: 0, y: 0, width: 0, height: 0 },
    },
    rect,
    center
  );
}
