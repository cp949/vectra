import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  segmentToLineFamilyParam,
} from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, SegmentLike, XYObjectWritable } from '../types';

/**
 * segment와 infinite-line의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 있으면 `{ x, y }` object를 반환하고, 없으면 undefined를 반환한다.
 * collinear/parallel 또는 zero-length segment이면 undefined를 반환한다.
 * allocating companion — Into leaf를 거치지 않고 internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param infLine 교점을 구할 infinite-line
 * @param epsilon cross product 절대값 및 거리 임계값
 */
export function singleIntersectionSegmentInfiniteLine(
  line: SegmentLike,
  infLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readInfiniteLineOrigin(infLine);
  const dir = readInfiniteLineDirection(infLine);

  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const infParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));

  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyIntersectionPoint(out, lineParam, infParam, epsilon) ? out : undefined;
}
