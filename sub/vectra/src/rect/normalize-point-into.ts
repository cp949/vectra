import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY, writeXY } from '../internal/xy';
import type { RectLike, XYInput, XYWritable } from '../types';

/**
 * world point를 rect-local coordinate로 변환해 `out`에 기록하고 반환한다.
 *
 * 산식: `u = (point.x - rect.x) / rect.width`, `v = (point.y - rect.y) / rect.height`.
 * rect top-left가 `(0, 0)`, bottom-right가 `(1, 1)`인 unit square 좌표계로 매핑한다.
 *
 * clamp하지 않는다. rect 밖 point는 `<0` 또는 `>1` local coordinate가 된다.
 * empty rect와 negative dimension rect도 특별 분기 없이 raw 산식을 적용한다. negative
 * dimension rect는 corner normalization 없이 축이 뒤집힌 local coordinate가 된다.
 * `rect.width === 0` 또는 `rect.height === 0`이면 JS division 결과(`NaN`, `Infinity`,
 * `-Infinity`)를 그대로 기록한다.
 * `NaN`/`Infinity` 입력은 검증 없이 산술 결과로 전파한다.
 * `out`과 `point`가 같은 object여도 안전하다. point 좌표를 먼저 읽은 뒤 기록한다.
 *
 * @param out local coordinate를 기록할 writable output
 * @param rect 기준 rect
 * @param point local coordinate로 변환할 world point
 */
export function normalizePointInto<Out extends XYWritable>(out: Out, rect: RectLike, point: XYInput): Out {
  const px = readX(point);
  const py = readY(point);
  const x = readRectX(rect);
  const y = readRectY(rect);
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);

  return writeXY(out, (px - x) / w, (py - y) / h);
}
