import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { EllipseEllipseDetail, EllipseLike } from '../types';
import { ellipseEllipseDetailXY } from './ellipse-ellipse-detail.internal';

/**
 * 두 axis-aligned ellipse boundary의 교차 관계 detail을 반환한다.
 *
 * boolean relation으로 손실되는 tangent / two-point / multi-point / containment / coincident
 * 구분을 노출한다. circumference(경계선) 교점 관계이며 disk area overlap이 아니다.
 * - 외접/내접 tangent는 `{ kind: 'point', point, tA, tB }`다. `tA`/`tB`는 각 ellipse 기준
 *   normalized turn parameter `[0, 1)`다.
 * - proper 2점 교차는 `{ kind: 'two-point', points }`, 3~4점 교차는 `{ kind: 'multi-point', points }`다.
 *   `points`는 ellipse `a` 기준 turn 오름차순이다.
 * - 같은 center 같은 radiusX/radiusY는 `{ kind: 'overlap' }`이고, 한 ellipse가 다른 ellipse 내부에
 *   있어 경계 교점이 없으면 `{ kind: 'contains' }`다.
 * - 외부 분리, boundary 교점 없는 disjoint, empty ellipse(radiusX/radiusY ≤ 0), non-finite
 *   center/radius, quartic 계수 무효, scale 복원 후 좌표 overflow는 `{ kind: 'none' }`이다.
 *
 * radiusX/radiusY ≤ 0과 non-finite는 boolean relation 성격에 맞춰 `none`으로 처리한다.
 * `epsilon`은 coincident/tangent/containment 판정에만 쓰고 finite validation에는 쓰지 않는다
 * (finite는 `Number.isFinite`로 별도 검사). 계산은 공통 scale로 정규화하되 center offset은
 * 정규화 전에 직접 차분해 local offset 손실을 피하고, 차분 conic을 quartic으로 환원해 최대 4점을
 * 모두 계산한다. 각 교점은 양쪽 ellipse 방정식 residual 가드를 통과한 점만 채택한다.
 * `epsilon`은 절대 임계값이며 두 radius보다 충분히 작다고 가정한다. radius가 `epsilon` 규모 이하면
 * 분리/접선 경계가 합쳐져 분류가 틀어질 수 있다.
 * 결과는 매 호출 새 plain object를 반환하며 입력 center object를 재사용하지 않는다.
 *
 * @param a 첫 번째 ellipse. point ordering과 `tA`의 기준이다.
 * @param b 두 번째 ellipse. `tB`의 기준이다.
 * @param epsilon coincident / tangent / containment 판정 임계값
 */
export function ellipseEllipseDetail(a: EllipseLike, b: EllipseLike, epsilon = DEFAULT_EPSILON): EllipseEllipseDetail {
  const ca = readEllipseCenter(a);
  const cb = readEllipseCenter(b);
  return ellipseEllipseDetailXY(
    readX(ca),
    readY(ca),
    readEllipseRadiusX(a),
    readEllipseRadiusY(a),
    readX(cb),
    readY(cb),
    readEllipseRadiusX(b),
    readEllipseRadiusY(b),
    epsilon
  );
}
