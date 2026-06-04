import type { PathCommand } from '../types/index';

/**
 * commands를 out 배열에 정규화하여 기록한다.
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * 첫 command가 MoveCommand가 아니면 원점(0, 0)으로의 암묵적 MoveCommand를 삽입한다.
 * 입력 command object는 그대로 재사용한다(shallow copy 없음).
 * 기록 완료 후 out을 그대로 반환한다.
 * ADR 0006 적용: caller-provided writable output의 구체 타입을 보존한다.
 *
 * out과 commands가 같은 배열이어도 안전하다(aliasing 허용).
 *
 * @param out - 결과를 기록할 mutable PathCommand 배열
 * @param commands - 정규화할 입력 command sequence
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function normalizeCommandsInto<Out extends PathCommand[]>(out: Out, commands: readonly PathCommand[]): Out {
  // output aliasing 대비: out === commands인 경우를 안전하게 처리하기 위해 먼저 snapshot
  const snapshot = commands === (out as readonly PathCommand[]) ? Array.from(commands) : commands;

  // out을 clear
  out.length = 0;

  // 빈 입력은 빈 배열 반환
  if (snapshot.length === 0) {
    return out;
  }

  // 첫 command가 MoveCommand가 아니면 새 원점 move object를 생성하여 삽입
  if (snapshot[0].kind !== 'move') {
    out.push({ kind: 'move' as const, x: 0, y: 0 });
  }

  // 입력 command object reference를 그대로 push
  for (const cmd of snapshot) {
    out.push(cmd);
  }

  return out;
}
