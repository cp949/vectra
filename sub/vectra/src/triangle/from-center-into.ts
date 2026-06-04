import { readX, readY } from '../internal/xy';
import type { TriangleWritable, XYInput, XYWritable } from '../types';
import { writeEquilateralFromCenter } from './equilateral-center.internal';

/**
 * centroid가 center인 정삼각형 vertex를 out에 기록하고 out을 반환한다.
 *
 * `radius = sideLength / sqrt(3)`을 centroid-to-vertex 거리로 사용한다.
 *
 * 좌표 정의:
 * - out.a = center + radius * (cos(rotation), sin(rotation))
 * - out.b = center + radius * (cos(rotation + 2PI/3), sin(rotation + 2PI/3))
 * - out.c = center + radius * (cos(rotation + 4PI/3), sin(rotation + 4PI/3))
 *
 * `sideLength = 0`이면 세 vertex가 center인 degenerate triangle을 기록한다. 음수 sideLength는
 * clamp하지 않고 JS 산술 결과(점대칭으로 뒤집힌 vertex)를 따른다.
 *
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다. 특히 sideLength나
 * rotation이 Infinity면 `Math.cos`/`Math.sin` 또는 `Infinity * 0` 결과가 NaN으로 흐른다.
 *
 * aliasing: center 좌표를 local에 먼저 읽으므로 center가 out의 vertex storage와 같아도 안전하다.
 *
 * @param out 정삼각형 vertex를 기록할 writable output
 * @param center centroid가 될 기준점
 * @param sideLength 변의 길이. clamp하지 않는다.
 * @param rotation 첫 vertex angle의 radian. 기본값 -PI/2.
 */
export function fromCenterInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  center: XYInput,
  sideLength: number,
  rotation: number = -Math.PI / 2
): Out {
  // aliasing 안전을 위해 center 좌표를 local에 먼저 읽는다
  const cx = readX(center);
  const cy = readY(center);
  const radius = sideLength / Math.sqrt(3);

  return writeEquilateralFromCenter(out, cx, cy, radius, rotation);
}
