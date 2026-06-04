import type { PolygonWritable, RegularPolygonOptions, XYInput } from '../types/index';
import { fromEllipseApproximationInto } from './from-ellipse-approximation-into';

/**
 * axis-aligned ellipse를 `segments`개 vertex polygon으로 근사해 새 `{ points: [...] }` object로 반환한다.
 *
 * 출력은 polygon approximation이며 exact ellipse relation/area가 아니다. vertex 각도는 uniform이지만
 * arc-length는 uniform하지 않다. 한쪽 radius가 다른 쪽보다 훨씬 크면 edge 길이가 불균등해진다 (caller 책임).
 * ellipse rotation은 지원하지 않는다 (axis-aligned 정의).
 * `segments`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) `{ points: [] }`를 반환한다 (validation throw 없음).
 * finite `radiusX <= 0` → `0`으로 clamp, finite `radiusY <= 0` → `0`으로 clamp (각 축 독립). 양쪽 radius가 모두 0이면 모든 vertex가 center다.
 * 한쪽 축만 0이면 vertex는 다른 축의 직선 위에 collinear하게 분포한다 (예: `radiusX = 0`이면 모든 vertex.x = `cx`, `sin(angle) === 0`인 vertex는 center와 일치).
 * non-finite radiusX/radiusY/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 * @param center ellipse 중심점 (XYInput)
 * @param radiusX x축 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param radiusY y축 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param segments push할 vertex 수. 3 이상 정수가 아니면 빈 points 반환 (non-integer/NaN/Infinity 포함)
 * @param options startAngle/clockwise 옵션. 기본 startAngle = -π/2, clockwise = true
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function fromEllipseApproximation(
  center: XYInput,
  radiusX: number,
  radiusY: number,
  segments: number,
  options?: RegularPolygonOptions
): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  fromEllipseApproximationInto(result.points, center, radiusX, radiusY, segments, options);
  return result;
}
