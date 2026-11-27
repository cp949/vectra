/**
 * flat adapter 전용 행렬 좌표 변환 kernel.
 */

import type { Matrix } from '../../types/flat-shapes.internal';

/**
 * 행렬 성분을 읽어 `[ax + cy + tx, bx + dy + ty]`를 out 배열의 outIdx, outIdx+1에 기록한다.
 *
 * 중간 [number, number] 튜플 할당을 제거하여 hot loop 내 GC 압력을 낮춘다.
 *
 * @param out - 결과를 기록할 배열 (number[] 또는 Float32Array)
 * @param outIdx - out에서 x를 기록할 시작 인덱스 (y는 outIdx+1)
 * @param x - 변환할 x 좌표
 * @param y - 변환할 y 좌표
 * @param m - 2D affine transform 행렬
 */
export function applyMatrixInto(out: number[] | Float32Array, outIdx: number, x: number, y: number, m: Matrix): void {
  const a = m.a;
  const b = m.b;
  const c = m.c;
  const d = m.d;
  const tx = m.tx;
  const ty = m.ty;
  out[outIdx] = a * x + c * y + tx;
  out[outIdx + 1] = b * x + d * y + ty;
}
