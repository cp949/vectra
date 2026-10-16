import { readTriangleRawCoords } from '../internal/triangle';
import { solveTriangleCircumcenter } from '../internal/triangle-circumcenter';
import { writeXY } from '../internal/xy';
import type { CircleWritable, TriangleLike, XYWritable } from '../types';

const center = { x: 0, y: 0 };

/**
 * triangle의 외접원(circumcircle)을 계산해 out에 기록하고 out을 반환한다.
 *
 * 외접원의 중심은 외심(circumcenter)이고, 반지름은 외심-vertex 거리다.
 * degenerate triangle이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 외접원을 기록할 writable output
 * @param triangle 외접원을 계산할 triangle
 * @returns out 또는 false(degenerate)
 */
export function circumcircleInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  triangle: TriangleLike
): Out | false {
  if (!solveTriangleCircumcenter(center, triangle)) return false;
  // out.center가 vertex와 alias일 수 있으므로 기록 전에 vertex A를 읽어 둔다.
  const { ax, ay } = readTriangleRawCoords(triangle);
  writeXY(out.center, center.x, center.y);
  out.radius = Math.hypot(ax - center.x, ay - center.y);
  return out;
}
