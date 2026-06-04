import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * 점 `(px, py)`에서 origin `(ox, oy)`, direction `(dx, dy)`, `lenSq = dx² + dy²`인 직선까지의
 * unsigned 수선의 발 거리를 반환한다. degenerate가 아닌 line만 caller가 전달한다.
 */
function distancePointToLine(
  px: number,
  py: number,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  lenSq: number
): number {
  const rx = px - ox;
  const ry = py - oy;
  const t = (rx * dx + ry * dy) / lenSq;
  const cx = t * dx - rx;
  const cy = t * dy - ry;
  return Math.hypot(cx, cy);
}

/**
 * 평행한 두 infinite-line 사이 최단 거리를 반환한다.
 *
 * 평행하지 않으면 `NaN`을 반환한다. 평행 판정은 exact cross product `0`을 사용하며 epsilon
 * 인자를 받지 않는다. 평행이면 `a.origin`에서 `b` line까지의 unsigned 거리를 반환하고, collinear이면
 * `0`이다.
 *
 * `isParallel`은 epsilon 기반(`|cross| <= epsilon`)으로 판정하므로 판정 기준이 다르다. `isParallel`이
 * `true`로 거른 near-parallel 입력도 cross product가 정확히 `0`이 아니면 이 함수는 `NaN`을 반환한다.
 * `isParallel`로 분기한 뒤 거리를 구하는 흐름은 이 차이를 caller가 처리한다.
 *
 * degenerate(zero direction) 입력은 point-like fallback으로 처리한다.
 *   - `a`만 degenerate: `a.origin`과 `b` line 사이 point-to-line 거리
 *   - `b`만 degenerate: `b.origin`과 `a` line 사이 point-to-line 거리
 *   - 양쪽 degenerate: 두 origin 사이 point-to-point 거리
 *
 * non-finite coordinate/direction은 caller 책임이며 산술 결과를 그대로 pass-through해 `NaN`이 될 수
 * 있다. `NaN` 반환은 non-parallel 신호이므로 `RangeError`와 구분한다.
 *
 * @param a 첫 infinite-line
 * @param b 둘째 infinite-line
 */
export function infiniteLineParallelDistance(a: InfiniteLineLike, b: InfiniteLineLike): number {
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

  // 양쪽 degenerate: origin 간 거리
  if (aLenSq === 0 && bLenSq === 0) {
    return Math.hypot(oax - obx, oay - oby);
  }
  // b만 degenerate: b.origin과 a line 사이 거리
  if (bLenSq === 0) {
    return distancePointToLine(obx, oby, oax, oay, dax, day, aLenSq);
  }
  // 여기서 b는 non-degenerate. a가 non-degenerate인데 평행이 아니면 NaN
  if (aLenSq !== 0 && dax * dby - day * dbx !== 0) {
    return Number.NaN;
  }
  // a degenerate이거나 두 line이 평행: a.origin과 b line 사이 거리
  return distancePointToLine(oax, oay, obx, oby, dbx, dby, bLenSq);
}
