import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import {
  commitGridRectGrid,
  validateGridBoundsFinite,
  validateGridCollectionCount,
  validateGridComputedFinite,
} from '../internal/grid';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RectWritable, XYInput } from '../types';

/**
 * 한 축을 `tileSize` 간격으로 나눈 cell 경계 배열을 만든다.
 *
 * 첫 경계는 `min`, 마지막 경계는 `max`를 직접 써서 마지막 tile이 bounds 끝에 정확히 clamp된다.
 * 내부 경계는 `min + tileSize * i`로 계산한다.
 */
function buildTileEdges(min: number, max: number, tileSize: number, count: number): number[] {
  const edges = new Array<number>(count + 1);
  edges[0] = min;
  edges[count] = max;
  for (let i = 1; i < count; i++) {
    edges[i] = min + tileSize * i;
  }
  return edges;
}

/**
 * bounds를 fixed tile size로 나눈 rect collection을 row-major order로 out에 기록하고 out을 반환한다.
 *
 * tile 개수는 축별로 `ceil(extent / tileSize)`이고 오른쪽/아래 remainder tile을 포함한다(예: 25x15
 * bounds에 10x10 tile이면 3 cols x 2 rows, 마지막 col width 5, 마지막 row height 5). 마지막 tile의
 * 끝 경계는 source max를 직접 써서 bounds 안쪽으로 clamp한다. order는 row 오름차순, 각 row에서 col
 * 오름차순이다. tile size가 bounds extent보다 크면 bounds 크기와 같은 single clipped tile을 반환한다.
 * bounds width 또는 height가 0이면 해당 축은 zero-extent tile 하나로 둔다(`boundsSplitGrid`의 zero
 * extent 정책과 일관). `tileSize`는 number이면 square tile, `XYInput`이면 축별 tile이고 각 성분은
 * positive finite여야 하며(`0`, 음수, `NaN`, `Infinity`, `-Infinity`) 위반하면 `RangeError`다.
 * bounds min/max corner 성분이 non-finite이거나 width/height가 음수인 inverted bounds이거나
 * width/height가 overflow해 non-finite가 되면 `RangeError`다. tile 개수가 safe array length
 * (`0xffffffff`)를 넘으면 `RangeError`다. validation이 실패하면 out은 수정하지 않고, 성공 시에만
 * out을 비우고 새 `{ x, y, width, height }` plain object를 push한다.
 *
 * @param out rect collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param bounds tile로 나눌 bounds. min/max corner 순서를 그대로 읽는다.
 * @param tileSize tile 크기. number이면 square, `XYInput`이면 축별. 각 성분은 positive finite.
 */
export function boundsTileInto(out: RectWritable[], bounds: BoundsLike, tileSize: XYInput | number): RectWritable[] {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);
  const tileWidth = typeof tileSize === 'number' ? tileSize : readX(tileSize);
  const tileHeight = typeof tileSize === 'number' ? tileSize : readY(tileSize);

  if (!Number.isFinite(tileWidth) || tileWidth <= 0 || !Number.isFinite(tileHeight) || tileHeight <= 0) {
    throw new RangeError(
      `grid tile size components must be positive finite numbers, got (${String(tileWidth)}, ${String(tileHeight)})`
    );
  }
  validateGridBoundsFinite(minX, minY, maxX, maxY);

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 0 || height < 0) {
    throw new RangeError(`grid bounds width/height must be non-negative, got (${String(width)}, ${String(height)})`);
  }
  validateGridComputedFinite(width, height);

  const colCount = Math.max(1, Math.ceil(width / tileWidth));
  const rowCount = Math.max(1, Math.ceil(height / tileHeight));
  validateGridCollectionCount(colCount * rowCount);

  const xEdges = buildTileEdges(minX, maxX, tileWidth, colCount);
  const yEdges = buildTileEdges(minY, maxY, tileHeight, rowCount);
  return commitGridRectGrid(out, xEdges, yEdges);
}
