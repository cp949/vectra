import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CubicCurve, Rect } from '../types/flat-shapes.internal';
import { allFinite, curveRectIntersects, makeCubicProbe } from './curve-primitive-relation.internal';

/**
 * cubic Bezier segment와 rect가 교차하면 true를 반환한다.
 *
 * curve가 rect 경계를 가로지르거나 endpoint가 rect 내부(경계 포함)이면 true. rect가 curve를
 * 완전히 둘러싸는 case는 endpoint containment로 잡는다. empty rect (width ≤ 0 또는 height ≤ 0):
 * false. non-finite 입력: false.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param rect 교차를 검사할 rect
 * @param epsilon curve × edge 교차 numeric tolerance
 */
export function intersectsCubicRect(curve: CubicCurve, rect: Rect, epsilon = DEFAULT_EPSILON): boolean {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;
  const { x: rx, y: ry, width: rw, height: rh } = rect;
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, rx, ry, rw, rh])) return false;

  return curveRectIntersects(makeCubicProbe(curve, epsilon), p0x, p0y, p3x, p3y, rx, ry, rw, rh);
}
