import type { MatrixWritable } from '../types';

/**
 * column-major 9-element array에서 matrix component를 읽어 out에 기록하고 out을 반환한다.
 *
 * column-major 순서: `[a, b, 0, c, d, 0, tx, ty, 1]`.
 * index 매핑: `out.a=arr[0], out.b=arr[1], out.c=arr[3], out.d=arr[4], out.tx=arr[6], out.ty=arr[7]`.
 * index 2, 5, 8은 읽지 않는다.
 * 2D affine 마지막 행 `[0, 0, 1]`을 가정한다. 이를 보장하지 않는 array를 넘기면 결과가 정의되지 않는다.
 * NaN/Infinity 입력은 검증 없이 pass through한다. caller 책임이다.
 *
 * @param out matrix component를 기록할 writable output
 * @param array 읽을 column-major 9-element readonly tuple
 */
export function fromArray9Into<Out extends MatrixWritable>(
  out: Out,
  array: readonly [number, number, number, number, number, number, number, number, number]
): Out {
  out.a = array[0];
  out.b = array[1];
  out.c = array[3];
  out.d = array[4];
  out.tx = array[6];
  out.ty = array[7];
  return out;
}
