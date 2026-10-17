import { lineFamilyBoxIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RectLike, SegmentLike } from '../types';

/**
 * rect와 segment가 교차하거나 접하면 true를 반환한다.
 *
 * rect 4변과의 line-family intersection으로 판정한다.
 * empty rect (width ≤ 0 또는 height ≤ 0): false.
 *
 * @param rect 교차를 검사할 rect
 * @param line 교차를 검사할 segment
 * @param epsilon 수치 비교 tolerance
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsRectSegment(rect: RectLike, line: SegmentLike, epsilon?: number): boolean {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersects(lineParam, rx, ry, rx + rw, ry + rh, epsilon);
}
