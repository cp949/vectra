import {
  hexCanonicalZero,
  validateHexComputedFinite,
  validateHexFinite,
  validateHexLayoutSize,
  validateHexOrientation,
  writeHexAxial,
} from '../internal/hex-grid';
import type { HexAxialWritable, HexLayout, Point } from '../types/flat-shapes.internal';

const SQRT3 = Math.sqrt(3);

/**
 * world pixel point의 fractional axial hex coordinate를 out에 기록하고 out을 반환한다.
 *
 * origin을 뺀 local `(x, y)`에 대해 pointy orientation 산식은
 * `q = (sqrt(3) / 3 * x - 1 / 3 * y) / size`, `r = (2 / 3 * y) / size`다. flat orientation 산식은
 * `q = (2 / 3 * x) / size`, `r = (-1 / 3 * x + sqrt(3) / 3 * y) / size`다.
 *
 * 결과는 fractional axial 좌표다. 정수 셀로 반올림하려면 `s = -q - r`을 계산해
 * `hexRound({ q, r, s })`를 호출한다. point 또는 origin 성분이 non-finite(`NaN`, `Infinity`,
 * `-Infinity`)이면 `RangeError`다. `size`가 positive finite number가 아니면 `RangeError`다.
 * `orientation`이 `"pointy"`/`"flat"`이 아니면 `RangeError`다. 계산 결과가 non-finite이면
 * `RangeError`다. 계산 결과 `-0`은 `0`으로 canonicalize한다. 입력을 모두 읽고 validation한 뒤
 * 기록하므로 input/output aliasing이 안전하고, validation 실패 시 out을 수정하지 않는다.
 *
 * @param out fractional axial 좌표를 기록할 axial 객체
 * @param point axial로 변환할 world point
 * @param layout origin/size/orientation을 정의하는 layout spec
 */
export function hexPixelToAxialInto<Out extends HexAxialWritable>(out: Out, point: Point, layout: HexLayout): Out {
  const px = point.x;
  const py = point.y;
  const size = layout.size;
  const ox = layout.originX;
  const oy = layout.originY;
  const orientation = layout.orientation;

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
