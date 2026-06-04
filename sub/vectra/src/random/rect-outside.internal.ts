import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/** 선택 가능한 sampling slab. axis-aligned rect 영역. */
type Slab = {
  x0: number;
  y0: number;
  width: number;
  height: number;
};

/**
 * outer 내부이면서 inner 밖인 영역에서 area-uniform point를 out에 기록하는 shared core.
 *
 * 영역을 top/bottom/left/right 최대 4개 slab으로 분해해 면적 비례로 직접 선택한다. left/right slab의
 * y 범위는 inner y 범위로 제한해 영역 중복을 막는다. 실패 분기(degenerate outer, malformed/non-contained
 * inner, zero/non-finite outside area)는 RNG 미소비, out 미수정으로 닫는다. 성공 시 RNG를 slab 선택
 * 1회 + slab 내부 x/y 2회로 총 3회 소비한다. public 계약은 위임 leaf의 JSDoc을 따른다.
 *
 * @param out 결과를 기록할 writable 좌표 output
 * @param outer sampling 영역의 바깥 rect
 * @param inner 제외할 안쪽 rect. outer에 완전히 포함되어야 한다
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const sampleRectOutsideInto = <Out extends XYWritable>(
  out: Out,
  outer: RectLike,
  inner: RectLike,
  rng?: RandomSource
): boolean => {
  const ox0 = readRectX(outer);
  const oy0 = readRectY(outer);
  const outerWidth = readRectWidth(outer);
  const outerHeight = readRectHeight(outer);
  // outer는 positive-area rect여야 한다. NaN은 NaN > 0 === false로 함께 걸린다.
  if (!(outerWidth > 0) || !(outerHeight > 0)) {
    return false;
  }

  const ix0 = readRectX(inner);
  const iy0 = readRectY(inner);
  const innerWidth = readRectWidth(inner);
  const innerHeight = readRectHeight(inner);
  // 음수 dimension inner는 malformed hole로 보고 닫는다. 자동 clip하지 않는다.
  if (innerWidth < 0 || innerHeight < 0) {
    return false;
  }

  const ox1 = ox0 + outerWidth;
  const oy1 = oy0 + outerHeight;
  const ix1 = ix0 + innerWidth;
  const iy1 = iy0 + innerHeight;
  // inner가 outer에 완전히 포함되어야 한다. NaN 좌표는 비교가 false가 되어 함께 걸린다.
  if (!(ix0 >= ox0 && iy0 >= oy0 && ix1 <= ox1 && iy1 <= oy1)) {
    return false;
  }

  const topHeight = iy0 - oy0;
  const bottomHeight = oy1 - iy1;
  const leftWidth = ix0 - ox0;
  const rightWidth = ox1 - ix1;
  const slabs: Slab[] = [];
  // top/bottom은 full outer width, left/right는 inner y 범위로 제한해 중복을 막는다.
  if (topHeight > 0) {
    slabs.push({ x0: ox0, y0: oy0, width: outerWidth, height: topHeight });
  }
  if (bottomHeight > 0) {
    slabs.push({ x0: ox0, y0: iy1, width: outerWidth, height: bottomHeight });
  }
  if (leftWidth > 0 && innerHeight > 0) {
    slabs.push({ x0: ox0, y0: iy0, width: leftWidth, height: innerHeight });
  }
  if (rightWidth > 0 && innerHeight > 0) {
    slabs.push({ x0: ix1, y0: iy0, width: rightWidth, height: innerHeight });
  }

  let totalArea = 0;
  for (const slab of slabs) {
    totalArea += slab.width * slab.height;
  }
  // outside area가 없거나 non-finite면 RNG 소비 전에 닫는다.
  if (!Number.isFinite(totalArea) || totalArea <= 0) {
    return false;
  }

  // 면적 비례 slab 선택. float 경계가 누적 합을 넘으면 마지막 slab을 선택하도록 default를 둔다.
  const target = random(rng) * totalArea;
  let selected = slabs[slabs.length - 1] as Slab;
  let acc = 0;
  for (const slab of slabs) {
    acc += slab.width * slab.height;
    if (target < acc) {
      selected = slab;
      break;
    }
  }

  writeXY(out, selected.x0 + random(rng) * selected.width, selected.y0 + random(rng) * selected.height);
  return true;
};
