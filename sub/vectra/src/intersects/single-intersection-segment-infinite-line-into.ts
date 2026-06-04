import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  segmentToLineFamilyParam,
} from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, SegmentLike, XYWritable } from '../types';

/**
 * segment와 infinite-line의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 없거나 collinear/parallel이면 false를 반환하고 out을 수정하지 않는다.
 * zero-length segment이면 false.
 *
 * @param out 교점 좌표를 기록할 writable output
 * @param line 교점을 구할 segment
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 및 거리 임계값
 */
export function singleIntersectionSegmentInfiniteLineInto(
  out: XYWritable,
  line: SegmentLike,
  infLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readInfiniteLineOrigin(infLine);
  const dir = readInfiniteLineDirection(infLine);

  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const infParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));

  return lineFamilyIntersectionPoint(out, lineParam, infParam, epsilon);
}
