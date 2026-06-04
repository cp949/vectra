import type { PolylineLike } from '../types';
import { frameAtLengthInto } from './frame-at-length-into';

/** `frameAtLength`가 반환하는 plain nested frame. */
interface PolylineFrame {
  point: { x: number; y: number };
  tangent: { x: number; y: number };
  normal: { x: number; y: number };
}

/**
 * frameAtLengthInto의 allocating companion. arclength offset 위치의 point, tangent, left normal을
 * 새 plain nested object로 반환한다.
 *
 * point는 `pointAtLength`와 같은 clamped arc-length sample이다. tangent는 target 위치를 포함하는
 * non-zero segment의 단위 진행 방향, normal은 그 tangent `(tx, ty)`의 left normal `(-ty, tx)`다.
 * `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면 point는
 * boundary point, tangent/normal은 앞쪽(먼저 끝나는) non-zero segment 기준이다. `length` 또는
 * total length 계산이 NaN이면 point/tangent/normal 모든 component에 NaN을 기록한 frame을 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 frame을 만들 수
 * 없으므로 undefined를 반환한다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param polyline frame을 계산할 polyline
 * @param length polyline 시작점부터의 arclength offset
 */
export function frameAtLength(polyline: PolylineLike, length: number): PolylineFrame | undefined {
  const out: PolylineFrame = {
    point: { x: 0, y: 0 },
    tangent: { x: 0, y: 0 },
    normal: { x: 0, y: 0 },
  };
  return frameAtLengthInto(out, polyline, length) ? out : undefined;
}
