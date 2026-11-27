import type { Matrix } from '../types/flat-shapes.internal';

/**
 * 두 matrix의 모든 component가 정확히 같으면 true를 반환한다.
 *
 * 비교는 === 기준이며 epsilon을 적용하지 않는다.
 *
 * @param a 비교할 첫 번째 matrix
 * @param b 비교할 두 번째 matrix
 */
export function equals(a: Matrix, b: Matrix): boolean {
  return a.a === b.a && a.b === b.b && a.c === b.c && a.d === b.d && a.tx === b.tx && a.ty === b.ty;
}
