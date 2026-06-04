import type { PathCommand } from '../types/index';
import { splitSubpathsInto } from './split-subpaths-into';

/**
 * commands의 `index`번째 subpath command sequence를 반환한다.
 *
 * `splitSubpathsInto`에 위임해 subpath를 분리한 뒤 해당 index의 배열을 반환한다.
 * 반환 배열은 새 array이며 원본 `commands` 배열 reference와 공유되지 않는다.
 * subpath 내부 command object reference는 그대로 재사용한다.
 *
 * 첫 command가 MoveCommand가 아닌 path는 암묵적 origin move(`{0,0}`)를 가진 단일
 * subpath로 처리한다. 이 경우 index 0의 subpath 첫 command는 새 MoveCommand object이다.
 *
 * 다음 입력은 모두 `undefined`를 반환한다.
 *
 * - empty path
 * - `index < 0`
 * - `index >= subpathCount`
 * - non-integer / NaN / Infinity index
 *
 * JavaScript Array의 음수 index 자동 wrap은 사용하지 않는다.
 *
 * @param commands subpath를 읽을 path command sequence
 * @param index 읽을 subpath의 0-based index
 */
export function subpathAt(commands: readonly PathCommand[], index: number): readonly PathCommand[] | undefined {
  if (!Number.isInteger(index) || index < 0) {
    return undefined;
  }

  const subpaths: PathCommand[][] = [];
  splitSubpathsInto(subpaths, commands);

  if (index >= subpaths.length) {
    return undefined;
  }

  return subpaths[index];
}
