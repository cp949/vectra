import { lineFamilyBoxIntersectionPoint, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RectLike, SegmentLike, XYObjectWritable } from '../types';

/**
 * segment와 rect의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 없거나 2개 이상이면 undefined를 반환한다.
 * empty rect (width ≤ 0 또는 height ≤ 0) 또는 zero-length segment이면 undefined.
 * allocating companion — internal helper를 직접 호출한다.
 *
 * @param line 교점을 구할 segment
 * @param rect 교점을 구할 rect
 * @param epsilon 수치 비교 tolerance
 */
export function singleIntersectionSegmentRect(
  line: SegmentLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable | undefined {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return undefined;
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const out: XYObjectWritable = { x: 0, y: 0 };
  return lineFamilyBoxIntersectionPoint(out, lineParam, rx, ry, rx + rw, ry + rh, epsilon) ? out : undefined;
}
