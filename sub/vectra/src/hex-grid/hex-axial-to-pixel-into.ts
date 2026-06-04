import {
  hexCanonicalZero,
  readHexAxialQ,
  readHexAxialR,
  readHexLayoutOrientation,
  readHexLayoutOriginX,
  readHexLayoutOriginY,
  validateHexComputedFinite,
  validateHexFinite,
  validateHexLayoutSize,
  validateHexOrientation,
} from '../internal/hex-grid';
import { writeXY } from '../internal/xy';
import type { HexAxialLike, HexLayoutLike, XYWritable } from '../types';

const SQRT3 = Math.sqrt(3);

/**
 * axial hex coordinate의 world pixel point를 out에 기록하고 out을 반환한다.
 *
 * pointy orientation 산식은 `x = size * sqrt(3) * (q + r / 2) + origin.x`,
 * `y = size * 1.5 * r + origin.y`다. flat orientation 산식은 `x = size * 1.5 * q + origin.x`,
 * `y = size * sqrt(3) * (r + q / 2) + origin.y`다. `orientation`을 생략하면 `"pointy"`,
 * `origin`을 생략하면 `(0, 0)`이다.
 *
 * axial q/r 또는 origin 성분이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 * `size`가 positive finite number가 아니면 `RangeError`다. `orientation`이 `"pointy"`/`"flat"`이
 * 아니면 `RangeError`다. 계산 결과가 overflow해 non-finite가 되면 `RangeError`다. 계산 결과 `-0`은
 * `0`으로 canonicalize한다. 입력을 모두 읽고 validation한 뒤 기록하므로 input/output aliasing이
 * 안전하고, validation 실패 시 out을 수정하지 않는다.
 *
 * @param out world point를 기록할 writable output
 * @param axial pixel로 변환할 axial coordinate
 * @param layout origin/size/orientation을 정의하는 layout spec
 */
export function hexAxialToPixelInto<Out extends XYWritable>(out: Out, axial: HexAxialLike, layout: HexLayoutLike): Out {
  const q = readHexAxialQ(axial);
  const r = readHexAxialR(axial);
  const size = layout.size;
  const ox = readHexLayoutOriginX(layout);
  const oy = readHexLayoutOriginY(layout);
  const orientation = readHexLayoutOrientation(layout);

  validateHexFinite(q, r, 'axial');
  validateHexLayoutSize(size);
  validateHexFinite(ox, oy, 'origin');
  validateHexOrientation(orientation);

  let x: number;
  let y: number;
  if (orientation === 'pointy') {
    x = size * SQRT3 * (q + r / 2) + ox;
    y = size * 1.5 * r + oy;
  } else {
    x = size * 1.5 * q + ox;
    y = size * SQRT3 * (r + q / 2) + oy;
  }

  validateHexComputedFinite(x, y, 'pixel');

  return writeXY(out, hexCanonicalZero(x), hexCanonicalZero(y));
}
