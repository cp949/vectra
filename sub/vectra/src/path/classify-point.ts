import { readX, readY } from '../internal/xy';
import type { ClassifyPointOptions, PathCommand, XYInput } from '../types/index';
import { containsPoint } from './contains-point';
import { distanceToPoint } from './distance-to-point';

/**
 * commands path와 point의 관계를 `'inside' | 'outside' | 'boundary'`로 분류한다.
 *
 * 판정 순서:
 *
 * 1. point가 non-finite (`x` 또는 `y`가 NaN/Infinity) → `'outside'` (fail-safe).
 * 2. empty path → `'outside'`.
 * 3. `distanceToPoint(commands, point, options) < boundaryTolerance` → `'boundary'`.
 * 4. `containsPoint(commands, point, options)` 결과를 even-odd로 해석:
 *    `true` → `'inside'`, `false` → `'outside'`.
 *
 * `containsPoint`와 boundary 처리가 다르다. `containsPoint`는 boundary touch를 `true`로
 * 포함하지만, `classifyPoint`는 `'boundary'`로 분리한다. boundary 판정은 `boundaryTolerance`
 * 우선 적용 후 fill rule을 보조로 사용한다.
 *
 * tolerance와 정확히 같은 거리는 boundary로 분류하지 않는다 (strict `<`).
 *
 * @remarks curve segment는 flatness 오차 범위 내에서 polyline으로 근사된 뒤 거리·포함 판정이 수행된다.
 *
 * @param commands 판정 대상 path command sequence
 * @param point 분류 기준 좌표
 * @param options flatten 옵션과 `boundaryTolerance` (기본 `1e-9`)
 */
export function classifyPoint(
  commands: readonly PathCommand[],
  point: XYInput,
  options?: ClassifyPointOptions
): 'inside' | 'outside' | 'boundary' {
  const px = readX(point);
  const py = readY(point);

  // fail-safe: non-finite point는 분류 불가 → outside 고정.
  if (!Number.isFinite(px) || !Number.isFinite(py)) {
    return 'outside';
  }

  if (commands.length === 0) {
    return 'outside';
  }

  const tolerance = options?.boundaryTolerance ?? 1e-9;

  if (distanceToPoint(commands, point, options) < tolerance) {
    return 'boundary';
  }

  return containsPoint(commands, point, options) ? 'inside' : 'outside';
}
