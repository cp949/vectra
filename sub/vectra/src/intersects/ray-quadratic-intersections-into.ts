import { quadraticLineIntersectionsInto } from '../curve/quadratic-line-intersections-into';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type {
  CurveIntersectionOptions,
  IntersectionHit,
  RayLike,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../types';

/**
 * ray와 quadratic Bezier curve의 교차점을 outHits에 push한다.
 *
 * ray를 infinite-line으로 변환해 quadraticLineIntersectionsInto를 호출한 뒤
 * tA >= 0 (ray 앞 방향) 조건에 맞는 hit만 남긴다.
 * tA는 ray line parameter (origin + direction * tA), tB는 curve parameter [0,1]이다.
 *
 * @param outHits 결과 배열 (호출 전 비워야 한다)
 * @param ray origin에서 direction 방향으로 뻗는 반직선
 * @param p0 quadratic curve 시작점
 * @param p1 quadratic curve 제어점
 * @param p2 quadratic curve 끝점
 * @param options epsilon, epsilonT 제어 옵션. 미지정 시 기본값 사용.
 */
export function rayQuadraticIntersectionsInto<P extends XYWritable = XYObjectWritable>(
  outHits: IntersectionHit<P>[],
  ray: RayLike,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  options?: CurveIntersectionOptions
): void {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const line = {
    origin: { x: readX(origin), y: readY(origin) },
    direction: { x: readX(direction), y: readY(direction) },
  };

  quadraticLineIntersectionsInto(outHits, p0, p1, p2, line, options);

  // ray는 tA >= 0 범위만 유효하다 — tA < 0 hit를 제거한다
  let i = outHits.length - 1;
  while (i >= 0) {
    if (outHits[i].tA < 0) {
      outHits.splice(i, 1);
    }
    i--;
  }
}
