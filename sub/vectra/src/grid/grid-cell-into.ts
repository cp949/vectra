import { validateGridCellSize, validateGridComputedFinite, validateGridFinite, writeGridCell } from '../internal/grid';
import type { GridCellWritable, GridSpec, Point } from '../types/flat-shapes.internal';

/**
 * world point가 속한 integer cell coordinate를 floor division으로 out에 기록하고 out을 반환한다.
 *
 * 산식은 `col = floor((point.x - originX) / cellWidth)`,
 * `row = floor((point.y - originY) / cellHeight)`다. cell 경계
 * 위 점은 더 큰 index의 cell에 속한다. negative world coordinate는 truncation이 아니라 floor로
 * 처리한다(origin 0, size 10에서 x `-1`은 col `-1`). `cellWidth`와 `cellHeight`이 positive finite number가
 * 아니면(`0`, 음수, `NaN`, `Infinity`, `-Infinity`) `RangeError`다. point 또는 origin 성분이
 * non-finite이면 `RangeError`다. 계산된 cell coordinate가 overflow해 non-finite가 되면
 * `RangeError`이고 out은 수정하지 않는다.
 *
 * @param out 셀 좌표를 기록할 객체
 * @param point cell을 구할 world 좌표
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellInto<Out extends GridCellWritable>(out: Out, point: Point, spec: GridSpec): Out {
  const px = point.x;
  const py = point.y;
  const ox = spec.originX;
  const oy = spec.originY;
  const sizeX = spec.cellWidth;
  const sizeY = spec.cellHeight;

  validateGridFinite(px, py);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const col = Math.floor((px - ox) / sizeX);
  const row = Math.floor((py - oy) / sizeY);
  validateGridComputedFinite(col, row);

  return writeGridCell(out, col, row);
}
