/**
 * distributeEqually — bounds 배열의 균등 분배 target collection을 새 배열로 반환하는 companion.
 */

import type { BoundsLike, XYObjectWritable } from '../types';
import { distributeEquallyInto } from './distribute-equally-into';
import type { DistributeTarget, DistributionKind } from './types';

/**
 * bounds 배열을 균등 분배한 target top-left collection을 새 배열로 반환한다.
 *
 * `distributeEquallyInto`의 allocating companion이다. caller factory 인자를 받지 않고 default
 * factory가 target마다 새 plain `{ x, y }` object를 만든다(같은 point object를 재사용하지 않는다).
 * 출력 point는 offset이 아니라 absolute target top-left다.
 * 정렬은 axis별 bounds 시작 좌표 오름차순(동좌표는 insertion order 안정 정렬).
 * 양 끝 item(정렬 기준 첫/마지막)은 이동하지 않으므로 결과에 포함하지 않고 중간 item target만 담는다.
 * 빈 입력 또는 item이 3개 미만이면 빈 배열을 반환한다.
 * degenerate bounds와 NaN/Infinity 좌표는 silent propagation(IEEE-754 동작)으로 그대로 담는다.
 * gap-x/y에서 items가 겹치면 equalGap이 음수가 될 수 있다.
 * 호출마다 새 배열을 반환한다.
 *
 * @param bounds distribution 대상 bounds 배열
 * @param kind distribution 종류
 * @returns 중간 item target 배열
 */
export function distributeEqually(
  bounds: readonly BoundsLike[],
  kind: DistributionKind
): DistributeTarget<XYObjectWritable>[] {
  const out: DistributeTarget<XYObjectWritable>[] = [];
  distributeEquallyInto(out, bounds, kind, () => ({ x: 0, y: 0 }));
  return out;
}
