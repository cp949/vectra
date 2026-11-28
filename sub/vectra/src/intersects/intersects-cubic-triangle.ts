import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CubicCurve, Triangle } from '../types/flat-shapes.internal';
import { allFinite, curveTriangleIntersects, makeCubicProbe } from './curve-primitive-relation.internal';

/**
 * cubic Bezier segment와 triangle이 교차하면 true를 반환한다.
 *
 * curve가 triangle 변을 가로지르거나 endpoint가 triangle 내부(경계 포함)이면 true. triangle이
 * curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다. degenerate triangle (signed area
 * 2× === 0): false. non-finite 입력: false.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param triangle 교차를 검사할 triangle
 * @param epsilon curve × edge 교차 numeric tolerance
 */
export function intersectsCubicTriangle(curve: CubicCurve, triangle: Triangle, epsilon = DEFAULT_EPSILON): boolean {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, ax, ay, bx, by, cx, cy])) return false;

  return curveTriangleIntersects(makeCubicProbe(curve, epsilon), p0x, p0y, p3x, p3y, ax, ay, bx, by, cx, cy);
}
