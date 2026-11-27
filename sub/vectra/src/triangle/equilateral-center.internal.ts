import type { TriangleWritable } from '../types/flat-shapes.internal';

const TWO_PI_OVER_3 = (2 * Math.PI) / 3;
const FOUR_PI_OVER_3 = (4 * Math.PI) / 3;

/**
 * centroid (cx, cy)와 centroid-to-vertex 거리 radius로 정의되는 정삼각형 vertex를 out에
 * 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - (x1, y1) = center + radius * (cos(rotation), sin(rotation))
 * - (x2, y2) = center + radius * (cos(rotation + 2PI/3), sin(rotation + 2PI/3))
 * - (x3, y3) = center + radius * (cos(rotation + 4PI/3), sin(rotation + 4PI/3))
 *
 * caller가 center 좌표를 local에 먼저 읽어 넘기는 것을 전제한다. center read/write aliasing은
 * caller가 책임진다. radius / rotation의 non-finite 값은 validation 없이 JS 산술 결과를 따른다.
 *
 * domain-local helper다. public으로 export하지 않는다.
 *
 * @param out 정삼각형 vertex를 기록할 삼각형 객체
 * @param cx centroid x
 * @param cy centroid y
 * @param radius centroid-to-vertex 거리. clamp하지 않는다.
 * @param rotation 첫 vertex angle의 radian
 */
export function writeEquilateralFromCenter<Out extends TriangleWritable>(
  out: Out,
  cx: number,
  cy: number,
  radius: number,
  rotation: number
): Out {
  out.x1 = cx + radius * Math.cos(rotation);
  out.y1 = cy + radius * Math.sin(rotation);
  out.x2 = cx + radius * Math.cos(rotation + TWO_PI_OVER_3);
  out.y2 = cy + radius * Math.sin(rotation + TWO_PI_OVER_3);
  out.x3 = cx + radius * Math.cos(rotation + FOUR_PI_OVER_3);
  out.y3 = cy + radius * Math.sin(rotation + FOUR_PI_OVER_3);

  return out;
}
