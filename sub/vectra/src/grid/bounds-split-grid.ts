import type { BoundsLike, RectWritable } from '../types';
import { boundsSplitGridInto } from './bounds-split-grid-into';

/**
 * bounds를 `rows` x `cols` 개수로 균등 분할한 rect collection을 새 `{ x, y, width, height }[]` 배열로 row-major order로 반환한다.
 *
 * 각 cell 경계는 `min + ((max - min) / count) * index`로 계산하고 첫/마지막 경계는 source min/max를
 * 직접 써서 마지막 row/col edge가 source max와 정확히 일치한다. order는 row 오름차순, 각 row에서
 * col 오름차순이다. bounds width 또는 height가 0이면 empty collection이 아니라 `rows * cols`개의
 * zero-width/zero-height rect를 반환한다. `rows`와 `cols`는 positive safe integer여야 하고 `0`,
 * 음수, non-integer, `NaN`, `Infinity`, unsafe integer는 `RangeError`다. bounds min/max corner
 * 성분이 non-finite이거나 width/height가 음수인 inverted bounds이거나 width/height가 overflow해
 * non-finite가 되면 `RangeError`다. cell 개수가 safe array length(`0xffffffff`)를 넘으면
 * `RangeError`다.
 *
 * @param bounds 분할할 bounds. min/max corner 순서를 그대로 읽는다.
 * @param rows 세로로 나눌 row 개수. positive safe integer.
 * @param cols 가로로 나눌 column 개수. positive safe integer.
 */
export function boundsSplitGrid(bounds: BoundsLike, rows: number, cols: number): RectWritable[] {
  return boundsSplitGridInto([], bounds, rows, cols);
}
