import { readInfiniteLineDirection } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * 두 infinite-line가 평행하면 `true`를 반환한다.
 *
 * `|cross(da, db)| <= epsilon` 기준으로 판정한다.
 * degenerate input(방향 벡터 = 0)은 cross = 0이므로 항상 `true`를 반환한다.
 *
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon cross product 절대값 임계값 (기본값 `1e-9`)
 */
export function isParallel(a: InfiniteLineLike, b: InfiniteLineLike, epsilon: number = DEFAULT_EPSILON): boolean {
  const dax = readX(readInfiniteLineDirection(a));
  const day = readY(readInfiniteLineDirection(a));
  const dbx = readX(readInfiniteLineDirection(b));
  const dby = readY(readInfiniteLineDirection(b));

  // cross product 절대값이 epsilon 이하이면 평행 (degenerate는 cross=0으로 항상 true)
  const cross = dax * dby - day * dbx;
  return Math.abs(cross) <= epsilon;
}
