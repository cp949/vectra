import type { GridCellWritable, GridSpec, Rect } from '../types/flat-shapes.internal';
import { gridCellsInRectInto } from './grid-cells-in-rect-into';

/**
 * world rect가 면적으로 덮는 integer cell collection을 새 `{ col, row }[]` 배열로 row-major order로 반환한다.
 *
 * col range는 `minCol = floor((x - originX) / cellWidth)`부터
 * `maxCol = ceil((x - originX + width) / cellWidth) - 1`까지, row range는 같은 산식을 y축에
 * 적용한다. order는 row 오름차순, 각 row에서 col 오름차순이다.
 * rect의 오른쪽/아래 edge가 cell boundary에 정확히 닿기만 하면(zero-area 접촉) 다음 cell은
 * 포함하지 않는다. negative world coordinate는 truncation이 아니라 floor로 처리한다. zero width
 * 또는 zero height rect는 empty collection이다. `cellWidth`와 `cellHeight`가 positive finite number가
 * 아니거나(`0`, 음수, `NaN`, `Infinity`, `-Infinity`) origin 성분이 non-finite이거나 rect 성분이
 * non-finite이면 `RangeError`다. width 또는 height가 음수인 inverted rect는 `RangeError`다.
 * positive extent의 계산된 끝 경계가 정밀도 손실로 시작 경계와 같거나 더 작아지면 `RangeError`다.
 * 계산된 cell range boundary가 safe integer가 아니거나 cell 개수가 safe array length(`0xffffffff`)를
 * 넘으면 `RangeError`다.
 *
 * @param rect cell coverage를 구할 world rect
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellsInRect(rect: Rect, spec: GridSpec): GridCellWritable[] {
  return gridCellsInRectInto([], rect, spec);
}
