import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { rayBoxHitTXY } from '../internal/ray-hit-t.internal';
import { readRayDirectionX, readRayDirectionY, readRayOriginX, readRayOriginY } from '../internal/ray-scalar.internal';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, RayLike } from '../types';

/**
 * ray가 bounds boundary와 처음 만나는 ray parameter `t`를 반환한다.
 *
 * `origin + t * direction`이 bounds boundary 위의 점이 되는 `t ≥ tMin` 중 가장 작은 값이다.
 * 의미와 `Infinity` 규칙은 `rayRectHitT`와 같다. empty 기준만 다르다.
 * - `t`는 `ray.direction` 길이 단위다. direction을 정규화하지 않는다.
 * - hit이 없으면 `Infinity`를 반환한다.
 * - origin이 bounds 밖이면 진입 교점의 `t`다. 안이면 exit 교점의 `t`다.
 * - 모서리·변 접촉은 hit이다. bounds는 closed다.
 * - inverted bounds(max < min)와 zero direction은 `Infinity`다.
 * - zero-extent bounds(점·선)는 유효하다. ray가 그 점이나 선을 지나면 hit이다.
 * - `tMin`은 inclusive다. `t === tMin`인 교점도 hit이다.
 *
 * `tMin`이 `0`이면 `origin + t * direction`이 `rayBoundsIntersectionsInto`가 첫 번째로 기록하는 교점과 같다.
 * non-finite 입력은 검증하지 않는다. 계산이 NaN이 되면 hit 없음(`Infinity`)으로 처리한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선. tuple `[ox, oy, dx, dy]`도 받는다.
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param tMin 허용하는 가장 작은 `t`. 생략하면 `0`이다.
 */
export function rayBoundsHitT(ray: RayLike, bounds: BoundsLike, tMin = 0): number {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  if (x1 < x0 || y1 < y0) return Infinity;

  return rayBoxHitTXY(
    readRayOriginX(ray),
    readRayOriginY(ray),
    readRayDirectionX(ray),
    readRayDirectionY(ray),
    x0,
    y0,
    x1,
    y1,
    tMin
  );
}
