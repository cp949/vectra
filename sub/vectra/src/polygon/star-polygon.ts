import type { PolygonWritable, StarOptions, XYInput } from '../types/index';
import { starPolygonInto } from './star-polygon-into';

/**
 * star polygon vertex `2 * points`개로 채운 새 `{ points: [...] }` object를 반환한다.
 *
 * outer vertex부터 시작해 `outer, inner, outer, inner, ...` 순서로 push한다 (총 `2 * points` vertex).
 * `points`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) `{ points: [] }`를 반환한다 (validation throw 없음).
 * `innerRadius` / `outerRadius`는 clamp하지 않고 그대로 사용한다. finite negative radius는 caller 책임이며
 * path `starCommandsInto`와 정합한다. finite zero radius는 해당 vertex가 center에 정렬되는 정상 산출이다.
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 outer vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * path `starCommandsInto`와 달리 close vertex는 추가하지 않고 정확히 `2 * points`개 vertex만 push한다.
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 * @param center star 중심점 (XYInput)
 * @param innerRadius inner vertex 반지름. clamp 없음. non-finite는 좌표에 그대로 전파
 * @param outerRadius outer vertex 반지름. clamp 없음. non-finite는 좌표에 그대로 전파
 * @param points outer vertex 수 (별의 꼭짓점 수). 3 이상 정수가 아니면 빈 points 반환 (non-integer/NaN/Infinity 포함)
 * @param options startAngle/clockwise 옵션. 기본 startAngle = -π/2, clockwise = true
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function starPolygon(
  center: XYInput,
  innerRadius: number,
  outerRadius: number,
  points: number,
  options?: StarOptions
): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  starPolygonInto(result.points, center, innerRadius, outerRadius, points, options);
  return result;
}
