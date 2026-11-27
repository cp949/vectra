import type { Circle, TriangleWritable } from '../types/flat-shapes.internal';
import { writeEquilateralFromCenter } from './equilateral-center.internal';

/**
 * circle에 내접하는 정삼각형 vertex를 out에 기록하고 out을 반환한다.
 *
 * `circle.r`를 centroid-to-vertex 거리로 사용한다.
 *
 * 좌표 정의:
 * - (x1, y1) = center + radius * (cos(rotation), sin(rotation))
 * - (x2, y2) = center + radius * (cos(rotation + 2PI/3), sin(rotation + 2PI/3))
 * - (x3, y3) = center + radius * (cos(rotation + 4PI/3), sin(rotation + 4PI/3))
 *
 * `radius = 0`이면 세 vertex가 center인 degenerate triangle을 기록한다. 음수 radius는
 * clamp하지 않고 JS 산술 결과(점대칭으로 뒤집힌 vertex)를 따른다.
 *
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다. 특히 radius나 rotation이
 * Infinity면 `Math.cos`/`Math.sin` 또는 `Infinity * 0` 결과가 NaN으로 흐른다.
 *
 * 입력 좌표를 먼저 읽은 뒤 결과를 기록한다.
 *
 * @param out 정삼각형 vertex를 기록할 triangle 객체
 * @param circle 내접 정삼각형의 외접원 객체.
 * @param rotation 첫 vertex angle의 radian. 기본값 -PI/2.
 */
export function fromCircleInto<Out extends TriangleWritable>(
  out: Out,
  circle: Circle,
  rotation: number = -Math.PI / 2
): Out {
  // aliasing 안전을 위해 circle center 좌표를 local에 먼저 읽는다
  const { cx, cy, r: radius } = circle;

  return writeEquilateralFromCenter(out, cx, cy, radius, rotation);
}
