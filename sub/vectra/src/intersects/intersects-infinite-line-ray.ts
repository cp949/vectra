import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, RayLike } from '../types';

/**
 * infinite-line과 ray가 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * collinear (infinite-line 위에 ray origin이 있고 방향이 평행): true.
 * ray direction이 zero-vector인 degenerate ray는 점으로 환원해 infinite-line의 containment로 판정한다.
 *
 * @param infLine infinite-line
 * @param ray origin에서 direction 방향으로 뻗는 반직선
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsInfiniteLineRay(infLine: InfiniteLineLike, ray: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const infOrigin = readInfiniteLineOrigin(infLine);
  const infDir = readInfiniteLineDirection(infLine);

  const rayParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const infParam = infiniteLineToLineFamilyParam(readX(infOrigin), readY(infOrigin), readX(infDir), readY(infDir));

  return lineFamilyIntersects(rayParam, infParam, epsilon);
}
