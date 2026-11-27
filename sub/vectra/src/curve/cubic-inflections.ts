import type { CubicCurve } from '../types/flat-shapes.internal';
import { solveQuadraticInOpenUnit } from './cubic-solve.internal';

/**
 * cubic Bezier 곡선의 inflection point t값을 반환한다.
 *
 * power basis 변환 후 B'(t) × B''(t) = 0 방정식을 풀어
 * t ∈ (0, 1) 범위 내 근만 오름차순으로 담아 반환한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 */
export function cubicInflections(curve: CubicCurve): number[] {
  const out: number[] = [];

  const p0x = curve.x0,
    p0y = curve.y0;
  const p1x = curve.x1,
    p1y = curve.y1;
  const p2x = curve.x2,
    p2y = curve.y2;
  const p3x = curve.x3,
    p3y = curve.y3;

  // power basis: a = t^3 계수, b = t^2 계수, c = t^1 계수
  const ax = -p0x + 3 * p1x - 3 * p2x + p3x;
  const ay = -p0y + 3 * p1y - 3 * p2y + p3y;
  const bx = 3 * p0x - 6 * p1x + 3 * p2x;
  const by = 3 * p0y - 6 * p1y + 3 * p2y;
  const cx = -3 * p0x + 3 * p1x;
  const cy = -3 * p0y + 3 * p1y;

  // B'(t) × B''(t) = 0 을 정리하면 A*t^2 + B*t + C = 0
  const A = 3 * (ax * by - ay * bx);
  const B = 3 * (ax * cy - ay * cx);
  const C = bx * cy - by * cx;

  solveQuadraticInOpenUnit(out, A, B, C);
  out.sort((a, b) => a - b);

  return out;
}
