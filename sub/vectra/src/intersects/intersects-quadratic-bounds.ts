import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Bounds, QuadraticCurve } from '../types/flat-shapes.internal';
import { allFinite, curveBoundsIntersects, makeQuadraticProbe } from './curve-primitive-relation.internal';

/**
 * quadratic Bezier segment와 axis-aligned bounds가 교차하면 true를 반환한다.
 *
 * curve가 bounds 경계를 가로지르거나 endpoint가 bounds 내부(경계 포함)이면 true. bounds가
 * curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다. zero-extent bounds는 유효
 * 입력이고 inverted bounds (min > max)만 false. non-finite 입력: false.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param bounds 교차를 검사할 bounds
 * @param epsilon curve × edge 교차 numeric tolerance
 */
export function intersectsQuadraticBounds(curve: QuadraticCurve, bounds: Bounds, epsilon = DEFAULT_EPSILON): boolean {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const { minX: x0, minY: y0, maxX: x1, maxY: y1 } = bounds;
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, x0, y0, x1, y1])) return false;

  return curveBoundsIntersects(makeQuadraticProbe(curve, epsilon), p0x, p0y, p2x, p2y, x0, y0, x1, y1);
}
