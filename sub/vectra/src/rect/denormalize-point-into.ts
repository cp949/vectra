import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY, writeXY } from '../internal/xy';
import type { RectLike, XYInput, XYWritable } from '../types';

/**
 * rect-local coordinate를 world point로 변환해 `out`에 기록하고 반환한다.
 *
 * 산식: `x = rect.x + localPoint.x * rect.width`, `y = rect.y + localPoint.y * rect.height`.
 * `normalizePointInto`의 역변환이다.
 *
 * clamp하지 않는다. local coordinate가 `0..1` 밖이어도 extrapolation 결과를 기록한다.
 * empty rect와 negative dimension rect도 특별 분기 없이 raw 산식을 적용한다.
 * `NaN`/`Infinity` 입력은 검증 없이 산술 결과로 전파한다.
 * `out`과 `localPoint`가 같은 object여도 안전하다. local 좌표를 먼저 읽은 뒤 기록한다.
 *
 * @param out world point를 기록할 writable output
 * @param rect 기준 rect
 * @param localPoint world coordinate로 변환할 rect-local point
 */
export function denormalizePointInto<Out extends XYWritable>(out: Out, rect: RectLike, localPoint: XYInput): Out {
  const lx = readX(localPoint);
  const ly = readY(localPoint);
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  return writeXY(out, x + lx * w, y + ly * h);
}
