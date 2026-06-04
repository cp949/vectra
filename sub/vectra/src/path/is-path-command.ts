import type { PathCommand } from '../types/index';

/** PathCommand의 유효한 kind 값 집합 */
const VALID_KINDS = new Set<PathCommand['kind']>(['move', 'line', 'quadratic', 'cubic', 'arc', 'close']);

/**
 * value가 PathCommand discriminated union의 멤버인지 확인한다.
 * kind 필드가 유효한 literal 값인지만 검사하고, numeric range는 검사하지 않는다.
 *
 * @param value - 검사할 임의의 값
 */
export function isPathCommand(value: unknown): value is PathCommand {
  // null, undefined, 원시 타입, 배열 제외
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const kind = (value as Record<string, unknown>).kind;
  return typeof kind === 'string' && VALID_KINDS.has(kind as PathCommand['kind']);
}
