import type { PolylineLike } from '../types';
import { tangentAtLengthInto } from './tangent-at-length-into';

/**
 * tangentAtLengthInto의 allocating companion. 단위 tangent를 새 plain {x, y} object로 반환한다.
 *
 * tangent는 arclength offset 위치를 포함하는 non-zero segment의 진행 방향 단위 벡터다.
 * `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면
 * 앞쪽(먼저 끝나는) non-zero segment 방향을 사용하고, `length`가 0 이하이면 첫 non-zero
 * segment, `totalLength` 이상이면 마지막 non-zero segment 방향이다. zero-length segment는
 * tangent 후보에서 제외한다. `length` 또는 total length 계산이 NaN이면 NaN tangent를 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 tangent를 만들
 * 수 없으므로 undefined를 반환한다.
 *
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param polyline tangent를 계산할 polyline
 * @param length polyline 시작점부터의 arclength offset
 */
export function tangentAtLength(polyline: PolylineLike, length: number): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return tangentAtLengthInto(out, polyline, length) ? out : undefined;
}
