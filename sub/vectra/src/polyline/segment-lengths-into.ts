import { pointDist, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike } from '../types';

/**
 * polyline의 인접 point 쌍별 segment 길이를 outLengths에 기록한다.
 *
 * outLengths는 먼저 clear된 뒤 각 segment 길이가 push되며, 같은 outLengths를 반환한다.
 * 결과 개수는 segment 수(`Math.max(0, points.length - 1)`)와 같다. empty / single-point
 * polyline은 outLengths를 clear하고 빈 배열을 반환한다. repeated-point segment는 `0`을 기록한다.
 *
 * 길이는 `Math.hypot` 기반으로 계산한다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은
 * 수행하지 않는다. NaN / Infinity 좌표는 JS 산술 결과를 그대로 전파한다.
 *
 * @param outLengths segment 길이를 기록할 writable number 배열
 * @param polyline segment 길이를 계산할 polyline
 */
export function segmentLengthsInto(outLengths: number[], polyline: PolylineLike): number[] {
  const points = readPolylinePoints(polyline);
  const n = points.length;

  outLengths.length = 0;
  for (let i = 1; i < n; i++) {
    outLengths.push(pointDist(readX(points[i - 1]), readY(points[i - 1]), readX(points[i]), readY(points[i])));
  }

  return outLengths;
}
