import { readX, readY } from '../internal/xy';
import type { CubicCurveType, XYInput } from '../types';

/**
 * cubic Bezier 곡선의 형태를 분류한다.
 *
 * power basis 변환 후 discriminant를 계산하여 다섯 가지 형태 중 하나를 반환한다.
 * - `'line'`      : 모든 제어점이 collinear (퇴화 직선)
 * - `'quadratic'` : t^3 계수가 0 (2차 Bezier로 퇴화)
 * - `'cusp'`      : discriminant ≈ 0 (첨점)
 * - `'loop'`      : discriminant < 0 (자기교차)
 * - `'serpentine'`: discriminant > 0 (S자형, 두 개의 inflection)
 *
 * @param p0 cubic Bezier 시작점
 * @param p1 cubic Bezier 첫 번째 제어점
 * @param p2 cubic Bezier 두 번째 제어점
 * @param p3 cubic Bezier 끝점
 */
export function cubicClassify(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput): CubicCurveType {
  const p0x = readX(p0),
    p0y = readY(p0);
  const p1x = readX(p1),
    p1y = readY(p1);
  const p2x = readX(p2),
    p2y = readY(p2);
  const p3x = readX(p3),
    p3y = readY(p3);

  // power basis: a = t^3 계수, b = t^2 계수, c = t^1 계수
  const ax = -p0x + 3 * p1x - 3 * p2x + p3x;
  const ay = -p0y + 3 * p1y - 3 * p2y + p3y;
  const bx = 3 * p0x - 6 * p1x + 3 * p2x;
  const by = 3 * p0y - 6 * p1y + 3 * p2y;
  const cx = -3 * p0x + 3 * p1x;
  const cy = -3 * p0y + 3 * p1y;

  const EPS = 1e-10;

  // inflection 방정식 계수: cross product 기반 collinear 검사
  const A = 3 * (ax * by - ay * bx);
  const B = 3 * (ax * cy - ay * cx);
  const C = bx * cy - by * cx;

  // 모두 0: 모든 제어점이 collinear (직선)
  if (Math.abs(A) < EPS && Math.abs(B) < EPS && Math.abs(C) < EPS) {
    return 'line';
  }

  // t^3 계수가 0: quadratic 퇴화
  if (Math.abs(ax) < EPS && Math.abs(ay) < EPS) {
    return 'quadratic';
  }

  const discriminant = B * B - 4 * A * C;

  // 상대적 threshold: discriminant 크기에 비례하여 cusp 판별
  const relThreshold = EPS * Math.max(1, B * B, 4 * Math.abs(A * C));

  if (Math.abs(discriminant) < relThreshold) return 'cusp';
  if (discriminant < 0) return 'loop';
  return 'serpentine';
}
