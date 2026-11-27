import type { HexAxialWritable, HexLayout, Point } from '../types/flat-shapes.internal';
import { hexPixelToAxialInto } from './hex-pixel-to-axial-into';

/**
 * world pixel point의 fractional axial hex coordinate를 새 plain `{ q, r }` object로 반환한다.
 *
 * origin을 뺀 local `(x, y)`에 대해 pointy orientation 산식은
 * `q = (sqrt(3) / 3 * x - 1 / 3 * y) / size`, `r = (2 / 3 * y) / size`다. flat orientation 산식은
 * `q = (2 / 3 * x) / size`, `r = (-1 / 3 * x + sqrt(3) / 3 * y) / size`다.
 *
 * 결과는 fractional axial 좌표다. 정수 셀로 반올림하려면 `s = -q - r`을 계산해
 * `hexRound({ q, r, s })`를 호출한다. point 또는 origin 성분이 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. `size`가 positive finite number가 아니면 `RangeError`다.
 * `orientation`이 `"pointy"`/`"flat"`이 아니면 `RangeError`다. 계산 결과가 non-finite이면
 * `RangeError`다. 계산 결과 `-0`은 `0`으로 canonicalize한다.
 *
 * @param point axial로 변환할 world point
 * @param layout origin/size/orientation을 정의하는 layout spec
 */
export function hexPixelToAxial(point: Point, layout: HexLayout): HexAxialWritable {
  return hexPixelToAxialInto({ q: 0, r: 0 }, point, layout);
}
