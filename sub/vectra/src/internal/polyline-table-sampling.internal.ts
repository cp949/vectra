import type { XYInput, XYWritable } from '../types';
import { pointDist } from './polyline-distance-primitive.internal';
import { readX, readY, writeXY } from './xy';
import { hypot2 } from './numeric';

/**
 * 누적 길이 표의 개수가 polyline vertex 개수와 같은지 확인한다.
 *
 * 개수만 확인한다. 표 내용(단조 증가, NaN)은 O(n)이라 확인하지 않는다.
 *
 * @param points 표가 대응해야 하는 polyline vertex 목록
 * @param cumulativeLengths 확인할 누적 길이 표
 * @param fnName RangeError 메시지에 쓸 공개 함수 이름
 */
export function assertCumulativeLengthsMatch(
  points: readonly XYInput[],
  cumulativeLengths: readonly number[],
  fnName: string
): void {
  if (cumulativeLengths.length !== points.length) {
    throw new RangeError(
      `${fnName}: cumulativeLengths.length(${cumulativeLengths.length})는 points.length(${points.length})와 같아야 한다`
    );
  }
}

/**
 * 누적 길이 표에서 `cumulativeLengths[i] >= target`인 가장 작은 i를 `[1, n - 1]`에서 찾는다.
 *
 * 그런 i가 없으면 마지막 segment index `n - 1`을 반환한다.
 * 호출자가 `cumulativeLengths.length >= 2`와 비감소 순서를 보장한다.
 *
 * @param cumulativeLengths 비감소 누적 길이 표
 * @param target 찾을 length offset
 */
export function findSegmentIndexByLength(cumulativeLengths: readonly number[], target: number): number {
  let lo = 1;
  let hi = cumulativeLengths.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cumulativeLengths[mid] >= target) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

/**
 * 누적 길이 표로 polyline의 length offset target에서 보간한 point를 out에 기록한다.
 *
 * `polylineSampleAtLengthInto`와 같은 값을 기록한다. segment는 순회 대신 이분 탐색으로 고른다.
 * 호출자가 points.length >= 2, 표 개수 일치, totalLen > 0, target ∈ [0, totalLen]를 보장한다.
 *
 * @param out 보간한 point를 기록할 writable output
 * @param points sample할 polyline vertex 목록
 * @param cumulativeLengths `points`의 누적 길이 표
 * @param target polyline 시작점부터의 length offset
 */
export function polylineSampleAtLengthByTableInto(
  out: XYWritable,
  points: readonly XYInput[],
  cumulativeLengths: readonly number[],
  target: number
): void {
  const i = findSegmentIndexByLength(cumulativeLengths, target);
  const ax = readX(points[i - 1]);
  const ay = readY(points[i - 1]);
  const bx = readX(points[i]);
  const by = readY(points[i]);
  // segment 길이는 표 차분이 아니라 좌표에서 다시 계산한다. 순회 구현과 같은 반올림을 유지한다.
  const segLen = pointDist(ax, ay, bx, by);
  if (segLen === 0) {
    writeXY(out, ax, ay);
    return;
  }
  const localT = Math.max(0, Math.min(1, (target - cumulativeLengths[i - 1]) / segLen));
  writeXY(out, ax + localT * (bx - ax), ay + localT * (by - ay));
}

/**
 * 누적 길이 표로 polyline의 arclength offset 위치가 속한 non-zero segment의 단위 tangent를 out에 기록한다.
 *
 * `polylineSegmentTangentAtLengthInto`와 같은 값과 반환값을 낸다. segment는 순회 대신 이분 탐색으로 고른다.
 * 호출자가 표 개수 일치와 비감소 순서를 보장한다. finite 좌표 validation은 수행하지 않는다.
 *
 * @param out 단위 tangent를 기록할 writable output
 * @param points tangent를 계산할 polyline vertex 목록
 * @param cumulativeLengths `points`의 누적 길이 표
 * @param length polyline 시작점부터의 arclength offset
 */
export function polylineSegmentTangentAtLengthByTableInto(
  out: XYWritable,
  points: readonly XYInput[],
  cumulativeLengths: readonly number[],
  length: number
): boolean {
  const n = points.length;
  if (n < 2) return false;

  const totalLen = cumulativeLengths[n - 1];
  if (totalLen === 0) return false;

  const target = Math.max(0, Math.min(length, totalLen));
  if (Number.isNaN(target)) {
    writeXY(out, Number.NaN, Number.NaN);
    return true;
  }

  // target이 0이면 누적 길이가 처음 양수가 되는 segment, 양수이면 (acc, acc + segLen]에 target이
  // 속하는 segment다. Number.MIN_VALUE는 0보다 큰 가장 작은 double이므로 `> 0` 판정과 같다.
  const i = findSegmentIndexByLength(cumulativeLengths, target > 0 ? target : Number.MIN_VALUE);
  const dx = readX(points[i]) - readX(points[i - 1]);
  const dy = readY(points[i]) - readY(points[i - 1]);
  const segLen = hypot2(dx, dy);
  writeXY(out, dx / segLen, dy / segLen);
  return true;
}
