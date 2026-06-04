import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  rayToLineFamilyParam,
} from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, RayLike, XYObjectWritable } from '../types';

/**
 * ray와 infinite-line의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 있으면 `{ x, y }` object를 반환한다. 교점이 없으면 undefined를 반환한다.
 * collinear/parallel: undefined. ray 범위 밖(t < 0)의 교점: undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 임계값
 */
export function singleIntersectionRayInfiniteLine(
  ray: RayLike,
  infLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const infOrigin = readInfiniteLineOrigin(infLine);
  const infDir = readInfiniteLineDirection(infLine);

  const rayParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const infParam = infiniteLineToLineFamilyParam(readX(infOrigin), readY(infOrigin), readX(infDir), readY(infDir));

  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyIntersectionPoint(out, rayParam, infParam, epsilon) ? out : undefined;
}
