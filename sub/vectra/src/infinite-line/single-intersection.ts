import type { InfiniteLine, PointWritable } from '../types/flat-shapes.internal';
import { singleIntersectionInto } from './single-intersection-into';

/**
 * 두 infinite-line가 단일 교점을 가지면 `{ x, y }` object를 반환한다. 교점이 없으면 `undefined`를 반환한다.
 *
 * parallel 또는 collinear 분기에서는 항상 `undefined`를 반환한다.
 * 내부적으로 `singleIntersectionInto`를 위임한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `singleIntersectionInto`와 동일하다.
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon 거리 임계값 (기본값 `1e-9`). 생략 시 평행 판정은 `sin θ <= 1e-9`를 쓴다.
 *   명시하면 평행 판정은 `|cross| <= epsilon`을 쓴다.
 */
export function singleIntersection(a: InfiniteLine, b: InfiniteLine, epsilon?: number): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
  return singleIntersectionInto(out, a, b, epsilon) ? out : undefined;
}
