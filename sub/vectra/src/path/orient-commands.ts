import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { orientCommandsInto } from './orient-commands-into';

/**
 * commands를 원하는 방향(clockwise/counter-clockwise)으로 정렬한 새 PathCommand[] 배열을 반환한다.
 *
 * 이미 원하는 방향이면 입력을 그대로 복사한다. 반대 방향이면 반전한다.
 * empty commands → 빈 배열 반환.
 * 좌표계 기본은 y-down 고정(`signedArea > 0`을 CW로 해석). caller가 y-up 수학 좌표계에서
 * 호출하면 clockwise 의미가 반전되며 이는 caller 책임이다.
 * zero-area path는 CCW로 간주된다. NaN signedArea는 CCW로 간주된다.
 * copy 분기에서도 command object reference는 입력과 공유하지 않으므로
 * 결과의 command를 mutate해도 입력 sequence는 안전하다.
 * 성능 최적화가 필요하면 `orientCommandsInto`를 사용한다.
 *
 * @param commands 방향 정렬할 입력 command sequence
 * @param clockwise true이면 clockwise, false이면 counter-clockwise
 * @param options measurement 옵션
 * @returns 새로 만든 방향 정렬된 PathCommand 배열
 */
export function orientCommands(
  commands: readonly PathCommand[],
  clockwise: boolean,
  options?: PathMeasurementOptions
): PathCommand[] {
  return orientCommandsInto([], commands, clockwise, options);
}
