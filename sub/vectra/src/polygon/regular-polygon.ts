import type { Point, PolygonWritable } from '../types/flat-shapes.internal';
import type { RegularPolygonOptions } from '../types';
import { regularPolygonInto } from './regular-polygon-into';

/**
 * regular polygon vertex `sides`개로 채운 새 좌표 배열을 반환한다.
 *
 * `sides`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) 빈 배열을 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다 (radius 0으로 clamp).
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * path `regularPolygonCommandsInto`와 달리 close vertex는 추가하지 않고 정확히 `sides`개 vertex만 push한다.
 *
 * @param center polygon 중심점 (Point)
 * @param radius vertex가 위치한 원의 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param sides vertex 수. 3 이상 정수가 아니면 빈 배열 반환 (non-integer/NaN/Infinity 포함)
 * @param options 시작 각도와 진행 방향. 생략하면 startAngle = -π/2, clockwise = true
 * @returns 새 polygon 좌표 배열 (`[x0, y0, …]`)
 */
export function regularPolygon(
  center: Point,
  radius: number,
  sides: number,
  options?: Required<RegularPolygonOptions>
): PolygonWritable {
  const result: PolygonWritable = [];
  regularPolygonInto(result, center, radius, sides, options);
  return result;
}
