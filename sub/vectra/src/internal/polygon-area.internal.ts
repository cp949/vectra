import type { XYInput } from '../types';
import { readX, readY } from './xy';

/**
 * shoelace formula로 polygon points의 2배 signed area를 반환한다.
 *
 * 결과를 2로 나누면 signed area가 된다. 호출자가 points.length >= 3를 보장해야 한다.
 *
 * @param points signed area를 계산할 polygon vertex 목록
 */
export function shoelace2x(points: readonly XYInput[]): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += readX(points[i]) * readY(points[j]) - readX(points[j]) * readY(points[i]);
  }
  return sum;
}
