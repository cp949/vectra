import {
  hexCanonicalZero,
  readHexLayoutOrientation,
  readHexLayoutOriginX,
  readHexLayoutOriginY,
  validateHexComputedFinite,
  validateHexFinite,
  validateHexLayoutSize,
  validateHexOrientation,
  writeHexAxial,
} from '../internal/hex-grid';
import { readX, readY } from '../internal/xy';
import type { HexAxialWritable, HexLayoutLike, XYInput } from '../types';

const SQRT3 = Math.sqrt(3);

/**
 * world pixel point의 fractional axial hex coordinate를 out에 기록하고 out을 반환한다.
 *
 * origin을 뺀 local `(x, y)`에 대해 pointy orientation 산식은
 * `q = (sqrt(3) / 3 * x - 1 / 3 * y) / size`, `r = (2 / 3 * y) / size`다. flat orientation 산식은
 * `q = (2 / 3 * x) / size`, `r = (-1 / 3 * x + sqrt(3) / 3 * y) / size`다. `orientation`을 생략하면
 * `"pointy"`, `origin`을 생략하면 `(0, 0)`이다.
 *
 * 결과는 fractional axial coordinate이며 자동 rounding하지 않는다. nearest integer hex가 필요하면
 * `hexRound*`를 별도로 호출한다. point 또는 origin 성분이 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. `size`가 positive finite number가 아니면 `RangeError`다.
 * `orientation`이 `"pointy"`/`"flat"`이 아니면 `RangeError`다. 계산 결과가 non-finite이면
 * `RangeError`다. 계산 결과 `-0`은 `0`으로 canonicalize한다. 입력을 모두 읽고 validation한 뒤
 * 기록하므로 input/output aliasing이 안전하고, validation 실패 시 out을 수정하지 않는다.
 *
 * @param out fractional axial coordinate를 기록할 writable output
 * @param point axial로 변환할 world point
 * @param layout origin/size/orientation을 정의하는 layout spec
 */
export function hexPixelToAxialInto<Out extends HexAxialWritable>(
  out: Out,
  point: XYInput,
  layout: HexLayoutLike
): Out {
  const px = readX(point);
  const py = readY(point);
  const size = layout.size;
  const ox = readHexLayoutOriginX(layout);
  const oy = readHexLayoutOriginY(layout);
  const orientation = readHexLayoutOrientation(layout);

  validateHexFinite(px, py, 'point');
  validateHexLayoutSize(size);
  validateHexFinite(ox, oy, 'origin');
  validateHexOrientation(orientation);

  const lx = px - ox;
  const ly = py - oy;
  let q: number;
  let r: number;
  if (orientation === 'pointy') {
    q = ((SQRT3 / 3) * lx - (1 / 3) * ly) / size;
    r = ((2 / 3) * ly) / size;
  } else {
    q = ((2 / 3) * lx) / size;
    r = (-(1 / 3) * lx + (SQRT3 / 3) * ly) / size;
  }

  validateHexComputedFinite(q, r, 'axial');

  return writeHexAxial(out, hexCanonicalZero(q), hexCanonicalZero(r));
}
