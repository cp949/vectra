import { buildRadialVertices } from '../internal/polygon-builder';
import { readX, readY } from '../internal/xy';
import type { StarOptions, XYInput, XYObjectWritable } from '../types/index';

/**
 * star polygon vertex `2 * points`개를 out에 새 `{ x, y }` object로 기록하고 out을 반환한다.
 *
 * outer vertex부터 시작해 `outer, inner, outer, inner, ...` 순서로 push한다 (총 `2 * points` vertex).
 * `points`가 3 이상 정수가 아니면 (non-integer, NaN, ±Infinity, `< 3` 포함) out을 clear만 하고 반환한다 (validation throw 없음).
 * `innerRadius` / `outerRadius`는 clamp하지 않고 그대로 사용한다. finite negative radius는 caller 책임이며
 * path `starCommandsInto`와 정합한다. finite zero radius는 해당 vertex가 center에 정렬되는 정상 산출이다.
 * non-finite radius/`startAngle`은 그대로 좌표 계산에 흘러 NaN/Infinity vertex가 push된다 (invalid numeric pass-through).
 * 기본 `startAngle = -Math.PI / 2` (위쪽 outer vertex 시작), `clockwise = true` (SVG y-down clockwise).
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * path `starCommandsInto`와 달리 close vertex는 추가하지 않고 정확히 `2 * points`개 vertex만 push한다.
 *
 * @param out vertex object를 기록할 mutable 배열
 * @param center star 중심점 (XYInput)
 * @param innerRadius inner vertex 반지름. clamp 없음. non-finite는 좌표에 그대로 전파
 * @param outerRadius outer vertex 반지름. clamp 없음. non-finite는 좌표에 그대로 전파
 * @param points outer vertex 수 (별의 꼭짓점 수). 3 이상 정수가 아니면 out clear만 (non-integer/NaN/Infinity 포함)
 * @param options startAngle/clockwise 옵션. 기본 startAngle = -π/2, clockwise = true
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function starPolygonInto<Out extends XYObjectWritable[]>(
  out: Out,
  center: XYInput,
  innerRadius: number,
  outerRadius: number,
  points: number,
  options?: StarOptions
): Out {
  out.length = 0;
  if (!Number.isInteger(points) || points < 3) {
    // non-integer, NaN, ±Infinity, < 3 모두 여기서 걸린다.
    return out;
  }

  const startAngle = options?.startAngle ?? -Math.PI / 2;
  const clockwise = options?.clockwise ?? true;
  const cx = readX(center);
  const cy = readY(center);
  const total = 2 * points;

  // index 0(outer), 1(inner), 2(outer), ... 교차. vertexRadius arg는 사용되지 않으므로 0을 넘긴다.
  buildRadialVertices(out, cx, cy, 0, total, startAngle, clockwise, (i) => (i % 2 === 0 ? outerRadius : innerRadius));
  return out;
}
