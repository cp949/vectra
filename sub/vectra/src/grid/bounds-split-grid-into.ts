import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import {
  commitGridRectGrid,
  validateGridBoundsFinite,
  validateGridCollectionCount,
  validateGridComputedFinite,
  validateGridSplitCount,
} from '../internal/grid';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RectWritable } from '../types';

/**
 * 한 축을 `count`개로 균등 분할한 cell 경계 배열을 만든다.
 *
 * 첫 경계는 `min`, 마지막 경계는 `max`를 직접 써서 경계가 source extent와 정확히 일치하게 한다.
 * 내부 경계는 `min + ((max - min) / count) * i`로 계산해 큰 finite span의 중간 곱 overflow를
 * 피하고 누적 drift를 줄인다.
 */
function buildUniformEdges(min: number, max: number, count: number): number[] {
  const span = max - min;
  const step = span / count;
  const edges = new Array<number>(count + 1);
  edges[0] = min;
  edges[count] = max;
  for (let i = 1; i < count; i++) {
    edges[i] = min + step * i;
  }
  return edges;
}

/**
 * bounds를 `rows` x `cols` 개수로 균등 분할한 rect collection을 row-major order로 out에 기록하고 out을 반환한다.
 *
 * 각 cell 경계는 `min + ((max - min) / count) * index`로 계산하고 첫/마지막 경계는 source min/max를
 * 직접 써서 마지막 row/col edge가 source max와 정확히 일치한다. order는 row 오름차순, 각 row에서
 * col 오름차순이다. bounds width 또는 height가 0이면 empty collection이 아니라 `rows * cols`개의
 * zero-width/zero-height rect를 반환한다. `rows`와 `cols`는 positive safe integer여야 하고 `0`,
 * 음수, non-integer, `NaN`, `Infinity`, unsafe integer는 `RangeError`다. bounds min/max corner
 * 성분이 non-finite이거나 width/height가 음수인 inverted bounds이거나 width/height가 overflow해
 * non-finite가 되면 `RangeError`다. cell 개수가 safe array length(`0xffffffff`)를 넘으면
 * `RangeError`다. validation이 실패하면 out은 수정하지 않고, 성공 시에만 out을 비우고 새
 * `{ x, y, width, height }` plain object를 push한다.
 *
 * @param out rect collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param bounds 분할할 bounds. min/max corner 순서를 그대로 읽는다.
 * @param rows 세로로 나눌 row 개수. positive safe integer.
 * @param cols 가로로 나눌 column 개수. positive safe integer.
 */
export function boundsSplitGridInto(
  out: RectWritable[],
  bounds: BoundsLike,
  rows: number,
  cols: number
): RectWritable[] {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);

  validateGridBoundsFinite(minX, minY, maxX, maxY);
  validateGridSplitCount(rows, 'rows');
  validateGridSplitCount(cols, 'cols');

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 0 || height < 0) {
    throw new RangeError(`grid bounds width/height must be non-negative, got (${String(width)}, ${String(height)})`);
  }
  validateGridComputedFinite(width, height);
  validateGridCollectionCount(rows * cols);

  const xEdges = buildUniformEdges(minX, maxX, cols);
  const yEdges = buildUniformEdges(minY, maxY, rows);
  return commitGridRectGrid(out, xEdges, yEdges);
}
