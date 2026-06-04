import { polylineTotalLength } from '../internal/polyline';
import type { PathCommand, PathLocation, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { createCenterArcBuf, flattenDrawSegmentInto, forEachDrawSegment } from './path-segments.internal';

/**
 * `PathLocation`이 가리키는 path 위치까지의 cumulative arc-length를 반환한다.
 *
 * `locationAtLength`의 역연산이다. `t`는 segment 내 arc-length 비례 normalized parameter
 * `[0, 1]`로 해석한다 (정의는 `locationAtLength` 참고).
 *
 * 반환 분류:
 * - `segmentIndex`가 음수 / non-integer / non-finite(NaN, ±Infinity) → `undefined`
 * - `segmentIndex`가 drawing segment 수 이상 → `undefined`
 * - empty path / Move-only path → `undefined`
 * - `t`가 non-finite(NaN, ±Infinity) → `undefined`
 * - 그 외 → finite `t`를 `[0, 1]`로 clamp한 후 cumulative arc-length + segment partial length 반환
 *
 * 입력 `location` object는 mutate하지 않는다.
 *
 * @param commands 측정할 path command sequence
 * @param location segment-local 위치
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function lengthAtLocation(
  commands: readonly PathCommand[],
  location: PathLocation,
  options?: PathMeasurementOptions
): number | undefined {
  const { segmentIndex, t } = location;
  if (!Number.isInteger(segmentIndex) || segmentIndex < 0) return undefined;
  if (!Number.isFinite(t)) return undefined;

  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  const segBuf: XYObjectWritable[] = [];
  const centerArcBuf = createCenterArcBuf();

  const clampedT = Math.max(0, Math.min(1, t));

  let drawIndex = -1;
  let cumulativeLen = 0;
  let found = false;
  let result = 0;

  forEachDrawSegment(commands, (seg) => {
    if (found) return;

    drawIndex += 1;
    flattenDrawSegmentInto(segBuf, seg, flatOpts, centerArcBuf);
    const segLen = polylineTotalLength(segBuf);

    if (drawIndex === segmentIndex) {
      result = cumulativeLen + clampedT * segLen;
      found = true;
      return;
    }

    cumulativeLen += segLen;
  });

  // drawing segment 없거나 segmentIndex가 segment 수 이상이면 found=false
  if (!found) return undefined;
  return result;
}
