import {
  readGridCellSizeX,
  readGridCellSizeY,
  readGridOriginX,
  readGridOriginY,
  validateGridCellSize,
  validateGridComputedFinite,
  validateGridFinite,
} from '../internal/grid';
import { readX, readY, writeXY } from '../internal/xy';
import { snapScalar } from '../math/snap.internal';
import type { GridSpecLike, XYInput, XYWritable } from '../types';

/**
 * world point를 nearest grid point로 snap한 결과를 out에 기록하고 out을 반환한다.
 *
 * 산식은 `x = origin.x + round((point.x - origin.x) / cellSize.x) * cellSize.x`, y도 동일하다.
 * origin은 생략하면 `(0, 0)`이다. 정확히 halfway인 점은 `Math.round` 정책을 따른다(0.5는 양의
 * 무한대 방향으로 올림). `cellSize` 성분이 positive finite number가 아니면(`0`, 음수, `NaN`,
 * `Infinity`, `-Infinity`) `RangeError`다. point 또는 origin 성분이 non-finite이면 `RangeError`다.
 * 계산된 snap coordinate가 overflow해 non-finite가 되면 `RangeError`이고 out은 수정하지 않는다.
 * point 성분을 먼저 모두 읽으므로 `out === point` aliasing은 안전하다.
 *
 * @param out snap 결과를 기록할 writable output
 * @param point snap할 world 좌표
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridSnapInto<Out extends XYWritable>(out: Out, point: XYInput, spec: GridSpecLike): Out {
  // aliasing 안전 - point 성분을 먼저 모두 읽은 후 기록한다
  const px = readX(point);
  const py = readY(point);
  const ox = readGridOriginX(spec);
  const oy = readGridOriginY(spec);
  const sizeX = readGridCellSizeX(spec);
  const sizeY = readGridCellSizeY(spec);

  validateGridFinite(px, py);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const x = snapScalar(px, sizeX, ox);
  const y = snapScalar(py, sizeY, oy);
  validateGridComputedFinite(x, y);

  return writeXY(out, x, y);
}
