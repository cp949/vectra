import type { PointWritable, Triangle } from '../types/flat-shapes.internal';
import { pointInTriangleInto } from './point-in-triangle-into';
import type { RandomSource } from './random';

/**
 * 삼각형 내부의 무작위 점을 균등 분포(barycentric 방법)로 새 object로 반환한다.
 *
 * @param triangle 대상 삼각형
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInTriangle(triangle: Triangle, rng?: RandomSource): PointWritable {
  const out = { x: 0, y: 0 };
  pointInTriangleInto(out, triangle, rng);
  return out;
}
