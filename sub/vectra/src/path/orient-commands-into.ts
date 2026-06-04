import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { isClockwise } from './is-clockwise';
import { reverseCommandsInto } from './reverse-commands-into';

/** PathCommand는 flat object이므로 object spread로 독립 command를 만든다. */
function copyCommand(command: PathCommand): PathCommand {
  return { ...command };
}

/**
 * commands를 `clockwise` 방향으로 정렬해 out에 기록하고 out을 반환한다.
 *
 * 현재 방향이 desired와 일치하면 commands를 새 command object로 복사하고, 일치하지 않으면
 * `reverseCommandsInto`에 위임한다.
 *
 * `clockwise` parameter는 caller가 desired direction을 명시하는 메커니즘이며 좌표계
 * 기본은 y-down 고정이다 (`signedArea > 0`을 CW로 해석). caller가 y-up
 * 수학 좌표계에서 호출하면 `clockwise` 의미가 반전되며 이는 caller 책임이다.
 *
 * - empty path → out.length = 0 후 out 반환.
 * - zero-area path → `isClockwise`가 `false`를 반환하므로 `clockwise=false`이면 copy,
 *   `clockwise=true`이면 reverse가 호출된다.
 * - NaN signedArea → `isClockwise`가 `false`를 반환하므로 CCW로 간주된다.
 * - copy 분기는 command object reference를 input과 공유하지 않는다.
 * - out과 commands가 같은 배열이어도 안전하다. snapshot 후 clear 방식으로 처리한다.
 *
 * @param out 결과를 기록할 mutable PathCommand 배열
 * @param commands 정렬할 입력 command sequence
 * @param clockwise desired direction. y-down 좌표계 기준 `true`가 CW.
 * @param options flatten 옵션 (flatness 기본 0.5, maxRecursion 기본 32) — direction 판정에 사용한다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function orientCommandsInto<Out extends PathCommand[]>(
  out: Out,
  commands: readonly PathCommand[],
  clockwise: boolean,
  options?: PathMeasurementOptions
): Out {
  if (commands.length === 0) {
    out.length = 0;
    return out;
  }

  const currentlyCW = isClockwise(commands, options);

  if (currentlyCW === clockwise) {
    // clear 전에 snapshot해 aliasing(out === commands)을 안전하게 처리
    const snapshot = commands === (out as readonly PathCommand[]) ? Array.from(commands) : commands;
    out.length = 0;
    for (const cmd of snapshot) out.push(copyCommand(cmd) as Out[number]);
    return out;
  }

  return reverseCommandsInto(out, commands);
}
