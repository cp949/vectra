import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * cubic Bezier curve의 파라미터 t 위치에서 signed curvature scalar를 반환한다.
 *
 * 수식:
 * ```
 * d1 = B'(t) = 3[(1-t)²*(p1-p0) + 2(1-t)t*(p2-p1) + t²*(p3-p2)]
 * d2 = B''(t) = 6[(1-t)*(p2-2p1+p0) + t*(p3-2p2+p1)]
 * κ = (d1.x * d2.y - d1.y * d2.x) / |d1|^3
 * ```
 *
 * `|d1|^3 < 1e-10`이면 degenerate로 간주하고 `0`을 반환한다.
 * 양수 curvature는 반시계 방향(CCW) 굽힘을 나타낸다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicCurvatureAt(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, t: number): number {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const twoMtT = 2 * mt * t;

  // 1차 도함수: B'(t) = 3[(1-t)²*(p1-p0) + 2(1-t)t*(p2-p1) + t²*(p3-p2)]
  const d1x = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
  const d1y = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));

  // 2차 도함수: B''(t) = 6[(1-t)*(p2-2p1+p0) + t*(p3-2p2+p1)]
  const d2x = 6 * (mt * (p2x - 2 * p1x + p0x) + t * (p3x - 2 * p2x + p1x));
  const d2y = 6 * (mt * (p2y - 2 * p1y + p0y) + t * (p3y - 2 * p2y + p1y));

  // |d1|^3 계산
  const d1Len = Math.hypot(d1x, d1y);
  const d1Cubed = d1Len * d1Len * d1Len;

  if (d1Cubed < 1e-10) {
    return 0;
  }

  return (d1x * d2y - d1y * d2x) / d1Cubed;
}
