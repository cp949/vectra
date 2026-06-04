import type { PathCommand } from '../types/index';

/**
 * MoveCommand 기준으로 subpath를 분리해 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 각 subpath 배열을 push한다.
 * 각 subpath는 독립 PathCommand[]이며 MoveCommand로 시작한다.
 * 입력 command object reference는 그대로 재사용한다 (shallow copy 없음).
 *
 * - empty path → out.length = 0만 수행 (결과 `[]`, `[[]]` 아님).
 * - 첫 command가 MoveCommand가 아니면 첫 subpath에 암묵적 origin move
 *   `{ kind: 'move', x: 0, y: 0 }`를 prepend한다 (normalizeCommandsInto 정책과 일치).
 * - MoveCommand가 없는 path는 암묵적 origin move를 가진 단일 subpath로 처리한다.
 * - out과 commands가 별개 배열이어야 한다 (out은 PathCommand[][], commands는 PathCommand[]).
 *
 * @param out subpath 배열을 기록할 mutable PathCommand[][] 배열
 * @param commands 분리할 입력 command sequence
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function splitSubpathsInto<Out extends PathCommand[][]>(out: Out, commands: readonly PathCommand[]): Out {
  out.length = 0;

  if (commands.length === 0) {
    return out;
  }

  let current: PathCommand[] | null = null;

  for (const cmd of commands) {
    if (cmd.kind === 'move') {
      current = [cmd];
      out.push(current as Out[number]);
      continue;
    }

    if (current === null) {
      // 첫 command가 MoveCommand가 아니면 암묵적 origin move로 subpath를 연다
      current = [{ kind: 'move' as const, x: 0, y: 0 }];
      out.push(current as Out[number]);
    }

    current.push(cmd);
  }

  return out;
}
