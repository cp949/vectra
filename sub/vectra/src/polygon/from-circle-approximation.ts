import type { PolygonWritable, RegularPolygonOptions, XYInput } from '../types/index';
import { fromCircleApproximationInto } from './from-circle-approximation-into';

/**
 * circle을 `segments`개 vertex polygon으로 근사해 새 `{ points: [...] }` object로 반환한다.
 *
 * 출력은 polygon approximation이며 exact circle relation/area가 아니다. vertex 각도는 uniform이지만
 * arc-length는 uniform하지 않다.
 * `segments`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) `{ points: [] }`를 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다 (radius 0으로 clamp).
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 *
 * caller-responsibility 가정은 `fromCircleApproximationInto`와 동일하다.
 * @param center circle 중심점 (XYInput)
 * @param radius circle 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param segments push할 vertex 수. 3 이상 정수가 아니면 빈 points 반환 (non-integer/NaN/Infinity 포함)
 * @param options startAngle/clockwise 옵션. 기본 startAngle = -π/2, clockwise = true
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function fromCircleApproximation(
  center: XYInput,
  radius: number,
  segments: number,
  options?: RegularPolygonOptions
): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  fromCircleApproximationInto(result.points, center, radius, segments, options);
  return result;
}
