import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { lineFamilyCircleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { CircleLike, SegmentLike, XYObjectWritable } from '../types';

/**
 * segment와 circle의 단일 교점을 새 object로 반환한다.
 *
 * tangent이면 접점 object를 반환한다. 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * empty circle (radius ≤ 0) 또는 zero-length segment이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentCircle(
  line: SegmentLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const center = readCircleCenter(circle);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyCircleIntersectionPoint(
    out,
    lineParam,
    readX(center),
    readY(center),
    readCircleRadius(circle),
    epsilon
  )
    ? out
    : undefined;
}
