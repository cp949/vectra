import { lineFamilyIntersectionPoint, rayToLineFamilyParam, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RayLike, SegmentLike, XYObjectWritable } from '../types';

/**
 * segment와 ray의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 있으면 `{ x, y }` object를 반환하고, 없으면 undefined를 반환한다.
 * collinear/parallel 또는 zero-length segment이면 undefined를 반환한다.
 * allocating companion — Into leaf를 거치지 않고 internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param ray 교점을 구할 ray
 * @param epsilon cross product 절대값 및 거리 임계값
 */
export function singleIntersectionSegmentRay(
  line: SegmentLike,
  ray: RayLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readRayOrigin(ray);
  const dir = readRayDirection(ray);

  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const rayParam = rayToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));

  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyIntersectionPoint(out, lineParam, rayParam, epsilon) ? out : undefined;
}
