import { readInfiniteLineDirection } from '../internal/infinite-line';
import { crossWithin } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * 두 infinite-line가 평행하면 `true`를 반환한다.
 *
 * `epsilon`을 생략하면 `|cross(da, db)| <= 1e-9·|da|·|db|`(sin θ 기준)로 판정한다. direction 길이에 불변이다.
 * `epsilon`을 명시하면 `|cross(da, db)| <= epsilon` 절대 비교를 쓴다.
 * degenerate input(방향 벡터 = 0)은 cross = 0이므로 항상 `true`를 반환한다.
 *
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon cross product 절대값 임계값. 생략하면 `1e-9·|da|·|db|`
 */
export function isParallel(a: InfiniteLineLike, b: InfiniteLineLike, epsilon?: number): boolean {
  const dax = readX(readInfiniteLineDirection(a));
  const day = readY(readInfiniteLineDirection(a));
  const dbx = readX(readInfiniteLineDirection(b));
  const dby = readY(readInfiniteLineDirection(b));

  // cross product 절대값이 epsilon 이하이면 평행 (degenerate는 임계 0, cross=0으로 항상 true)
  const cross = dax * dby - day * dbx;
  return crossWithin(cross, epsilon, dax * dax + day * day, dbx * dbx + dby * dby);
}
