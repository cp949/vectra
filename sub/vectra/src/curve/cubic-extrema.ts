import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import { solveQuadraticInOpenUnit } from './cubic-solve.internal';

/**
 * cubic Bezier curve의 x/y 방향 extrema t 값을 반환한다.
 *
 * t ∈ (0, 1) 범위의 extrema t 값을 오름차순으로 담아 반환한다.
 * endpoint(t=0, t=1)는 제외한다.
 * epsilon 내 중복 t 값은 하나로 병합한다.
 *
 * B'(t)의 x/y 성분을 각각 0으로 놓고 quadratic 방정식을 푼다:
 * ```
 * a = -p0 + 3p1 - 3p2 + p3
 * b = 2(p0 - 2p1 + p2)
 * c = -p0 + p1
 * at² + bt + c = 0
 * ```
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 */
export function cubicExtrema(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput): number[] {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  const temps: number[] = [];

  // x 방향 extrema: a_x t² + b_x t + c_x = 0
  // B'(t)의 x 성분을 3으로 나누면 quadratic의 계수가 됨
  const ax = -p0x + 3 * p1x - 3 * p2x + p3x;
  const bx = 2 * (p0x - 2 * p1x + p2x);
  const cx = -p0x + p1x;
  solveQuadraticInOpenUnit(temps, ax, bx, cx);

  // y 방향 extrema
  const ay = -p0y + 3 * p1y - 3 * p2y + p3y;
  const by = 2 * (p0y - 2 * p1y + p2y);
  const cy = -p0y + p1y;
  solveQuadraticInOpenUnit(temps, ay, by, cy);

  // 오름차순 정렬
  temps.sort((a, b) => a - b);

  // epsilon 내 중복 제거
  const out: number[] = [];
  const DEDUP_EPS = 1e-10;
  for (let i = 0; i < temps.length; i++) {
    if (i === 0 || temps[i] - temps[i - 1] > DEDUP_EPS) {
      out.push(temps[i]);
    }
  }

  return out;
}
