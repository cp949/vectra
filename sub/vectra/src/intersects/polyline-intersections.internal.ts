import { readX, readY } from '../internal/xy';
import type { XYInput, XYObjectWritable } from '../types';

/**
 * polyline 교점 collection helper가 공유하는 internal 유틸.
 *
 * non-finite 입력 검사와 same-point dedupe를 `polyline × polyline`, `circle × polyline`이 같은
 * 기준으로 사용하도록 한 곳에 둔다. public API에 노출되지 않는다.
 */

/**
 * polyline vertex 좌표를 plain point 배열로 snapshot한다.
 *
 * collection `Into` helper는 output array를 clear하므로 `outPoints`가 polyline input array와 같은
 * reference여도 입력 좌표를 보존할 수 있도록 clear 전에 snapshot한다.
 *
 * @param points snapshot할 polyline vertex 목록
 */
export function snapshotPolylinePoints(points: readonly XYInput[]): XYObjectWritable[] {
  const snapshot: XYObjectWritable[] = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    snapshot[i] = { x: readX(points[i]), y: readY(points[i]) };
  }
  return snapshot;
}

/**
 * polyline vertex 중 non-finite 좌표가 하나라도 있으면 true를 반환한다.
 *
 * collection helper는 좌표가 하나라도 non-finite이면 부분 결과 대신 빈 collection을 반환하므로
 * segment 순회 전에 전체 입력을 한 번 검사한다.
 *
 * @param points 검사할 polyline vertex 목록
 */
export function hasNonFinitePolylinePoint(points: readonly XYInput[]): boolean {
  for (let i = 0; i < points.length; i++) {
    if (!Number.isFinite(readX(points[i])) || !Number.isFinite(readY(points[i]))) return true;
  }
  return false;
}

/**
 * 이미 수집한 point 중 (px, py)와 epsilon² 이내가 있으면 true를 반환한다.
 *
 * same-point dedupe는 먼저 수집된 point를 유지하므로 push 직전에 이 검사로 거른다.
 *
 * @param points 지금까지 수집한 point 목록
 * @param px 검사 대상 x 좌표
 * @param py 검사 대상 y 좌표
 * @param epsSq dedupe 임계값의 제곱(epsilon²)
 */
export function hasNearbyPoint(points: readonly XYObjectWritable[], px: number, py: number, epsSq: number): boolean {
  for (let i = 0; i < points.length; i++) {
    const ddx = points[i].x - px;
    const ddy = points[i].y - py;
    if (ddx * ddx + ddy * ddy <= epsSq) return true;
  }
  return false;
}
