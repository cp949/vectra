import type { CircleLike } from '../types';
import { tangentAnglesInto } from './tangent-angles-into';

/**
 * 두 원의 외부(inner=false) 또는 내부(inner=true) 접선 각도를 새 배열로 반환한다.
 *
 * outer tangent(기본): 두 원이 분리됐을 때 외부 접선 각도 2개를 반환한다.
 * inner tangent: 두 원이 겹치지 않을 때 내부 접선 각도 2개를 반환한다.
 * 접선이 존재하지 않거나 두 원이 동일 중심이거나 `r1 <= 0` 또는 `r2 <= 0`이면 빈 배열을 반환한다.
 * 동일한 각도가 epsilon 범위에서 중복되면 한 개만 push되어 결과 길이가 1이 될 수 있다.
 *
 * @param circleA 첫 번째 원
 * @param circleB 두 번째 원
 * @param inner true이면 inner tangent, false이면 outer tangent (기본값 false)
 */
export function tangentAngles(circleA: CircleLike, circleB: CircleLike, inner = false): number[] {
  return tangentAnglesInto([], circleA, circleB, inner);
}
