import type { PathCommand, StarOptions, XYInput } from '../types/index';
import { starCommandsInto } from './star-commands-into';

/**
 * star polygon을 move + (2 * points - 1) line + close, 총 2 * points + 1 command로 만들어 새 PathCommand[] 배열로 반환한다.
 *
 * `points`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) 빈 배열 반환 (validation throw 없음).
 * inner > outer도 그대로 사용한다 (caller 책임).
 * non-finite innerRadius/outerRadius/startAngle은 그대로 전파한다.
 * 성능 최적화가 필요하면 `starCommandsInto`를 사용한다.
 *
 * @param center star 중심점
 * @param innerRadius inner vertex 반지름
 * @param outerRadius outer vertex 반지름
 * @param points outer vertex 수 (별의 꼭짓점 수). 3 이상 정수가 아니면 빈 배열 반환 (non-integer/NaN/Infinity 포함)
 * @param options startAngle, clockwise 옵션
 * @returns 새로 만든 PathCommand 배열
 */
export function starCommands(
  center: XYInput,
  innerRadius: number,
  outerRadius: number,
  points: number,
  options?: StarOptions
): PathCommand[] {
  return starCommandsInto([], center, innerRadius, outerRadius, points, options);
}
