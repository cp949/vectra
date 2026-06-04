import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, SegmentLike } from '../types';

/**
 * ellipse와 segment가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing, segment endpoint 내부 포함 모두 true.
 * degenerate ellipse (rx ≤ 0 또는 ry ≤ 0): false.
 * degenerate segment (a === b): a가 ellipse 경계/내부이면 true.
 *
 * @param ellipse 교차를 검사할 ellipse
 * @param line 교차를 검사할 segment
 * @param epsilon 수치 비교 tolerance
 */
export function intersectsEllipseSegment(ellipse: EllipseLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const center = readEllipseCenter(ellipse);
  return lineFamilyEllipseIntersects(
    readX(a),
    readY(a),
    readX(b) - readX(a),
    readY(b) - readY(a),
    'finite',
    readX(center),
    readY(center),
    readEllipseRadiusX(ellipse),
    readEllipseRadiusY(ellipse),
    epsilon
  );
}
