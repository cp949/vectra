import type { Point } from '../types/flat-shapes.internal';
import type { PathCommand, RegularPolygonOptions } from '../types/index';

/**
 * regular polygon을 move + (sides - 1) line + close, 총 sides + 1 command로 out에 기록하고 out을 반환한다.
 *
 * `sides`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) out을 clear만 하고 반환한다 (validation throw 없음).
 * finite `radius <= 0`이면 모든 vertex가 center에 모인다.
 * 옵션을 생략하면 `startAngle = -Math.PI / 2` (위쪽 vertex 시작), `clockwise = true` (SVG y-down).
 * non-finite radius/startAngle은 그대로 흘러 NaN/Infinity vertex가 push된다 (path invalid numeric pass-through).
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param center polygon 중심점 (점 객체)
 * @param radius vertex가 위치한 원의 반지름
 * @param sides vertex 수. 3 이상 정수가 아니면 out clear만 (non-integer/NaN/Infinity 포함)
 * @param options 시작 각도와 진행 방향 옵션. 생략하면 `{ startAngle: -Math.PI / 2, clockwise: true }`를 쓴다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function regularPolygonCommandsInto(
  out: PathCommand[],
  center: Point,
  radius: number,
  sides: number,
  options?: Required<RegularPolygonOptions>
): PathCommand[] {
  out.length = 0;
  if (!Number.isInteger(sides) || sides < 3) {
    // non-integer, NaN, ±Infinity, < 3 모두 여기서 걸린다.
    return out;
  }

  const startAngle = options === undefined ? -Math.PI / 2 : options.startAngle;
  const clockwise = options === undefined ? true : options.clockwise;
  const cx = center.x;
  const cy = center.y;
  // step 부호: clockwise(true)면 SVG y-down에서 각도 증가 = 시계 방향이다.
  const step = ((clockwise ? 1 : -1) * (2 * Math.PI)) / sides;

  const vertexRadius = Number.isFinite(radius) && radius <= 0 ? 0 : radius;

  out.push({
    kind: 'move',
    x: cx + vertexRadius * Math.cos(startAngle),
    y: cy + vertexRadius * Math.sin(startAngle),
  });
  for (let i = 1; i < sides; i++) {
    const angle = startAngle + step * i;
    out.push({
      kind: 'line',
      x: cx + vertexRadius * Math.cos(angle),
      y: cy + vertexRadius * Math.sin(angle),
    });
  }
  out.push({ kind: 'close' });
  return out;
}
