import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RectLike, XYInput } from '../types';
import { allFinite, curveRectIntersects, makeQuadraticProbe } from './curve-primitive-relation.internal';

/**
 * quadratic Bezier segment와 rect가 교차하면 true를 반환한다.
 *
 * curve가 rect 경계를 가로지르거나 endpoint가 rect 내부(경계 포함)이면 true. rect가 curve를
 * 완전히 둘러싸는 case는 endpoint containment로 잡는다. empty rect (width ≤ 0 또는 height ≤ 0):
 * false. non-finite 입력: false.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param rect 교차를 검사할 rect
 * @param epsilon curve × edge 교차 numeric tolerance
 */
export function intersectsQuadraticRect(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, rx, ry, rw, rh])) return false;

  return curveRectIntersects(makeQuadraticProbe(p0, p1, p2, epsilon), p0x, p0y, p2x, p2y, rx, ry, rw, rh);
}
