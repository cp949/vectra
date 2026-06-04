import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { splitAtLengthInto } from './split-at-length-into';

/** splitAtLength companion 결과 타입. */
export interface PathSplitResult {
  /** 0 ~ distance 구간 path. 새로 만든 배열이다. */
  first: PathCommand[];
  /** distance ~ totalLength 구간 path. 새로 만든 배열이다. */
  second: PathCommand[];
}

/**
 * commands를 arc-length offset `distance` 위치에서 두 part로 분할한 새 결과 object를 반환한다.
 *
 * - `first`: 0 ~ distance 구간 path를 그대로 담은 새 배열.
 * - `second`: distance ~ totalLength 구간 path를 그대로 담은 새 배열.
 * - 두 path 모두 absolute-only 정책을 유지하며 split 지점에서 시작하는 새 MoveCommand를 둔다.
 *
 * 경계 처리:
 * - `distance <= 0` → `first`는 empty, `second`는 입력 commands를 그대로 복사.
 * - `distance >= totalLength` → `first`는 입력 commands를 그대로 복사, `second`는 empty.
 * - empty / move-only path → `first`는 empty, `second`는 입력을 그대로 복사.
 * - `NaN` distance: JS 비교 결과로 `first`에 전체 path, `second`는 empty.
 * - `+Infinity` / `-Infinity` distance: 각각 distance >= totalLength / distance <= 0 분기로 처리.
 *
 * Segment-level split 정책은 `splitAtLengthInto` JSDoc을 참고한다.
 * 성능 최적화가 필요하면 `splitAtLengthInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `splitAtLengthInto`와 동일하다.
 * @param commands 분할할 path command sequence (absolute 전제)
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 * @returns `{ first, second }` 새 결과 object
 */
export function splitAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): PathSplitResult {
  const first: PathCommand[] = [];
  const second: PathCommand[] = [];
  splitAtLengthInto(first, second, commands, distance, options);
  return { first, second };
}
