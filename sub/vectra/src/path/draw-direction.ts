import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { signedArea } from './signed-area';

/**
 * commands path의 winding 방향을 numeric tri-state로 반환한다.
 *
 * `signedArea` 부호 기반 wrapper이며 좌표계 해석은 caller 책임이다.
 * y-down 화면 좌표계 기준으로 `1`은 CW, `-1`은 CCW이며 y-up 수학 좌표계에서는 의미가 반전된다.
 *
 * - `1`: `signedArea > 0`.
 * - `-1`: `signedArea < 0`.
 * - `0`: zero-area, empty path, Move-only path, NaN signedArea.
 *
 * svg-path-commander `getDrawDirection`(boolean)과는 표면 호환이 아니며 의미만 호환된다.
 *
 * @param commands 방향을 판정할 path command sequence
 * @param options flatten 옵션 (flatness 기본 0.5, maxRecursion 기본 32)
 */
export function drawDirection(commands: readonly PathCommand[], options?: PathMeasurementOptions): 1 | -1 | 0 {
  const a = signedArea(commands, options);
  if (a > 0) return 1;
  if (a < 0) return -1;
  return 0;
}
