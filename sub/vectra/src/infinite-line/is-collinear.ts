import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * 두 infinite-line가 같은 직선 위에 있으면 `true`를 반환한다.
 *
 * 먼저 평행 여부(`|cross| <= epsilon`)를 확인하고, 평행이면 origin의 collinear 여부를 검사한다.
 * degenerate input(방향 벡터 = 0) 분기는 다음 규칙을 따른다.
 *   - 양쪽 모두 degenerate: origin 간 거리 비교
 *   - a만 degenerate: b 직선이 a.origin을 포함하는지 inline 검사
 *   - 그 외(b degenerate 포함): a 직선이 b.origin을 포함하는지 inline 검사
 *
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon 허용 거리 및 cross product 절대값 임계값 (기본값 `1e-9`)
 */
export function isCollinear(a: InfiniteLineLike, b: InfiniteLineLike, epsilon: number = DEFAULT_EPSILON): boolean {
  const oax = readX(readInfiniteLineOrigin(a));
  const oay = readY(readInfiniteLineOrigin(a));
  const dax = readX(readInfiniteLineDirection(a));
  const day = readY(readInfiniteLineDirection(a));
  const obx = readX(readInfiniteLineOrigin(b));
  const oby = readY(readInfiniteLineOrigin(b));
  const dbx = readX(readInfiniteLineDirection(b));
  const dby = readY(readInfiniteLineDirection(b));

  const cross = dax * dby - day * dbx;
  const aLenSq = dax * dax + day * day;
  const bLenSq = dbx * dbx + dby * dby;

  // 평행하지 않으면 collinear 불가
  if (Math.abs(cross) > epsilon) return false;

  if (aLenSq === 0 && bLenSq === 0) {
    // 양쪽 degenerate: origin 일치 여부
    const dx = oax - obx;
    const dy = oay - oby;
    return dx * dx + dy * dy <= epsilon * epsilon;
  }

  if (aLenSq === 0) {
    // a degenerate: b 직선이 a.origin을 포함하는지 검사 (containsPoint inline)
    const px = oax - obx;
    const py = oay - oby;
    const t = (px * dbx + py * dby) / bLenSq;
    const cx = t * dbx - px;
    const cy = t * dby - py;
    return cx * cx + cy * cy <= epsilon * epsilon;
  }

  // b degenerate 포함, 또는 양쪽 non-degenerate:
  // a 직선이 b.origin을 포함하는지 검사 (containsPoint inline)
  const px = obx - oax;
  const py = oby - oay;
  const t = (px * dax + py * day) / aLenSq;
  const cx = t * dax - px;
  const cy = t * day - py;
  return cx * cx + cy * cy <= epsilon * epsilon;
}
