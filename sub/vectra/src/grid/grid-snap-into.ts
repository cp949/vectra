import { validateGridCellSize, validateGridComputedFinite, validateGridFinite } from '../internal/grid';
import { snapScalar } from '../math/snap.internal';
import type { GridSpec, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * world point를 nearest grid point로 snap한 결과를 out에 기록하고 out을 반환한다.
 *
 * 산식은 `x = originX + round((point.x - originX) / cellWidth) * cellWidth`, y도 동일하다.
 * 정확히 halfway인 점은 `Math.round` 정책을 따른다(0.5는 양의 무한대 방향으로 올림).
 * `cellWidth`와 `cellHeight`가 positive finite number가 아니면(`0`, 음수, `NaN`, `Infinity`,
 * `-Infinity`) `RangeError`다. point 또는 origin 성분이 non-finite이면 `RangeError`다.
 * 계산된 snap coordinate가 overflow해 non-finite가 되면 `RangeError`이고 out은 수정하지 않는다.
 * point 성분을 먼저 모두 읽으므로 `out === point` aliasing은 안전하다.
 *
 * @param out snap 결과를 기록할 점 객체
 * @param point snap할 world 좌표
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridSnapInto<Out extends PointWritable>(out: Out, point: Point, spec: GridSpec): Out {
  // aliasing 안전 - point 성분을 먼저 모두 읽은 후 기록한다
  const px = point.x;
  const py = point.y;
  const ox = spec.originX;
  const oy = spec.originY;
  const sizeX = spec.cellWidth;
  const sizeY = spec.cellHeight;

  validateGridFinite(px, py);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const x = snapScalar(px, sizeX, ox);
  const y = snapScalar(py, sizeY, oy);
  validateGridComputedFinite(x, y);

  out.x = x;
  out.y = y;
  return out;
}
