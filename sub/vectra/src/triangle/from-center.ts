import type { TriangleWritable, XYInput } from '../types';
import { fromCenterInto } from './from-center-into';

/**
 * fromCenterInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `fromCenterInto`와 동일하다. `radius = sideLength / sqrt(3)`을
 * centroid-to-vertex 거리로 사용한다.
 *
 * `sideLength = 0`이면 세 vertex가 center인 degenerate triangle을 기록한다. 음수 sideLength는
 * clamp하지 않고 JS 산술 결과를 따른다. NaN/Infinity 입력은 validation 없이 JS 산술 결과를
 * 그대로 기록한다.
 *
 * @param center centroid가 될 기준점
 * @param sideLength 변의 길이. clamp하지 않는다.
 * @param rotation 첫 vertex angle의 radian. 기본값 -PI/2.
 */
export function fromCenter(center: XYInput, sideLength: number, rotation: number = -Math.PI / 2): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  return fromCenterInto(out, center, sideLength, rotation);
}
