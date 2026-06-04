import type { BoundsLike, RectWritable, XYInput } from '../types';
import { boundsTileInto } from './bounds-tile-into';

/**
 * bounds를 fixed tile size로 나눈 rect collection을 새 `{ x, y, width, height }[]` 배열로 row-major order로 반환한다.
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
 * (`0xffffffff`)를 넘으면 `RangeError`다.
 *
 * @param bounds tile로 나눌 bounds. min/max corner 순서를 그대로 읽는다.
 * @param tileSize tile 크기. number이면 square, `XYInput`이면 축별. 각 성분은 positive finite.
 */
export function boundsTile(bounds: BoundsLike, tileSize: XYInput | number): RectWritable[] {
  return boundsTileInto([], bounds, tileSize);
}
