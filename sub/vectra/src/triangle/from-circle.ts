import type { CircleLike, TriangleWritable } from '../types';
import { fromCircleInto } from './from-circle-into';

/**
 * fromCircleInto의 allocating companion. 새 TriangleWritable을 반환한다.
 *
 * 좌표 정의는 `fromCircleInto`와 동일하다. `circle.radius`를 centroid-to-vertex 거리로 사용한다.
 *
 * `radius = 0`이면 세 vertex가 center인 degenerate triangle을 기록한다. 음수 radius는 clamp하지
 * 않고 JS 산술 결과를 따른다. NaN/Infinity 입력은 validation 없이 JS 산술 결과를 그대로 기록한다.
 *
 * @param circle 내접 정삼각형의 외접원 input. object 또는 tuple을 받는다.
 * @param rotation 첫 vertex angle의 radian. 기본값 -PI/2.
 */
export function fromCircle(circle: CircleLike, rotation: number = -Math.PI / 2): TriangleWritable {
  const out: TriangleWritable = {
    a: { x: 0, y: 0 },
    b: { x: 0, y: 0 },
    c: { x: 0, y: 0 },
  };
  return fromCircleInto(out, circle, rotation);
}
