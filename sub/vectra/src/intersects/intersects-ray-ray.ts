import { lineFamilyIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { RayLike } from '../types';

/**
 * 두 ray가 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * collinear이고 range가 겹치면 true. 반대 방향으로 collinear이면 false.
 * direction이 zero-vector인 degenerate ray는 점으로 환원해 다른 쪽 ray의 containment로 판정한다.
 *
 * @param a 첫 번째 ray
 * @param b 두 번째 ray
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsRayRay(a: RayLike, b: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const ao = readRayOrigin(a);
  const ad = readRayDirection(a);
  const bo = readRayOrigin(b);
  const bd = readRayDirection(b);
  return lineFamilyIntersects(
    rayToLineFamilyParam(readX(ao), readY(ao), readX(ad), readY(ad)),
    rayToLineFamilyParam(readX(bo), readY(bo), readX(bd), readY(bd)),
    epsilon
  );
}
