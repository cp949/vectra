import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineConcatOptions, PolylineLike, XYObjectWritable } from '../types';

/**
 * 여러 polyline을 순서대로 이어 붙인 point list를 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * 어떤 source `polyline.points`와 outPoints가 같은 배열이어도 안전하다 (clear 전에 모든 source
 * 좌표를 snapshot한다).
 *
 * 기본 dedupe: `weldTolerance`가 `0`이면 인접 source polyline의 접합 endpoint를 exact equality로
 * 비교한다. `weldTolerance`가 양수이면 endpoint 사이 `Math.hypot` 거리가 `weldTolerance` 이하일
 * 때 현재 source의 첫 point를 제거한다. dedupe는 인접 source polyline 사이에만 적용한다. 같은
 * source 내부 repeated point는 유지한다.
 *
 * - empty source collection: out을 clear하고 빈 배열을 반환한다.
 * - empty source polyline: point를 추가하지 않고 접합 endpoint도 바꾸지 않는다.
 * - single-point source polyline: point 1개 source로 취급하며 직전 output endpoint와 dedupe될 수 있다.
 *
 * finite 검증은 하지 않는다. `NaN` / `Infinity` 좌표는 output에 그대로 전파한다. tolerance dedupe에서
 * 계산된 거리가 `NaN`이면(`NaN` 좌표, `Infinity - Infinity`) dedupe하지 않는다. 같은 이유로
 * `Infinity` 좌표는 finite endpoint와 dedupe되지 않는다.
 *
 * @param outPoints 이어 붙인 point object를 기록할 writable output array
 * @param polylines 순서대로 이어 붙일 polyline 목록
 * @param options `weldTolerance`(finite `>= 0`, 기본 `0`) 접합 endpoint dedupe 옵션
 * @throws {RangeError} `weldTolerance`가 finite `>= 0`이 아니면(음수, `NaN`, `±Infinity`) 던지며 outPoints를 수정하지 않는다.
 */
export function concatInto(
  outPoints: XYObjectWritable[],
  polylines: readonly PolylineLike[],
  options?: PolylineConcatOptions
): XYObjectWritable[] {
  const weldTolerance = options?.weldTolerance ?? 0;
  if (!Number.isFinite(weldTolerance) || weldTolerance < 0) {
    throw new RangeError('weldTolerance must be a finite number >= 0');
  }

  // input/output array aliasing에 대비해 clear 전에 모든 source 좌표를 snapshot한다.
  const sources: { xs: number[]; ys: number[] }[] = [];
  for (const polyline of polylines) {
    const pts = readPolylinePoints(polyline);
    const n = pts.length;
    const xs: number[] = new Array(n);
    const ys: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      xs[i] = readX(pts[i]);
      ys[i] = readY(pts[i]);
    }
    sources.push({ xs, ys });
  }

  outPoints.length = 0;

  for (const { xs, ys } of sources) {
    const n = xs.length;
    for (let i = 0; i < n; i++) {
      const x = xs[i];
      const y = ys[i];
      // 각 source의 첫 point만 직전 output endpoint와 접합 dedupe 후보다.
      // zero tolerance는 exact equality 계약이다. 양수 tolerance만 거리 기반으로 비교한다.
      if (i === 0 && outPoints.length > 0) {
        const last = outPoints[outPoints.length - 1];
        const shouldDedupe =
          weldTolerance === 0 ? last.x === x && last.y === y : Math.hypot(last.x - x, last.y - y) <= weldTolerance;
        if (shouldDedupe) {
          continue;
        }
      }
      outPoints.push({ x, y });
    }
  }

  return outPoints;
}
