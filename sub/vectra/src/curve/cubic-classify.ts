import type { CubicCurveType } from '../types';
import type { CubicCurve } from '../types/flat-shapes.internal';

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
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 */
export function cubicClassify(curve: CubicCurve): CubicCurveType {
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
