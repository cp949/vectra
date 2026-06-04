import { assertFiniteNumbers } from './range.internal';
import { solveLinear } from './solve-linear';

/**
 * 2차 방정식 ax² + bx + c = 0의 실수 근을 반환한다.
 *
 * 근이 없으면 빈 배열을 반환한다. 중복근은 단일 원소 배열로 반환한다.
 * a === 0이면 선형 방정식으로 fallback한다(선형 해가 NaN이면 빈 배열 반환).
 * 모든 계수는 finite number여야 한다.
 *
 * @param a 2차항 계수
 * @param b 1차항 계수
 * @param c 상수항
 * @param eps 중복근 판정 tolerance. 기본값 1e-10
 */
export function solveQuadratic(a: number, b: number, c: number, eps = 1e-10): number[] {
  assertFiniteNumbers([a, b, c]);

  if (a === 0) {
    const r = solveLinear(b, c);
    return Number.isFinite(r) ? [r] : [];
  }

  const discriminant = b * b - 4 * a * c;

  if (discriminant < -eps) return [];

  if (discriminant <= eps) {
    return [-b / (2 * a)];
  }

  const sqrtD = Math.sqrt(discriminant);
  const r1 = (-b - sqrtD) / (2 * a);
  const r2 = (-b + sqrtD) / (2 * a);

  return r1 <= r2 ? [r1, r2] : [r2, r1];
}
