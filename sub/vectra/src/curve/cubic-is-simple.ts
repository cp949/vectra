import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import { solveQuadraticInOpenUnit } from './cubic-solve.internal';

/**
 * cubic Bezier 곡선이 단순한지 확인한다.
 *
 * (0, 1) 범위 내 inflection이 없고 loop도 아닌 경우 true를 반환한다.
 * inflection이 있거나 loop인 곡선은 false를 반환한다.
 *
 * @param p0 cubic Bezier 시작점
 * @param p1 cubic Bezier 첫 번째 제어점
 * @param p2 cubic Bezier 두 번째 제어점
 * @param p3 cubic Bezier 끝점
 */
export function cubicIsSimple(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput): boolean {
  const p0x = readX(p0),
    p0y = readY(p0);
  const p1x = readX(p1),
    p1y = readY(p1);
  const p2x = readX(p2),
    p2y = readY(p2);
  const p3x = readX(p3),
    p3y = readY(p3);

  // power basis
  const ax = -p0x + 3 * p1x - 3 * p2x + p3x;
  const ay = -p0y + 3 * p1y - 3 * p2y + p3y;
  const bx = 3 * p0x - 6 * p1x + 3 * p2x;
  const by = 3 * p0y - 6 * p1y + 3 * p2y;
  const cx = -3 * p0x + 3 * p1x;
  const cy = -3 * p0y + 3 * p1y;

  // inflection 방정식 계수 (B'(t) × B''(t) = 0)
  const A = 3 * (ax * by - ay * bx);
  const B = 3 * (ax * cy - ay * cx);
  const C = bx * cy - by * cx;

  // inflection 검사
  const inflections: number[] = [];
  solveQuadraticInOpenUnit(inflections, A, B, C);
  if (inflections.length > 0) return false;

  // loop 검사 (discriminant < 0인 경우, collinear/quadratic 퇴화는 제외)
  const EPS = 1e-10;
  if (Math.abs(A) < EPS && Math.abs(B) < EPS && Math.abs(C) < EPS) return true;
  if (Math.abs(ax) < EPS && Math.abs(ay) < EPS) return true;

  const discriminant = B * B - 4 * A * C;
  const relThreshold = EPS * Math.max(1, B * B, 4 * Math.abs(A * C));
  if (discriminant < 0 && Math.abs(discriminant) > relThreshold) return false;

  return true;
}
