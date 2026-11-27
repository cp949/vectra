import { createZeroTriangle } from '../internal/triangle';
import type { Circle, TriangleWritable } from '../types/flat-shapes.internal';
import { fromCircleInto } from './from-circle-into';

/**
 * fromCircleInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `fromCircleInto`와 동일하다. `circle.r`를 centroid-to-vertex 거리로 사용한다.
 *
 * `radius = 0`이면 세 vertex가 center인 degenerate triangle을 기록한다. 음수 radius는 clamp하지
 * 않고 JS 산술 결과를 따른다. NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다.
 *
 * @param circle 내접 정삼각형의 외접원 객체.
 * @param rotation 첫 vertex angle의 radian. 기본값 -PI/2.
 */
export function fromCircle(circle: Circle, rotation: number = -Math.PI / 2): TriangleWritable {
  const out = createZeroTriangle();
  return fromCircleInto(out, circle, rotation);
}
