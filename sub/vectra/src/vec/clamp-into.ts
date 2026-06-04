import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input의 각 성분을 [min, max] 범위로 clamp하여 out에 기록하고 out을 반환한다.
 *
 * input, min, max 중 하나가 out과 같은 object여도 안전하다.
 * NaN, Infinity, -Infinity 입력은 Math.min/Math.max 정책을 따른다.
 *
 * caller가 min <= max 순서로 전달해야 한다. min > max이면 결과는 정의되지 않는다.
 *
 * @param out 결과를 기록할 writable output
 * @param input clamp할 입력 벡터
 * @param min 각 성분의 하한 벡터
 * @param max 각 성분의 상한 벡터
 */
export function clampInto<Out extends XYWritable>(out: Out, input: XYInput, min: XYInput, max: XYInput): Out {
  const ix = readX(input);
  const iy = readY(input);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  return writeXY(out, Math.min(Math.max(ix, minX), maxX), Math.min(Math.max(iy, minY), maxY));
}
