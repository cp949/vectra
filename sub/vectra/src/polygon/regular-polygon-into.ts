import type { Point, PolygonWritable } from '../types/flat-shapes.internal';
import { buildRadialVertices } from '../internal/polygon-builder';
import type { RegularPolygonOptions } from '../types';

/**
 * regular polygon vertex `sides`개를 out에 교대로 저장한 좌표 `[x0, y0, …]`로 기록하고 out을 반환한다.
 *
 * `sides`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) out을 clear만 하고 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다 (radius 0으로 clamp).
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * path `regularPolygonCommandsInto`와 달리 close vertex는 추가하지 않고 정확히 `sides`개 vertex만 push한다.
 *
 * @param out vertex 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param center polygon 중심점 (Point)
 * @param radius vertex가 위치한 원의 반지름. finite `<= 0`이면 0으로 clamp. non-finite는 좌표에 그대로 전파
 * @param sides vertex 수. 3 이상 정수가 아니면 out clear만 (non-integer/NaN/Infinity 포함)
 * @param options 시작 각도와 진행 방향. 생략하면 startAngle = -π/2, clockwise = true
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function regularPolygonInto(
  out: PolygonWritable,
  center: Point,
  radius: number,
  sides: number,
  options?: Required<RegularPolygonOptions>
): PolygonWritable {
  out.length = 0;
  if (!Number.isInteger(sides) || sides < 3) {
    // non-integer, NaN, ±Infinity, < 3 모두 여기서 걸린다.
    return out;
  }

  const startAngle = options === undefined ? -Math.PI / 2 : options.startAngle;
  const clockwise = options === undefined ? true : options.clockwise;
  const cx = center.x;
  const cy = center.y;
  const vertexRadius = Number.isFinite(radius) && radius <= 0 ? 0 : radius;

  buildRadialVertices(out, cx, cy, vertexRadius, sides, startAngle, clockwise);
  return out;
}
