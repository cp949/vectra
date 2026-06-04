import type { RectLike } from '../types';
import { type HalvesOptions, halvesInto } from './halves-into';

/**
 * rect를 first/second 두 부분으로 분할하여 새 nested object로 반환한다.
 *
 * **axis: 'x'** (기본값) — left/right 분할:
 * - `split = x + width * ratio`
 * - `first`:  `{ x: x,     y: y, width: split - x,        height: height }`
 * - `second`: `{ x: split, y: y, width: x + width - split, height: height }`
 *
 * **axis: 'y'** — top/bottom 분할:
 * - `split = y + height * ratio`
 * - `first`:  `{ x: x, y: y,     width: width, height: split - y         }`
 * - `second`: `{ x: x, y: split, width: width, height: y + height - split }`
 *
 * `axis` 기본값: `'x'`. `ratio` 기본값: `0.5`.
 *
 * `ratio`가 `[0, 1]` 범위를 벗어나거나 `NaN`이면 `RangeError`를 던진다.
 * `axis`가 `'x'` / `'y'` 이외의 문자열이면 `RangeError`를 던진다.
 * `axis`가 `undefined`이면 기본값 `'x'`를 사용한다.
 *
 * 정규화하지 않는다. negative width/height rect는 raw 산식으로 분할한다.
 *
 * 매 호출마다 `first`, `second` 2개의 새 `{ x, y, width, height }` object를 포함한
 * 새 object를 반환한다. 입력 `rect`는 mutation하지 않는다.
 *
 * @param rect 분할할 rect
 * @param options axis / ratio 옵션
 */
export function halves(
  rect: RectLike,
  options?: HalvesOptions
): {
  first: { x: number; y: number; width: number; height: number };
  second: { x: number; y: number; width: number; height: number };
} {
  return halvesInto(
    {
      first: { x: 0, y: 0, width: 0, height: 0 },
      second: { x: 0, y: 0, width: 0, height: 0 },
    },
    rect,
    options
  );
}
