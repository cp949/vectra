import { DEFAULT_EPSILON } from '../internal/numeric';
import { rayEllipseHitTXY } from '../internal/ray-hit-t.internal';

/**
 * ray `(ox, oy) + t (dx, dy)`가 circle `(cx, cy, radius)` 둘레와 처음 만나는 `t`를 반환한다.
 *
 * `rayCircleHitT`를 좌표 숫자로 받는 버전이다. 결과는 같은 입력의 `rayCircleHitT`와 같다.
 * 매 프레임 수천 번 부르는 hot path에서 ray·circle 객체를 만들거나 읽는 비용을 없앤다.
 * - hit이 없으면 `Infinity`다. origin이 안쪽이면 exit 교점이다.
 * - `t`와 `tMin`은 direction 길이 단위다. direction을 정규화하지 않는다.
 * - zero direction과 radius ≤ 0은 `Infinity`다.
 * - non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 `Infinity`다.
 *
 * @param ox ray origin x
 * @param oy ray origin y
 * @param dx ray direction x
 * @param dy ray direction y
 * @param cx circle 중심 x
 * @param cy circle 중심 y
 * @param radius circle 반지름
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 * @param epsilon discriminant tangent 판정 임계값. 생략하면 `1e-9`다.
 */
export function rayCircleHitTXY(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  radius: number,
  tMin = 0,
  epsilon = DEFAULT_EPSILON
): number {
  return rayEllipseHitTXY(ox, oy, dx, dy, cx, cy, radius, radius, tMin, epsilon);
}
