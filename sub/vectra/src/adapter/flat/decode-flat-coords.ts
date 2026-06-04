import type { XYObjectWritable } from '../../types/index';
import { decodeFlatCoordsInto } from './decode-flat-coords-into';

/**
 * `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 배열을 decode해 새 배열로 반환한다.
 *
 * - 새 `{ x, y }` object 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link decodeFlatCoordsInto}를 사용한다.
 * - flat.length가 홀수이면 마지막 x 값(쌍이 없는 요소)을 무시한다.
 *
 * @param flat - `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 number 배열
 * @returns decode된 `{ x, y }` 배열
 */
export function decodeFlatCoords(flat: readonly number[]): { x: number; y: number }[] {
  const out: XYObjectWritable[] = [];
  decodeFlatCoordsInto(out, flat);
  return out;
}
