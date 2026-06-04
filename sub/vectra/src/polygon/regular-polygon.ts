import type { PolygonWritable, RegularPolygonOptions, XYInput } from '../types/index';
import { regularPolygonInto } from './regular-polygon-into';

/**
 * regular polygon vertex `sides`개로 채운 새 `{ points: [...] }` object를 반환한다.
 *
 * `sides`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) `{ points: [] }`를 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다 (radius 0으로 clamp).
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * path `regularPolygonCommandsInto`와 달리 close vertex는 추가하지 않고 정확히 `sides`개 vertex만 push한다.
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 * @param center polygon 중심점 (XYInput)
 * @param radius vertex가 위치한 원의 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param sides vertex 수. 3 이상 정수가 아니면 빈 points 반환 (non-integer/NaN/Infinity 포함)
 * @param options startAngle/clockwise 옵션. 기본 startAngle = -π/2, clockwise = true
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function regularPolygon(
  center: XYInput,
  radius: number,
  sides: number,
  options?: RegularPolygonOptions
): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  regularPolygonInto(result.points, center, radius, sides, options);
  return result;
}
