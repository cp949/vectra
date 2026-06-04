import type { XYInput } from '../types';
import { pointInTriangleInto } from './point-in-triangle-into';
import type { RandomSource } from './random';

/**
 * 삼각형 내부의 무작위 점을 균등 분포(barycentric 방법)로 새 object로 반환한다.
 *
 * @param a - 삼각형 첫 번째 꼭짓점
 * @param b - 삼각형 두 번째 꼭짓점
 * @param c - 삼각형 세 번째 꼭짓점
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export function pointInTriangle(a: XYInput, b: XYInput, c: XYInput, rng?: RandomSource): { x: number; y: number } {
  const out = { x: 0, y: 0 };
  pointInTriangleInto(out, a, b, c, rng);
  return out;
}
