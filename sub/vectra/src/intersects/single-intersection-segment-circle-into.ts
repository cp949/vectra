import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { lineFamilyCircleIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { CircleLike, SegmentLike, XYWritable } from '../types';

/**
 * segment와 circle의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * tangent이면 접점을 기록한다. 2-point crossing이면 false (out 미수정).
 * empty circle (radius ≤ 0) 또는 zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param circle 교점을 구할 circle
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentCircleInto(
  out: XYWritable,
  line: SegmentLike,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const center = readCircleCenter(circle);
  return lineFamilyCircleIntersectionPoint(
    out,
    lineParam,
    readX(center),
    readY(center),
    readCircleRadius(circle),
    epsilon
  );
}
