import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, PolylineSubdivideOptions, XYObjectWritable } from '../types';

/**
 * polyline의 각 segment를 같은 개수로 분할해 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다 (clear 전에 좌표를 snapshot한다).
 * arc-length 균등 resampling이 아니다. segment별 parameter 등분으로만 분할한다. arc-length 기준
 * 균등 sampling은 `sampleUniformInto` / `sampleFixedCountInto`가 소유한다.
 *
 * 각 source segment마다 시작점과 내부 분할점을 push하고, 마지막에 마지막 source point를 push한다.
 * 결과 point 수는 `(points.length - 1) * segmentsPerSegment + 1`이다.
 *
 * - empty polyline: out을 clear하고 빈 배열을 반환한다.
 * - single-point polyline: 해당 point 1개를 복제한다.
 * - `segmentsPerSegment === 1`: 원본 point 복제와 같다.
 * - repeated / zero-length segment: 같은 보간 정책으로 중복 point를 생성한다.
 *
 * finite 검증은 하지 않는다. source point 좌표는 그대로 전파한다. 내부 분할점은 segment 보간을
 * 거치므로 Infinity 좌표 조합에 따라 NaN/Infinity가 생성될 수 있다.
 *
 * @param outPoints 분할된 point object를 기록할 writable output array
 * @param polyline 분할할 polyline
 * @param options `segmentsPerSegment`(positive integer, 기본 `2`) 분할 옵션
 * @throws {RangeError} `segmentsPerSegment`가 positive integer가 아니면 던진다.
 */
export function subdivideInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike,
  options?: PolylineSubdivideOptions
): XYObjectWritable[] {
  const segmentsPerSegment = options?.segmentsPerSegment ?? 2;
  if (!Number.isInteger(segmentsPerSegment) || segmentsPerSegment < 1) {
    throw new RangeError('segmentsPerSegment must be a positive integer');
  }

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

  // 각 segment의 시작점 + 내부 분할점을 push한다. segment 끝점은 다음 segment 시작점으로 다뤄진다.
  for (let i = 0; i < n - 1; i++) {
    const ax = xs[i];
    const ay = ys[i];
    const dx = xs[i + 1] - ax;
    const dy = ys[i + 1] - ay;
    for (let k = 0; k < segmentsPerSegment; k++) {
      if (k === 0) {
        outPoints.push({ x: ax, y: ay });
        continue;
      }
      const t = k / segmentsPerSegment;
      outPoints.push({ x: ax + t * dx, y: ay + t * dy });
    }
  }

  // 마지막 source point를 마지막에 push한다 (single-point polyline은 이 point만 기록한다).
  outPoints.push({ x: xs[n - 1], y: ys[n - 1] });

  return outPoints;
}
