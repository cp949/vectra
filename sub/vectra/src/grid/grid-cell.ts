import type { GridCellWritable, GridSpecLike, XYInput } from '../types';
import { gridCellInto } from './grid-cell-into';

/**
 * world point가 속한 integer cell coordinate를 새 plain `{ col, row }` object로 반환한다.
 *
 * 산식은 `col = floor((point.x - origin.x) / cellSize.x)`,
 * `row = floor((point.y - origin.y) / cellSize.y)`다. origin은 생략하면 `(0, 0)`이다. cell 경계
 * 위 점은 더 큰 index의 cell에 속한다. negative world coordinate는 truncation이 아니라 floor로
 * 처리한다(origin 0, size 10에서 x `-1`은 col `-1`). `cellSize` 성분이 positive finite number가
 * 아니면(`0`, 음수, `NaN`, `Infinity`, `-Infinity`) `RangeError`다. point 또는 origin 성분이
 * non-finite이면 `RangeError`다. 계산된 cell coordinate가 overflow해 non-finite가 되면
 * `RangeError`다.
 *
 * @param point cell을 구할 world 좌표
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridCell(point: XYInput, spec: GridSpecLike): GridCellWritable {
  return gridCellInto({ col: 0, row: 0 }, point, spec);
}
