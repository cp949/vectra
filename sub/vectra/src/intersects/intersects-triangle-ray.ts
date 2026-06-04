import { lineFamilyTriangleIntersects, rayToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { RayLike, TriangleLike } from '../types';

/**
 * triangle과 ray가 교차하면 true를 반환한다.
 *
 * degenerate triangle (세 꼭짓점이 collinear, signed area 2× === 0): false.
 * ray가 triangle 꼭짓점을 지나거나 변 위에 있으면 true.
 * ray direction이 zero-vector인 degenerate ray는 점으로 환원해 triangle 변의 containment로 판정한다.
 *
 * @param triangle 세 꼭짓점으로 정의된 삼각형
 * @param ray origin에서 direction 방향으로 뻗는 반직선
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsTriangleRay(triangle: TriangleLike, ray: RayLike, epsilon = DEFAULT_EPSILON): boolean {
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);
  const lineParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return lineFamilyTriangleIntersects(lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
