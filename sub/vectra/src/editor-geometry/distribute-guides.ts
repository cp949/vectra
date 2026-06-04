/**
 * distributeGuides — bounds 배열의 distribution guide line collection을 새 배열로 반환하는 companion.
 */

import type { BoundsLike } from '../types';
import { distributeGuidesInto } from './distribute-guides-into';
import type { DistributionGuideResult, DistributionKind } from './types';

/**
 * bounds 배열에 대한 distribution guide line collection을 새 배열로 반환한다.
 *
 * `distributeGuidesInto`의 allocating companion이다.
 * 정렬은 axis(x/y)별 bounds 시작 좌표 오름차순이고, 동좌표는 insertion order로 안정 정렬한다.
 * gap 종류는 인접 item 쌍의 midpoint를 guide value로 기록하고 itemIndices는 두 원본 index를 오름차순으로 담는다.
 * 빈 입력 또는 item이 2개 미만이면 빈 배열을 반환한다.
 * NaN/Infinity 좌표는 silent propagation(IEEE-754 동작)으로 그대로 결과에 담는다.
 * 호출마다 새 result object를 담은 새 배열을 반환한다.
 *
 * @param bounds distribution 대상 bounds 배열
 * @param kind distribution 종류
 * @returns distribution guide 결과 배열
 */
export function distributeGuides(bounds: readonly BoundsLike[], kind: DistributionKind): DistributionGuideResult[] {
  const out: DistributionGuideResult[] = [];
  distributeGuidesInto(out, bounds, kind);
  return out;
}
