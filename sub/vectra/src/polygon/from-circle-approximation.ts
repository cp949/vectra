import type { Point, PolygonWritable } from '../types/flat-shapes.internal';
import type { RegularPolygonOptions } from '../types';
import { fromCircleApproximationInto } from './from-circle-approximation-into';

/**
 * circle을 `segments`개 vertex polygon으로 근사해 새 좌표 배열로 반환한다.
 *
 * 출력은 polygon approximation이며 exact circle relation/area가 아니다. vertex 각도는 uniform이지만
 * arc-length는 uniform하지 않다.
 * `segments`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) 빈 배열을 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다 (radius 0으로 clamp).
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 *
 * caller-responsibility 가정은 `fromCircleApproximationInto`와 동일하다.
 * @param center circle 중심점 (Point)
 * @param radius circle 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param segments push할 vertex 수. 3 이상 정수가 아니면 빈 배열 반환 (non-integer/NaN/Infinity 포함)
 * @param options 시작 각도와 진행 방향. 생략하면 startAngle = -π/2, clockwise = true
 * @returns 새 polygon 좌표 배열 (`[x0, y0, …]`)
 */
export function fromCircleApproximation(
  center: Point,
  radius: number,
  segments: number,
  options?: Required<RegularPolygonOptions>
): PolygonWritable {
  const result: PolygonWritable = [];
  fromCircleApproximationInto(result, center, radius, segments, options);
  return result;
}
