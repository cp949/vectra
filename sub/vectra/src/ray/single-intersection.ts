import type { RayLike, XYObjectWritable } from '../types';
import { singleIntersectionInto } from './single-intersection-into';

/**
 * 두 ray가 단일 교점을 가지면 `{ x, y }` object를 반환한다. 교점이 없으면 `undefined`를 반환한다.
 *
 * collinear, parallel, backward 분기에서는 항상 `undefined`를 반환한다.
 * 내부적으로 `singleIntersectionInto`를 위임한다.
 *
 *
 * degenerate/empty 입력 처리 정책은 `singleIntersectionInto`와 동일하다.
 * @param a 첫 번째 ray
 * @param b 두 번째 ray
 * @param epsilon cross product 절대값 및 거리 임계값 (기본값 `1e-9`)
 */
export function singleIntersection(a: RayLike, b: RayLike, epsilon?: number): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return singleIntersectionInto(out, a, b, epsilon) ? out : undefined;
}
