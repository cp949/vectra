import { pointDist, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike } from '../types';

/**
 * polyline의 vertex별 누적 arc-length lookup table을 outLengths에 기록한다.
 *
 * outLengths는 먼저 clear된 뒤 각 누적값이 push되며, 같은 outLengths를 반환한다.
 * 결과 개수는 `points.length`와 같고 첫 값은 항상 `0`이다. 이후 값은 이전 누적값에 해당 segment
 * 길이를 더한 값이다. empty polyline은 빈 배열, single-point polyline은 `[0]`을 반환한다.
 * repeated-point segment는 이전 누적값과 같은 값을 반복한다.
 *
 * 길이는 `Math.hypot` 기반으로 계산한다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은
 * 수행하지 않는다. NaN / Infinity 좌표는 JS 산술 결과를 그대로 전파한다.
 *
 * @param outLengths 누적 길이를 기록할 writable number 배열
 * @param polyline 누적 arc-length를 계산할 polyline
 */
export function cumulativeLengthsInto(outLengths: number[], polyline: PolylineLike): number[] {
  const points = readPolylinePoints(polyline);
  const n = points.length;

  outLengths.length = 0;
  if (n === 0) return outLengths;

  let acc = 0;
  outLengths.push(0);
  for (let i = 1; i < n; i++) {
    acc += pointDist(readX(points[i - 1]), readY(points[i - 1]), readX(points[i]), readY(points[i]));
    outLengths.push(acc);
  }

  return outLengths;
}
