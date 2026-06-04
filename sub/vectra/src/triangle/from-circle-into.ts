import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike, TriangleWritable, XYWritable } from '../types';
import { writeEquilateralFromCenter } from './equilateral-center.internal';

/**
 * circle에 내접하는 정삼각형 vertex를 out에 기록하고 out을 반환한다.
 *
 * `circle.radius`를 centroid-to-vertex 거리로 사용한다.
 *
 * 좌표 정의:
 * - out.a = center + radius * (cos(rotation), sin(rotation))
 * - out.b = center + radius * (cos(rotation + 2PI/3), sin(rotation + 2PI/3))
 * - out.c = center + radius * (cos(rotation + 4PI/3), sin(rotation + 4PI/3))
 *
 * `radius = 0`이면 세 vertex가 center인 degenerate triangle을 기록한다. 음수 radius는
 * clamp하지 않고 JS 산술 결과(점대칭으로 뒤집힌 vertex)를 따른다.
 *
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다. 특히 radius나 rotation이
 * Infinity면 `Math.cos`/`Math.sin` 또는 `Infinity * 0` 결과가 NaN으로 흐른다.
 *
 * aliasing: circle center 좌표를 local에 먼저 읽으므로 center가 out의 vertex storage와 같아도
 * 안전하다.
 *
 * @param out 정삼각형 vertex를 기록할 writable output
 * @param circle 내접 정삼각형의 외접원 input. object 또는 tuple을 받는다.
 * @param rotation 첫 vertex angle의 radian. 기본값 -PI/2.
 */
export function fromCircleInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  circle: CircleLike,
  rotation: number = -Math.PI / 2
): Out {
  // aliasing 안전을 위해 circle center 좌표를 local에 먼저 읽는다
  const center = readCircleCenter(circle);
  const cx = readX(center);
  const cy = readY(center);
  const radius = readCircleRadius(circle);

  return writeEquilateralFromCenter(out, cx, cy, radius, rotation);
}
