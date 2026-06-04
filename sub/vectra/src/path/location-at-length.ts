import { polylineTotalLength } from '../internal/polyline';
import type { PathCommand, PathLocation, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { createCenterArcBuf, flattenDrawSegmentInto, forEachDrawSegment } from './path-segments.internal';

/**
 * path 위 arc-length offset `distance` 위치의 `PathLocation`(`{ segmentIndex, t }`)을 반환한다.
 *
 * `t`는 해당 drawing segment의 arc-length 비례 normalized parameter `[0, 1]`이며,
 * parametric/angular parameter와는 일반적으로 비선형 관계다.
 *
 * 반환 분류:
 * - empty path / Move-only path → `undefined`
 * - non-finite distance (NaN, ±Infinity) → `undefined`
 * - `distance <= 0` → `{ segmentIndex: 0, t: 0 }` (첫 segment 시작 clamp)
 * - `distance >= totalLength` → `{ segmentIndex: lastIndex, t: 1 }` (마지막 segment 끝 clamp)
 *
 * `segmentIndex`의 의미는 `PathPropertiesResult.segmentIndex`와 동일하다 (MoveCommand 및
 * no-op CloseCommand는 카운트에서 제외).
 *
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function locationAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): PathLocation | undefined {
  if (!Number.isFinite(distance)) return undefined;

  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  const segBuf: XYObjectWritable[] = [];
  const centerArcBuf = createCenterArcBuf();

  let drawIndex = -1;
  let cumulativeLen = 0;
  let found = false;
  let resultIndex = 0;
  let resultT = 0;
  let lastIndex = -1;

  forEachDrawSegment(commands, (seg) => {
    if (found) return;

    drawIndex += 1;
    flattenDrawSegmentInto(segBuf, seg, flatOpts, centerArcBuf);
    const segLen = polylineTotalLength(segBuf);

    if (distance <= 0 || distance < cumulativeLen + segLen) {
      const localTarget = Math.max(0, distance - cumulativeLen);
      resultIndex = drawIndex;
      // zero-length segment는 t = 0으로 정의 (`pointAtLengthInto`의 시작점 기록과 일관)
      resultT = segLen === 0 ? 0 : Math.max(0, Math.min(1, localTarget / segLen));
      found = true;
      return;
    }

    cumulativeLen += segLen;
    lastIndex = drawIndex;
  });

  if (found) return { segmentIndex: resultIndex, t: resultT };
  // distance > totalLength → 마지막 segment 끝점 clamp
  if (lastIndex >= 0) return { segmentIndex: lastIndex, t: 1 };
  // drawing segment 없음 (empty / Move-only)
  return undefined;
}
