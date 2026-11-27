import type { TriangleWritable, Point } from '../types/flat-shapes.internal';

/**
 * origin과 sideLength로 정의되는 정삼각형 vertex를 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - (x1, y1) = origin
 * - (x2, y2) = origin + sideLength * (cos(angle), sin(angle))
 * - (x3, y3) = origin + sideLength * (cos(angle + PI/3), sin(angle + PI/3))
 *
 * `sideLength > 0`이면 기본 CCW 정삼각형이 된다. `sideLength = 0`이면 세 vertex가 같은
 * degenerate triangle을 기록한다. 음수 sideLength는 clamp하지 않고 JS 산술 결과를 따른다.
 *
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과(NaN 또는 Infinity)를 그대로 기록한다.
 * 특히 angle이 Infinity면 `Math.cos`/`Math.sin` 결과가 NaN이라 b/c가 NaN으로 흐른다.
 *
 * 입력 좌표를 먼저 읽은 뒤 결과를 기록한다.
 *
 * @param out 정삼각형 vertex를 기록할 삼각형 객체
 * @param origin 첫 vertex가 될 기준점
 * @param sideLength 변의 길이. clamp하지 않는다.
 * @param angle origin→b 방향의 radian. 기본값 0.
 */
export function buildEquilateralInto<Out extends TriangleWritable>(
  out: Out,
  origin: Point,
  sideLength: number,
  angle: number = 0
): Out {
  // aliasing 안전을 위해 origin 좌표를 local에 먼저 읽는다
  const ox = origin.x;
  const oy = origin.y;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const cosB = Math.cos(angle + Math.PI / 3);
  const sinB = Math.sin(angle + Math.PI / 3);

  out.x1 = ox;
  out.y1 = oy;
  out.x2 = ox + sideLength * cosA;
  out.y2 = oy + sideLength * sinA;
  out.x3 = ox + sideLength * cosB;
  out.y3 = oy + sideLength * sinB;

  return out;
}
