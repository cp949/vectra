import type { HexAxialLike, HexLayoutLike, XYObjectWritable } from '../types';
import { hexAxialToPixelInto } from './hex-axial-to-pixel-into';

/**
 * axial hex coordinate의 world pixel point를 새 plain `{ x, y }` object로 반환한다.
 *
 * pointy orientation 산식은 `x = size * sqrt(3) * (q + r / 2) + origin.x`,
 * `y = size * 1.5 * r + origin.y`다. flat orientation 산식은 `x = size * 1.5 * q + origin.x`,
 * `y = size * sqrt(3) * (r + q / 2) + origin.y`다. `orientation`을 생략하면 `"pointy"`,
 * `origin`을 생략하면 `(0, 0)`이다.
 *
 * axial q/r 또는 origin 성분이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 * `size`가 positive finite number가 아니면 `RangeError`다. `orientation`이 `"pointy"`/`"flat"`이
 * 아니면 `RangeError`다. 계산 결과가 overflow해 non-finite가 되면 `RangeError`다. 계산 결과 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param axial pixel로 변환할 axial coordinate
 * @param layout origin/size/orientation을 정의하는 layout spec
 */
export function hexAxialToPixel(axial: HexAxialLike, layout: HexLayoutLike): XYObjectWritable {
  return hexAxialToPixelInto({ x: 0, y: 0 }, axial, layout);
}
