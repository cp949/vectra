import type { PathCommand, RegularPolygonOptions, XYInput } from '../types/index';
import { regularPolygonCommandsInto } from './regular-polygon-commands-into';

/**
 * regular polygon을 move + (sides - 1) line + close, 총 sides + 1 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * `sides`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) 빈 배열 반환 (validation throw 없음).
 * finite radius <= 0이면 모든 vertex가 center에 모인다.
 * non-finite radius/startAngle은 그대로 전파한다.
 * 성능 최적화가 필요하면 `regularPolygonCommandsInto`를 사용한다.
 *
 * @param center polygon 중심점
 * @param radius vertex가 위치한 원의 반지름
 * @param sides 꼭짓점 수. 3 이상 정수가 아니면 빈 배열 반환 (non-integer/NaN/Infinity 포함)
 * @param options startAngle, clockwise 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function regularPolygonCommands(
  center: XYInput,
  radius: number,
  sides: number,
  options?: RegularPolygonOptions
): PathCommand[] {
  return regularPolygonCommandsInto([], center, radius, sides, options);
}
