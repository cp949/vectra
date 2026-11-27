import type { Point, PolygonWritable } from '../types/flat-shapes.internal';
import { buildRadialVertices } from '../internal/polygon-builder';
import type { RegularPolygonOptions } from '../types';

/**
 * circle을 `segments`개 vertex polygon으로 근사해 out에 교대로 저장한 좌표 `[x0, y0, …]`로 기록하고 out을 반환한다.
 *
 * 출력은 polygon approximation이며 exact circle relation/area가 아니다. vertex 각도는 uniform이지만
 * arc-length는 uniform하지 않다. `regularPolygonInto(out, center, radius, segments)`와 산식이 동일하지만
 * caller 의도(원 근사 vs 정다각형)가 달라 별도 leaf를 유지한다.
 * `segments`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) out을 clear만 하고 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다 (radius 0으로 clamp).
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out vertex 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param center circle 중심점 (Point)
 * @param radius circle 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param segments push할 vertex 수. 3 이상 정수가 아니면 out clear만 (non-integer/NaN/Infinity 포함)
 * @param options 시작 각도와 진행 방향. 생략하면 startAngle = -π/2, clockwise = true
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromCircleApproximationInto(
  out: PolygonWritable,
  center: Point,
  radius: number,
  segments: number,
  options?: Required<RegularPolygonOptions>
): PolygonWritable {
  out.length = 0;
  if (!Number.isInteger(segments) || segments < 3) {
    // non-integer, NaN, ±Infinity, < 3 모두 여기서 걸린다.
    return out;
  }

  const startAngle = options === undefined ? -Math.PI / 2 : options.startAngle;
  const clockwise = options === undefined ? true : options.clockwise;
  const cx = center.x;
  const cy = center.y;
  const vertexRadius = Number.isFinite(radius) && radius <= 0 ? 0 : radius;

  buildRadialVertices(out, cx, cy, vertexRadius, segments, startAngle, clockwise);
  return out;
}
