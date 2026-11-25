import type { XYInput } from '../types';
import { areaX, areaY } from './polygon-area-read.internal';

/**
 * shoelace formula로 polygon points의 2배 signed area를 반환한다.
 *
 * 결과를 2로 나누면 signed area가 된다. 호출자가 points.length >= 3를 보장해야 한다.
 *
 * @param points signed area를 계산할 polygon vertex 목록
 */
export function shoelace2x(points: readonly XYInput[]): number {
  const n = points.length;
  if (n === 0) return 0;
  const first = points[0];
  const x0 = areaX(first);
  const y0 = areaY(first);
  let xi = x0;
  let yi = y0;
  let sum = 0;
  for (let i = 1; i < n; i++) {
    const p = points[i];
    const xj = areaX(p);
    const yj = areaY(p);
    sum += xi * yj - xj * yi;
    xi = xj;
    yi = yj;
  }
  // 마지막 점에서 첫 점으로 닫는 항
  sum += xi * y0 - x0 * yi;
  return sum;
}
