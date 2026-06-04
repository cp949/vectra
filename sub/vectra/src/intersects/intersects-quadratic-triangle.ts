import { DEFAULT_EPSILON } from '../internal/numeric';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { TriangleLike, XYInput } from '../types';
import { allFinite, curveTriangleIntersects, makeQuadraticProbe } from './curve-primitive-relation.internal';

/**
 * quadratic Bezier segment와 triangle이 교차하면 true를 반환한다.
 *
 * curve가 triangle 변을 가로지르거나 endpoint가 triangle 내부(경계 포함)이면 true. triangle이
 * curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다. degenerate triangle (signed area
 * 2× === 0): false. non-finite 입력: false.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param triangle 교차를 검사할 triangle
 * @param epsilon curve × edge 교차 numeric tolerance
 */
export function intersectsQuadraticTriangle(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  triangle: TriangleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, ax, ay, bx, by, cx, cy])) return false;

  return curveTriangleIntersects(makeQuadraticProbe(p0, p1, p2, epsilon), p0x, p0y, p2x, p2y, ax, ay, bx, by, cx, cy);
}
