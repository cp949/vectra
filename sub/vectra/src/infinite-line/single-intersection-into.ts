import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY, writeXY } from '../internal/xy';
import type { InfiniteLineLike, XYObjectWritable } from '../types';

/**
 * 두 infinite-line가 단일 교점을 가지면 `out`에 기록하고 `true`를 반환한다.
 *
 * parallel 또는 collinear 분기(`|cross| <= epsilon`)에서는 `false`를 반환하고 `out`을 수정하지 않는다.
 * degenerate input(방향 벡터 = 0) 분기는 origin 기반 containment로 판정한다.
 *
 * @param out 교점 좌표를 기록할 writable object
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon cross product 절대값 및 거리 임계값 (기본값 `1e-9`)
 */
export function singleIntersectionInto(
  out: XYObjectWritable,
  a: InfiniteLineLike,
  b: InfiniteLineLike,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  const oax = readX(readInfiniteLineOrigin(a));
  const oay = readY(readInfiniteLineOrigin(a));
  const dax = readX(readInfiniteLineDirection(a));
  const day = readY(readInfiniteLineDirection(a));
  const obx = readX(readInfiniteLineOrigin(b));
  const oby = readY(readInfiniteLineOrigin(b));
  const dbx = readX(readInfiniteLineDirection(b));
  const dby = readY(readInfiniteLineDirection(b));

  const aLenSq = dax * dax + day * day;
  const bLenSq = dbx * dbx + dby * dby;

  // degenerate 분기: 하나 이상의 방향 벡터가 0인 경우
  if (aLenSq === 0 || bLenSq === 0) {
    if (aLenSq === 0 && bLenSq === 0) {
      // 양쪽 degenerate: origin 일치이면 a.origin 기록
      const dx = oax - obx;
      const dy = oay - oby;
      if (dx * dx + dy * dy <= epsilon * epsilon) {
        writeXY(out, oax, oay);
        return true;
      }
      return false;
    }
    if (aLenSq === 0) {
      // a degenerate: b 직선이 a.origin을 포함하는지 검사
      const px = oax - obx;
      const py = oay - oby;
      const t = (px * dbx + py * dby) / bLenSq;
      const cx = t * dbx - px;
      const cy = t * dby - py;
      if (cx * cx + cy * cy <= epsilon * epsilon) {
        writeXY(out, oax, oay);
        return true;
      }
      return false;
    }
    // b degenerate: a 직선이 b.origin을 포함하는지 검사
    const px = obx - oax;
    const py = oby - oay;
    const t = (px * dax + py * day) / aLenSq;
    const cx = t * dax - px;
    const cy = t * day - py;
    if (cx * cx + cy * cy <= epsilon * epsilon) {
      writeXY(out, obx, oby);
      return true;
    }
    return false;
  }

  // 양쪽 non-degenerate
  const cross = dax * dby - day * dbx;
  // parallel 또는 collinear: 단일 교점 없음
  if (Math.abs(cross) <= epsilon) return false;

  // 일반 교차: Cramer's rule
  const qx = obx - oax;
  const qy = oby - oay;
  const t = (qx * dby - qy * dbx) / cross;
  writeXY(out, oax + t * dax, oay + t * day);
  return true;
}
