import type { Matrix } from '../types/flat-shapes.internal';

/**
 * 두 matrix의 모든 component 차이가 epsilon 이하이면 true를 반환한다.
 *
 * epsilon은 각 component의 절대 차이에 적용된다.
 *
 * @param a 비교할 첫 번째 matrix
 * @param b 비교할 두 번째 matrix
 * @param epsilon 각 component에 적용할 절대 허용 오차
 */
export function nearEquals(a: Matrix, b: Matrix, epsilon = 1e-9): boolean {
  return (
    Math.abs(a.a - b.a) <= epsilon &&
    Math.abs(a.b - b.b) <= epsilon &&
    Math.abs(a.c - b.c) <= epsilon &&
    Math.abs(a.d - b.d) <= epsilon &&
    Math.abs(a.tx - b.tx) <= epsilon &&
    Math.abs(a.ty - b.ty) <= epsilon
  );
}
