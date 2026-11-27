import type { CubicCurve } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * cubic Bezier 제어점이 정확히 linear (1/3, 2/3 위치) 배열인지 확인한다.
 *
 * p1이 chord 위 1/3, p2가 2/3 위치에 있을 때만 true를 반환한다.
 * 수직 거리뿐 아니라 parametric 위치까지 검사한다.
 * degenerate (p0 == p3)의 경우 모든 점이 같은 점이면 true를 반환한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @param epsilon 허용 오차 (기본값 1e-10)
 */
export function cubicIsLinear(curve: CubicCurve, epsilon = 1e-10): boolean {
  const p0x = curve.x0,
    p0y = curve.y0;
  const p1x = curve.x1,
    p1y = curve.y1;
  const p2x = curve.x2,
    p2y = curve.y2;
  const p3x = curve.x3,
    p3y = curve.y3;

  const chordX = p3x - p0x;
  const chordY = p3y - p0y;
  const chordLen2 = chordX * chordX + chordY * chordY;

  // degenerate: p0 == p3인 경우 모든 점이 같은 점이면 true
  if (chordLen2 < epsilon * epsilon) {
    const d1 = hypot2(p1x - p0x, p1y - p0y);
    const d2 = hypot2(p2x - p0x, p2y - p0y);
    const d3 = hypot2(p3x - p0x, p3y - p0y);
    return d1 < epsilon && d2 < epsilon && d3 < epsilon;
  }

  // p1과 p0 사이의 벡터
  const v1x = p1x - p0x;
  const v1y = p1y - p0y;

  // p1이 chord 위에 있는지 (cross product ≈ 0) 및 1/3 위치인지
  const cross1 = chordX * v1y - chordY * v1x;
  const dot1 = chordX * v1x + chordY * v1y;

  const chordLen = hypot2(chordX, chordY);
  if (Math.abs(cross1) > epsilon * chordLen) return false;
  if (Math.abs(dot1 / chordLen2 - 1 / 3) > epsilon) return false;

  // p2와 p0 사이의 벡터
  const v2x = p2x - p0x;
  const v2y = p2y - p0y;

  // p2가 chord 위에 있는지 및 2/3 위치인지
  const cross2 = chordX * v2y - chordY * v2x;
  const dot2 = chordX * v2x + chordY * v2y;

  if (Math.abs(cross2) > epsilon * chordLen) return false;
  if (Math.abs(dot2 / chordLen2 - 2 / 3) > epsilon) return false;

  return true;
}
