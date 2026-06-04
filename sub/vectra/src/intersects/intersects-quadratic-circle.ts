import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { CircleLike, XYInput } from '../types';
import { allFinite, curveEllipseDiskIntersects } from './curve-primitive-relation.internal';

/**
 * quadratic Bezier segment와 circle이 교차하면 true를 반환한다.
 *
 * closed disk 판정. boundary 접촉(tangent), boundary 가로지르기, endpoint 내부 포함, circle이
 * curve를 완전히 둘러싸는 경우 모두 true. circle은 ellipse kernel에 rx = ry = radius로 환원한다.
 * empty circle (radius ≤ 0): false. non-finite 입력: false.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param circle 교차를 검사할 circle
 * @param epsilon boundary 접촉 판정 tolerance. circle-local 정규화 residual에 대한 무차원
 *   임계값이며 geometric 거리가 아니다. geometric 접촉폭은 radius에 비례한다.
 */
export function intersectsQuadraticCircle(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  circle: CircleLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const center = readCircleCenter(circle);
  const cx = readX(center);
  const cy = readY(center);
  const r = readCircleRadius(circle);
  if (!allFinite([p0x, p0y, p1x, p1y, p2x, p2y, cx, cy, r])) return false;
  if (r <= 0) return false;

  const xCoef = [p0x, 2 * (p1x - p0x), p0x - 2 * p1x + p2x];
  const yCoef = [p0y, 2 * (p1y - p0y), p0y - 2 * p1y + p2y];
  return curveEllipseDiskIntersects(xCoef, yCoef, cx, cy, r, r, epsilon);
}
