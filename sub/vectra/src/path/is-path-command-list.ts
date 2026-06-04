import type { PathCommand } from '../types/index';
import { isPathCommand } from './is-path-command';

/**
 * value가 readonly PathCommand[] 형태인지 확인한다.
 * 배열의 각 요소에 isPathCommand를 적용한다.
 *
 * @param value - 검사할 임의의 값
 */
export function isPathCommandList(value: unknown): value is readonly PathCommand[] {
  if (!Array.isArray(value)) {
    return false;
  }
  // 각 요소가 유효한 PathCommand인지 확인
  for (const item of value) {
    if (!isPathCommand(item)) {
      return false;
    }
  }
  return true;
}
