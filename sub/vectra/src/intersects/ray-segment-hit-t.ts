import { raySegmentHitTXY } from '../internal/ray-hit-t.internal';
import type { Ray, Segment } from '../types/flat-shapes.internal';

/**
 * ray가 segment와 만나는 ray parameter `t`를 반환한다.
 *
 * `origin + t * direction`이 segment 위의 점이 되는 `t ≥ tMin`인 값이다.
 * 점이 아니라 `t`를 반환하므로 여러 물체 중 가장 가까운 것을 고르는 비교에 그대로 쓴다.
 * - `t`는 `{ dx, dy }` 길이 단위다. direction을 정규화하지 않으므로 거리는 `t * |direction|`이다.
 * - hit이 없으면 `Infinity`를 반환한다. `t < best` 비교와 `Math.min`에 그대로 쓸 수 있다.
 * - segment 끝점 접촉은 hit이다. segment 파라미터는 `[0, 1]` closed 구간을 정확 비교한다.
 * - ray와 segment가 평행하면 `Infinity`다. collinear overlap도 hit으로 보지 않는다.
 * - zero-length segment와 zero direction은 `Infinity`다.
 * - `tMin`은 inclusive다. `t === tMin`인 교점도 hit이다.
 *
 * 반사·굴절 직후 출발 면과 다시 만나는 `t ≈ 0` 교점은 `tMin`에 작은 양수를 주어 거른다.
 * `tMin`도 `{ dx, dy }` 길이 단위다.
 * 평행 판정은 `singleIntersectionSegmentRayInto`와 같다.
 * `tMin`이 `0`이고 단일 교점이 있으면 `origin + t * direction`이 그 함수가 기록하는 교점과 같다.
 * non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 hit 없음(`Infinity`)으로 처리한다.
 *
 * @param ray { ox, oy }에서 { dx, dy } 방향으로 뻗는 반직선.
 * @param segment 교점을 구할 segment
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 * @param epsilon 평행 판정 임계값. 생략하면 `sin θ <= 1e-9`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function raySegmentHitT(ray: Ray, segment: Segment, tMin = 0, epsilon?: number): number {
  return raySegmentHitTXY(
    ray.ox,
    ray.oy,
    ray.dx,
    ray.dy,
    segment.x1,
    segment.y1,
    segment.x2,
    segment.y2,
    tMin,
    epsilon
  );
}
