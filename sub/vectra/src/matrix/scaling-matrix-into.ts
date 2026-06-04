import type { MatrixWritable } from '../types';

/**
 * identity 기반 scaling matrix를 out에 기록하고 out을 반환한다.
 *
 * 기존 matrix를 합성하지 않고, 주어진 sx/sy로부터 scaling-only component matrix를 새로 생성한다.
 *
 * @param out scaling component를 기록할 writable output
 * @param sx x축 scale
 * @param sy y축 scale
 */
export function scalingMatrixInto<Out extends MatrixWritable>(out: Out, sx: number, sy: number): Out {
  out.a = sx;
  out.b = 0;
  out.c = 0;
  out.d = sy;
  out.tx = 0;
  out.ty = 0;
  return out;
}
