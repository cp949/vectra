import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { signedArea } from './signed-area';

/**
 * commands path의 부호 없는 면적(절댓값)을 반환한다.
 *
 * `Math.abs(signedArea(commands, options))` 결과와 동등하며, 별도 적분을 수행하지 않는다.
 *
 * - empty path → 0.
 * - Move-only path → 0.
 * - 각 subpath는 독립적으로 적용되며 close 없는 subpath는 자동 close된다.
 *   multi-subpath는 signed area의 산술 합의 절댓값이므로 부호가 다른 subpath는 상쇄될 수 있다.
 * - NaN / Infinity 좌표는 `signedArea`를 통해 그대로 전파된다.
 *
 * @param commands area를 계산할 path command sequence
 * @param options flatten 옵션 (flatness 기본 0.5, maxRecursion 기본 32)
 */
export function area(commands: readonly PathCommand[], options?: PathMeasurementOptions): number {
  return Math.abs(signedArea(commands, options));
}
