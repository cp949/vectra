/**
 * flat number 배열의 각 좌표에 2D affine transform matrix를 적용하여 out 버퍼에 기록한다.
 *
 * zero-allocation buffer reuse를 위한 Into 함수다.
 */

import type { MatrixLike } from '../../types/index';
import { applyMatrixInto } from './flat-matrix.internal';

/**
 * `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 배열에 matrix를 적용하여 out에 기록한다.
 *
 * - index 0부터 순서대로 덮어쓴다. out.length는 재설정하지 않는다.
 * - out.length >= flat.length를 권장한다.
 * - `flat === out` aliasing을 허용한다. 포인트 i의 x, y를 읽은 뒤 동일 위치에 기록하므로
 *   read-before-write 순서가 보장된다.
 *
 * @param out - 결과를 기록할 number 배열 (index 0부터 덮어씀)
 * @param flat - `[x0, y0, x1, y1, ...]` 형태의 flat 좌표 number 배열
 * @param matrix - 적용할 2D affine transform matrix
 */
export function transformFlatCoordsInto(out: number[], flat: readonly number[], matrix: MatrixLike): void {
  const count = Math.floor(flat.length / 2);
  for (let i = 0; i < count; i++) {
    // 포인트 i를 먼저 읽고 기록 — aliasing 시에도 순서 보장
    const x = flat[i * 2];
    const y = flat[i * 2 + 1];
    applyMatrixInto(out, i * 2, x, y, matrix);
  }
}
