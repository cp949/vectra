import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { AreaOverlapDetail, BoundsLike } from '../types';
import { axisAlignedAreaOverlapDetail } from './area-overlap-detail.internal';

/**
 * 두 bounds의 면적 중첩 관계 detail을 반환한다.
 *
 * boolean `intersectsBoundsBounds`로 손실되는 touch / overlap / contains 구분을 노출한다.
 * 실제 면적 numeric value나 clipping 결과는 담지 않는다.
 * - `none`: 분리되거나 한쪽이 empty/inverted bounds(max ≤ min)다.
 * - `touch`: 경계에서만 닿는다. corner touch는 점 1개, edge touch는 닿는 선분 양 끝점 2개다.
 * - `overlap`: 양의 면적으로 겹치고 어느 쪽도 다른 쪽을 완전히 포함하지 않는다.
 * - `contains`: 한쪽이 다른 쪽을 완전히 포함한다. 완전히 같은 bounds도 `contains`다.
 *
 * `AreaOverlapDetail`은 어느 쪽이 포함자인지 표현하지 않는다.
 * touch point는 매 호출 새로 만든 plain `{ x, y }` object이며 입력 좌표 object를 재사용하지 않는다.
 * fixed plain result object이며 `Into`/companion 대상이 아니다.
 * `epsilon`은 경계 분류 임계값이며 finite validation에는 쓰지 않는다. non-finite 좌표는 `none`이다.
 *
 * @param a 첫 번째 bounds
 * @param b 두 번째 bounds
 * @param epsilon touch/overlap/contains 경계 판정 임계값
 */
export function boundsBoundsAreaOverlapDetail(
  a: BoundsLike,
  b: BoundsLike,
  epsilon = DEFAULT_EPSILON
): AreaOverlapDetail {
  const aMin = readBoundsMin(a);
  const aMax = readBoundsMax(a);
  const bMin = readBoundsMin(b);
  const bMax = readBoundsMax(b);
  const aMinX = readX(aMin);
  const aMinY = readY(aMin);
  const bMinX = readX(bMin);
  const bMinY = readY(bMin);
  return axisAlignedAreaOverlapDetail(
    aMinX,
    aMinY,
    readX(aMax) - aMinX,
    readY(aMax) - aMinY,
    bMinX,
    bMinY,
    readX(bMax) - bMinX,
    readY(bMax) - bMinY,
    epsilon
  );
}
