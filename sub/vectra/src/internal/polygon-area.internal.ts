import type { Polygon } from '../types/flat-shapes.internal';

/**
 * shoelace formula로 polygon points의 2배 signed area를 반환한다.
 *
 * 결과를 2로 나누면 signed area가 된다. 호출자가 polygon.length >= 6를 보장해야 한다.
 *
 * @param polygon signed area를 계산할 polygon vertex 목록
 */
export function shoelace2x(polygon: Polygon): number {
  const n = polygon.length / 2;
  if (n === 0) return 0;
  const x0 = polygon[0];
  const y0 = polygon[1];
  let xi = x0;
  let yi = y0;
  let sum = 0;
  for (let i = 1; i < n; i++) {
    const xj = polygon[2 * i];
    const yj = polygon[2 * i + 1];
    sum += xi * yj - xj * yi;
    xi = xj;
    yi = yj;
  }
  // 마지막 점에서 첫 점으로 닫는 항
  sum += xi * y0 - x0 * yi;
  return sum;
}
