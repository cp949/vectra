import { rayBoxHitTXY } from '../internal/ray-hit-t.internal';
import { readRayDirectionX, readRayDirectionY, readRayOriginX, readRayOriginY } from '../internal/ray-scalar.internal';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RayLike, RectLike } from '../types';

/**
 * ray가 rect boundary와 처음 만나는 ray parameter `t`를 반환한다.
 *
 * `origin + t * direction`이 rect boundary 위의 점이 되는 `t ≥ tMin` 중 가장 작은 값이다.
 * 점이 아니라 `t`를 반환하므로 여러 물체 중 가장 가까운 것을 고르는 비교에 그대로 쓴다.
 * - `t`는 `ray.direction` 길이 단위다. direction을 정규화하지 않으므로 거리는 `t * |direction|`이다.
 * - hit이 없으면 `Infinity`를 반환한다. `t < best` 비교와 `Math.min`에 그대로 쓸 수 있다.
 * - origin이 rect 밖이면 진입 교점의 `t`다. 안이면 exit 교점의 `t`다.
 * - 모서리·변 접촉은 hit이다. rect는 closed다.
 * - 변을 따라 달리는 ray는 rect에 들어서는 모서리의 `t`를 반환한다.
 * - empty rect(width ≤ 0 또는 height ≤ 0)와 zero direction은 `Infinity`다.
 * - `tMin`은 inclusive다. `t === tMin`인 교점도 hit이다.
 *
 * 반사·굴절 직후 출발 면과 다시 만나는 `t ≈ 0` 교점은 `tMin`에 작은 양수를 주어 거른다.
 * `tMin`도 `ray.direction` 길이 단위다.
 * `tMin`이 `0`이면 `origin + t * direction`이 `rayRectIntersectionsInto`가 첫 번째로 기록하는 교점과 같다.
 * non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 hit 없음(`Infinity`)으로 처리한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선. tuple `[ox, oy, dx, dy]`도 받는다.
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 */
export function rayRectHitT(ray: RayLike, rect: RectLike, tMin = 0): number {
  const width = readRectWidth(rect);
  const height = readRectHeight(rect);
  if (width <= 0 || height <= 0) return Infinity;

  const x = readRectX(rect);
  const y = readRectY(rect);
  return rayBoxHitTXY(
    readRayOriginX(ray),
    readRayOriginY(ray),
    readRayDirectionX(ray),
    readRayDirectionY(ray),
    x,
    y,
    x + width,
    y + height,
    tMin
  );
}
