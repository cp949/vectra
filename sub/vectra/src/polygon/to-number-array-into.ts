import type { Polygon } from '../types/flat-shapes.internal';

/**
 * polygon vertex를 `[x0, y0, x1, y1, ...]` flat coordinate number 배열로 out에 기록한다.
 *
 * output-only serialization helper다. out은 먼저 clear된 뒤 좌표가 push되며, 같은 out을 반환한다.
 * point-collection 기준이다. `points.length`가 0이면 빈 배열을 반환한다.
 * 좌표 finite 여부를 검사하지 않고 그대로 기록한다(non-finite pass-through). `-0`도 canonicalize하지 않는다.
 * out의 기존 좌표를 덮어쓰고 길이를 입력과 맞춘다. 입력과 out이 같은 배열이어도 안전하다.
 *
 * @param out 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param polygon vertex를 읽을 polygon
 */
export function toNumberArrayInto(out: number[], polygon: Polygon): number[] {
  for (let i = 0; i < polygon.length; i++) {
    out[i] = polygon[i];
  }
  out.length = polygon.length;
  return out;
}
