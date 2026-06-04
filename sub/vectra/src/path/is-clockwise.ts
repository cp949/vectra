import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { signedArea } from './signed-area';

/**
 * commands path가 y-down 화면 좌표계 기준으로 clockwise인지 반환한다.
 *
 * `signedArea(commands, options) > 0` 판정이다. 좌표계 해석은 caller 책임이다.
 * y-up 수학 좌표계에서는 의미가 반전된다 ("CCW 우세").
 *
 * - zero-area path → `false`.
 * - empty path → `false`.
 * - Move-only path → `false`.
 * - NaN signed area → `false` (NaN > 0이 false이므로 자연 처리).
 *
 * @param commands 방향 판정 대상 path command sequence
 * @param options flatten 옵션 (flatness 기본 0.5, maxRecursion 기본 32)
 */
export function isClockwise(commands: readonly PathCommand[], options?: PathMeasurementOptions): boolean {
  return signedArea(commands, options) > 0;
}
