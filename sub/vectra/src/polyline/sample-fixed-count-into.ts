import { polylineSampleAtLengthInto, polylineTotalLength, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * polyline에서 arc-length 기준 균등하게 count개 point를 샘플링해 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 * empty polyline(`hasSegments === false`)은 outPoints를 비우고 반환한다.
 *
 * `count === 1`이면 시작점 1개만 기록한다. `count >= 2`이면 시작점과 끝점을 포함해
 * 균등 간격으로 count개를 기록한다.
 * repeated-point polyline(totalLen === 0)은 시작점을 count개 push한다.
 *
 * `count <= 0` 또는 정수가 아니면 RangeError를 던진다.
 *
 * @param outPoints 샘플링된 point object를 기록할 writable output array
 * @param polyline 샘플링할 polyline
 * @param count 추출할 point 수 (positive integer)
 */
export function sampleFixedCountInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike,
  count: number
): XYObjectWritable[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError('count must be a positive integer');
  }

  const pts = readPolylinePoints(polyline);
  const n = pts.length;

  // empty 또는 single-point polyline은 segment 없으므로 빈 배열 반환
  if (n < 2) {
    outPoints.length = 0;
    return outPoints;
  }

  const snapshot: XYObjectWritable[] = new Array(n);
  for (let i = 0; i < n; i++) {
    snapshot[i] = { x: readX(pts[i]), y: readY(pts[i]) };
  }

  const totalLen = polylineTotalLength(snapshot);

  // 시작점 좌표
  const x0 = snapshot[0].x;
  const y0 = snapshot[0].y;

  outPoints.length = 0;

  if (count === 1) {
    outPoints.push({ x: x0, y: y0 });
    return outPoints;
  }

  // repeated-point polyline — total length 0이면 count개 모두 시작점
  if (totalLen === 0) {
    for (let i = 0; i < count; i++) {
      outPoints.push({ x: x0, y: y0 });
    }
    return outPoints;
  }

  // count >= 2: 시작점과 끝점 포함, 균등 간격
  const tmp = { x: 0, y: 0 };
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * totalLen;
    polylineSampleAtLengthInto(tmp, snapshot, target);
    outPoints.push({ x: tmp.x, y: tmp.y });
  }

  return outPoints;
}
