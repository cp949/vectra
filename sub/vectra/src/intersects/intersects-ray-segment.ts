import { lineFamilyIntersects, rayToLineFamilyParam, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RayLike, SegmentLike } from '../types';

/**
 * ray와 segment가 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * collinear이고 range가 겹치면 true.
 * ray direction이 zero-vector인 degenerate ray는 점으로 환원해 segment의 containment로 판정한다.
 * zero-length segment는 점으로 환원해 ray의 containment로 판정한다.
 *
 * @param ray origin에서 direction 방향으로 뻗는 반직선
 * @param line 두 끝점으로 정의된 유한 선분
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsRaySegment(ray: RayLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);

  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const rayParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));

  return lineFamilyIntersects(lineParam, rayParam, epsilon);
}
