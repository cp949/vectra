import { pointDist, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * polyline의 arc-length 구간 `[startLength, endLength]`을 추출해 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다 (clear 전에 좌표를 snapshot한다).
 *
 * `startLength`와 `endLength`는 각각 `Math.max(0, Math.min(value, totalLength))`로 `[0, totalLength]`에
 * clamp된다. clamp 후 `start <= end`이면 forward 방향으로 추출하고, `start > end`이면 같은 구간을
 * source 진행 방향으로 추출한 뒤 결과를 reverse한다. 구간 양끝은 항상 interpolated endpoint로
 * 포함하고, 내부 source vertex는 arc-length가 `rangeStart < cumulativeLength < rangeEnd`일 때만
 * 포함한다. boundary와 같은 arc-length의 vertex는 endpoint로만 나타나며 중복하지 않는다.
 *
 * - empty polyline: out을 clear하고 빈 배열을 반환한다.
 * - single-point polyline: 첫 point 1개를 기록한다. start/end 값과 무관하다.
 * - total length가 0인 repeated-point polyline: 첫 point 1개를 기록한다. start/end 값과 무관하다.
 *
 * finite 검증은 하지 않는다. `NaN` / `Infinity` 좌표는 JS 산술로 그대로 전파한다. `startLength` /
 * `endLength`가 `NaN`이면 clamp 결과가 `NaN`이므로 endpoint interpolation이 `NaN` component를 전파하고,
 * total length가 `NaN`이면 (empty/single/zero-length fallback에 해당하지 않는 한) endpoint와 내부
 * 비교가 JS 규칙대로 `NaN`을 전파한다. 별도 `RangeError`를 던지지 않는다.
 *
 * @param outPoints 추출한 point object를 기록할 writable output array
 * @param polyline 구간을 추출할 polyline
 * @param startLength 구간 시작 arc-length offset
 * @param endLength 구간 끝 arc-length offset
 */
export function sliceByLengthInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike,
  startLength: number,
  endLength: number
): XYObjectWritable[] {
  const pts = readPolylinePoints(polyline);
  const n = pts.length;
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }

  outPoints.length = 0;

  if (n === 0) {
    return outPoints;
  }
  if (n === 1) {
    outPoints.push({ x: xs[0], y: ys[0] });
    return outPoints;
  }

  // 각 vertex까지의 누적 arc-length와 total length를 snapshot 좌표로 계산한다.
  const cum: number[] = new Array(n);
  cum[0] = 0;
  for (let i = 1; i < n; i++) {
    cum[i] = cum[i - 1] + pointDist(xs[i - 1], ys[i - 1], xs[i], ys[i]);
  }
  const totalLen = cum[n - 1];

  // repeated-point polyline은 추출 기준 segment가 없으므로 첫 point로 환원한다.
  if (totalLen === 0) {
    outPoints.push({ x: xs[0], y: ys[0] });
    return outPoints;
  }

  const clampedStart = Math.max(0, Math.min(startLength, totalLen));
  const clampedEnd = Math.max(0, Math.min(endLength, totalLen));
  const reversed = clampedStart > clampedEnd;
  const lo = reversed ? clampedEnd : clampedStart;
  const hi = reversed ? clampedStart : clampedEnd;

  // forward 구간 [lo, hi]을 추출한다. boundary는 endpoint로만 포함한다.
  outPoints.push(sampleAt(xs, ys, cum, lo));
  for (let i = 1; i < n - 1; i++) {
    if (lo < cum[i] && cum[i] < hi) {
      outPoints.push({ x: xs[i], y: ys[i] });
    }
  }
  outPoints.push(sampleAt(xs, ys, cum, hi));

  if (reversed) {
    outPoints.reverse();
  }

  return outPoints;
}

/**
 * snapshot 좌표 위에서 arc-length offset target에 해당하는 point를 새 object로 반환한다.
 *
 * 호출자가 n >= 2, total length > 0, target ∈ [0, totalLength] (또는 NaN)를 보장한다.
 * 마지막 segment까지 누적 길이가 target에 도달하지 못해도 마지막 segment 위에서 보간한다.
 */
function sampleAt(xs: number[], ys: number[], cum: number[], target: number): XYObjectWritable {
  const n = xs.length;
  for (let i = 1; i < n; i++) {
    const segLen = cum[i] - cum[i - 1];
    // 마지막 segment이거나 target에 도달하면 이 segment 위에서 보간한다.
    if (i === n - 1 || cum[i] >= target) {
      const ax = xs[i - 1];
      const ay = ys[i - 1];
      if (segLen === 0) {
        return { x: ax, y: ay };
      }
      const localT = Math.max(0, Math.min(1, (target - cum[i - 1]) / segLen));
      return { x: ax + localT * (xs[i] - ax), y: ay + localT * (ys[i] - ay) };
    }
  }
  // 도달하지 않는다: 위 루프가 i === n - 1에서 항상 반환한다.
  return { x: xs[0], y: ys[0] };
}
