import type { ArcCommand, PathCommand, XYInput } from '../types/index';
import { arcByEndpointCommandsInto } from './arc-by-endpoint-commands-into';

/**
 * from 시작점과 SVG endpoint arc command를 move + arc, 총 2 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * arcCommand 내부 field는 변경하지 않고 그대로 사용한다 (reference 공유).
 * arcCommand.rx, ry가 0 또는 음수여도, non-finite 좌표/parameter도 validation 없이 전파한다.
 * 성능 최적화가 필요하면 `arcByEndpointCommandsInto`를 사용한다.
 *
 *
 * caller-responsibility 가정은 `arcByEndpointCommandsInto`와 동일하다.
 * @param from 시작점
 * @param arcCommand SVG endpoint arc command
 * @returns 새로 만든 PathCommand 배열
 */
export function arcByEndpointCommands(from: XYInput, arcCommand: ArcCommand): PathCommand[] {
  return arcByEndpointCommandsInto([], from, arcCommand);
}
