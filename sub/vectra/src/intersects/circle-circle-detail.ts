import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { CircleCircleDetail, CircleLike } from '../types';
import { circleCircleDetailXY } from './circle-circle-intersections.internal';

/**
 * 두 circle circumference의 교차 관계 detail을 반환한다.
 *
 * boolean `intersectsCircleCircle`로 손실되는 tangent / two-point / containment / coincident
 * 구분을 노출한다.
 * - 외접/내접 tangent는 `{ kind: 'point', point, tA, tB }`다. `tA`/`tB`는 각 circle 기준
 *   normalized turn parameter `[0, 1)`다.
 * - proper two-point 교차는 `{ kind: 'two-point', points }`다. `points`는 circle `a` 기준 turn
 *   오름차순이다.
 * - 같은 중심 같은 반지름은 `{ kind: 'overlap' }`이고, 한 circumference가 다른 disk 내부에 있으면
 *   `{ kind: 'contains' }`다.
 * - 외부 분리, radius ≤ 0, non-finite center/radius, scale 복원 후 좌표 overflow는 `{ kind: 'none' }`이다.
 *
 * radius ≤ 0과 non-finite는 boolean relation 성격에 맞춰 `none`으로 처리한다.
 * `distanceToCircle`의 radius clamp 정책은 적용하지 않는다.
 * `epsilon`은 center distance 비교와 tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 * 계산은 공통 scale로 정규화해 `d²`/`r²` overflow를 피한다.
 * `epsilon`은 절대 임계값이며 두 radius보다 충분히 작다고 가정한다. radius가 `epsilon` 규모 이하면
 * 분리/접선 경계가 합쳐져 분리된 circle을 `point`로 분류할 수 있다.
 * 결과는 매 호출 새 plain object를 반환하며 입력 center object를 재사용하지 않는다.
 *
 * @param a 첫 번째 circle. point ordering과 `tA`의 기준이다.
 * @param b 두 번째 circle. `tB`의 기준이다.
 * @param epsilon center distance 및 tangent 판정 임계값
 */
export function circleCircleDetail(a: CircleLike, b: CircleLike, epsilon = DEFAULT_EPSILON): CircleCircleDetail {
  const ca = readCircleCenter(a);
  const cb = readCircleCenter(b);
  return circleCircleDetailXY(
    readX(ca),
    readY(ca),
    readX(cb),
    readY(cb),
    readCircleRadius(a),
    readCircleRadius(b),
    epsilon
  );
}
