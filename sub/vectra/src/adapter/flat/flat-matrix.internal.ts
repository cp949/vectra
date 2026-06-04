/**
 * flat adapter 전용 MatrixLike 분해 및 좌표 변환 kernel.
 *
 * public matrix leaf(`@cp949/vectra/matrix/...`)를 import하지 않고 internal reader만 사용한다.
 * MatrixObjectLike와 MatrixTuple을 모두 처리한다.
 */

import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../../internal/matrix';
import type { MatrixLike } from '../../types/index';

/**
 * MatrixLike를 분해하여 `[ax + cy + tx, bx + dy + ty]`를 out 배열의 outIdx, outIdx+1에 기록한다.
 *
 * 중간 [number, number] 튜플 할당을 제거하여 hot loop 내 GC 압력을 낮춘다.
 *
 * @param out - 결과를 기록할 배열 (number[] 또는 Float32Array)
 * @param outIdx - out에서 x를 기록할 시작 인덱스 (y는 outIdx+1)
 * @param x - 변환할 x 좌표
 * @param y - 변환할 y 좌표
 * @param m - 2D affine transform matrix (object 또는 tuple)
 */
export function applyMatrixInto(
  out: number[] | Float32Array,
  outIdx: number,
  x: number,
  y: number,
  m: MatrixLike
): void {
  const a = readMatrixA(m);
  const b = readMatrixB(m);
  const c = readMatrixC(m);
  const d = readMatrixD(m);
  const tx = readMatrixTx(m);
  const ty = readMatrixTy(m);
  out[outIdx] = a * x + c * y + tx;
  out[outIdx + 1] = b * x + d * y + ty;
}
