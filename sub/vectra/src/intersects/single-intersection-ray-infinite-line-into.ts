import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  rayToLineFamilyParam,
} from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, RayLike, XYWritable } from '../types';

/**
 * ray와 infinite-line의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * collinear/parallel이면 false를 반환하고 out을 수정하지 않는다.
 * ray 범위 밖(t < 0)의 교점: false. aliasing 불가.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 임계값
 */
export function singleIntersectionRayInfiniteLineInto(
  out: XYWritable,
  ray: RayLike,
  infLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const infOrigin = readInfiniteLineOrigin(infLine);
  const infDir = readInfiniteLineDirection(infLine);

  const rayParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const infParam = infiniteLineToLineFamilyParam(readX(infOrigin), readY(infOrigin), readX(infDir), readY(infDir));

  return lineFamilyIntersectionPoint(out, rayParam, infParam, epsilon);
}
