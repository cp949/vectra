import { readCircleRadius } from '../internal/circle';
import type { CircleLike } from '../types';

/**
 * circle에서 중심각 centralAngle에 대응하는 활꼴 높이(sagitta)를 반환한다.
 *
 * 공식: r * (1 - cos(|θ| / 2)). centralAngle은 radian 단위이며 부호를 무시한다
 * (Math.abs 적용). empty circle (radius <= 0)이면 0을 반환한다.
 *
 * NaN/Infinity는 pass-through한다. centralAngle = ±Infinity이면 cos(Infinity) = NaN이
 * 되어 NaN을 반환한다. radius = NaN이면 NaN. radius = -Infinity이면 empty 분기
 * (`r <= 0`)로 0을 반환한다. radius = +Infinity이면 결과가 angle에 따라 갈린다:
 * `1 - cos(|θ|/2)`가 정확히 `0`인 angle(`0`, `4π`, `8π`, …)에서는 `Infinity * 0 = NaN`,
 * 그 외 finite angle에서는 Infinity. chordLength / sectorArea / segmentArea와 동일한
 * `r <= 0` empty 정책을 따른다.
 *
 * @param circle 활꼴 높이를 계산할 circle
 * @param centralAngle 활꼴에 대응하는 중심각 (radian, 부호 무시)
 */
export function sagitta(circle: CircleLike, centralAngle: number): number {
  const r = readCircleRadius(circle);
  if (r <= 0) return 0;
  return r * (1 - Math.cos(Math.abs(centralAngle) / 2));
}
