import type { PathCommand } from '../types/index';
import { splitSubpathsInto } from './split-subpaths-into';

/**
 * MoveCommand 기준으로 subpath를 분리한 새 PathCommand[][] 배열을 반환한다.
 *
 * 각 subpath는 독립 PathCommand[]이며 MoveCommand로 시작한다.
 * 입력 command object reference는 그대로 재사용한다 (shallow copy 없음).
 * empty path → 빈 배열 `[]` 반환 (`[[]]` 아님).
 * 첫 command가 MoveCommand가 아니면 첫 subpath에 암묵적 origin move를 prepend한다.
 * 성능 최적화가 필요하면 `splitSubpathsInto`를 사용한다.
 *
 *
 * clamp/정규화/fallback 정책은 `splitSubpathsInto`와 동일하다.
 * @param commands 분리할 입력 command sequence
 * @returns 새로 만든 PathCommand[][] 배열
 */
export function splitSubpaths(commands: readonly PathCommand[]): PathCommand[][] {
  return splitSubpathsInto([], commands);
}
