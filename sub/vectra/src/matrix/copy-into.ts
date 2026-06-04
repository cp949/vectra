import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike, MatrixWritable } from '../types';

/**
 * matrix의 6개 component를 out에 복사하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out matrix component를 기록할 writable output
 * @param matrix 복사할 matrix 또는 a component
 */
export function copyInto<Out extends MatrixWritable>(out: Out, matrix: MatrixLike): Out;
export function copyInto<Out extends MatrixWritable>(
  out: Out,
  a: number,
  b: number,
  c: number,
  d: number,
  tx: number,
  ty: number
): Out;
export function copyInto<Out extends MatrixWritable>(
  out: Out,
  matrixOrA: MatrixLike | number,
  b?: number,
  c?: number,
  d?: number,
  tx?: number,
  ty?: number
): Out {
  // aliasing 안전성: 입력 component를 먼저 읽은 후 기록한다
  const a = typeof matrixOrA === 'number' ? matrixOrA : readMatrixA(matrixOrA);
  const nextB = typeof matrixOrA === 'number' ? b : readMatrixB(matrixOrA);
  const nextC = typeof matrixOrA === 'number' ? c : readMatrixC(matrixOrA);
  const nextD = typeof matrixOrA === 'number' ? d : readMatrixD(matrixOrA);
  const nextTx = typeof matrixOrA === 'number' ? tx : readMatrixTx(matrixOrA);
  const nextTy = typeof matrixOrA === 'number' ? ty : readMatrixTy(matrixOrA);
  out.a = a;
  out.b = nextB as number;
  out.c = nextC as number;
  out.d = nextD as number;
  out.tx = nextTx as number;
  out.ty = nextTy as number;
  return out;
}
