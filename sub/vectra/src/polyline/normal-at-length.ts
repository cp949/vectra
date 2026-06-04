import type { PolylineLike } from '../types';
import { normalAtLengthInto } from './normal-at-length-into';

/**
 * normalAtLengthInto의 allocating companion. 단위 left normal을 새 plain {x, y} object로 반환한다.
 *
 * normal은 arclength offset 위치를 포함하는 non-zero segment 단위 tangent `(tx, ty)`의 left
 * normal `(-ty, tx)`다. segment 선택은 `tangentAtLength`와 같다. `length`는 `[0, totalLength]`로
 * clamp된다. target이 segment boundary에 정확히 걸리면 앞쪽(먼저 끝나는) non-zero segment
 * 기준이고, `length`가 0 이하이면 첫 non-zero segment, `totalLength` 이상이면 마지막 non-zero
 * segment 기준이다. zero-length segment는 후보에서 제외한다. `length` 또는 total length 계산이
 * NaN이면 NaN normal을 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 normal을 만들 수
 * 없으므로 undefined를 반환한다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param polyline normal을 계산할 polyline
 * @param length polyline 시작점부터의 arclength offset
 */
export function normalAtLength(polyline: PolylineLike, length: number): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return normalAtLengthInto(out, polyline, length) ? out : undefined;
}
