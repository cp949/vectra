import type { MatrixLike, PathCommand } from '../types/index';
import { type TransformCommandsOptions, transformCommandsInto } from './transform-commands-into';

/**
 * commands 전체에 affine matrix를 적용한 새 PathCommand[] 배열을 반환한다.
 *
 * - Move/Line/Quadratic/Cubic: 모든 좌표 field(control point 포함)에 affine 적용.
 * - Close: 좌표가 없으므로 kind만 보존한 새 close marker를 push한다.
 * - Arc: arcHandling 옵션에 따른다 (기본값 'keep': endpoint만 변환).
 * - invalid numeric(NaN, Inf)은 throw 없이 전파한다.
 * 결과 command는 새 object이며 입력 command reference를 보존하지 않으므로
 * 결과의 command를 mutate해도 입력 sequence는 안전하다.
 * 성능 최적화가 필요하면 `transformCommandsInto`를 사용한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `transformCommandsInto`와 동일하다.
 * caller-responsibility 가정은 `transformCommandsInto`와 동일하다.
 * @param commands 변환할 입력 command sequence (absolute 전제)
 * @param matrix 적용할 affine matrix
 * @param options arc 처리 방식 옵션
 * @returns 새로 만든 변환된 PathCommand 배열
 */
export function transformCommands(
  commands: readonly PathCommand[],
  matrix: MatrixLike,
  options?: TransformCommandsOptions
): PathCommand[] {
  return transformCommandsInto([], commands, matrix, options);
}
