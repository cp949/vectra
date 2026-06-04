import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { lineFamilyBoxIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, SegmentLike } from '../types';

/**
 * bounds와 segment가 교차하거나 접하면 true를 반환한다.
 *
 * bounds 4변을 segment로 보고 각 변과의 line-family intersection을 판정한다.
 * inverted bounds (min > max): false.
 * closed boundary 포함 (접점도 true).
 *
 * @param bounds 교차를 판정할 bounds
 * @param line 교차를 판정할 segment
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsBoundsSegment(bounds: BoundsLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  if (x1 < x0 || y1 < y0) return false;
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  return lineFamilyBoxIntersects(lineParam, x0, y0, x1, y1, epsilon);
}
