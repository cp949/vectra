import { readX, readY } from '../internal/xy';
import type { LengthOptions, XYInput } from '../types';

/**
 * 5점 Gauss-Legendre 적분 node와 weight.
 * 구간 [-1, 1] 기준이다.
 */
const GL5_NODES = [0, 0.5384693101, -0.5384693101, 0.9061798459, -0.9061798459] as const;
const GL5_WEIGHTS = [0.5688888889, 0.4786286705, 0.4786286705, 0.2369268851, 0.2369268851] as const;

/**
 * cubic Bezier curve의 한 구간에서 arc length를 Gauss-Legendre 5점 적분으로 계산한다.
 */
function integrateSegment(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  a: number,
  b: number
): number {
  // 구간 [a, b]를 [-1, 1]로 변환: t = (b-a)/2 * u + (a+b)/2
  const halfLen = (b - a) * 0.5;
  const mid = (a + b) * 0.5;

  let sum = 0;

  for (let i = 0; i < GL5_NODES.length; i++) {
    const t = halfLen * GL5_NODES[i] + mid;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const twoMtT = 2 * mt * t;

    // B'(t) = 3[(1-t)^2*(p1-p0) + 2(1-t)t*(p2-p1) + t^2*(p3-p2)]
    const dx = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
    const dy = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));

    sum += GL5_WEIGHTS[i] * Math.hypot(dx, dy);
  }

  return halfLen * sum;
}

/**
 * cubic Bezier curve의 arc length를 Gauss-Legendre 수치 적분으로 계산하고 반환한다.
 *
 * t ∈ [0, 1] 구간을 segments로 분할하여 각 구간에서 5점 GL 적분을 수행한다.
 * global cache 없음. 호출마다 deterministic하게 계산한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param options 적분 옵션
 * @param options.segments 구간 분할 수. 기본값: 12
 * @returns arc length
 */
export function cubicLength(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, options?: LengthOptions): number {
  const segments = options?.segments ?? 12;

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  const step = 1 / segments;
  let total = 0;

  for (let i = 0; i < segments; i++) {
    const a = i * step;
    const b = (i + 1) * step;
    total += integrateSegment(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, a, b);
  }

  return total;
}
