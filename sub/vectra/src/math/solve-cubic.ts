import { assertFiniteNumbers } from './range.internal';
import { solveQuadratic } from './solve-quadratic';

/**
 * 3차 방정식 ax³ + bx² + cx + d = 0의 실수 근을 반환한다.
 *
 * Cardano 공식 기반으로 구한 뒤 근삼분 정렬해 반환한다. 중복근은 eps tolerance로 판정한다.
 * 근이 없으면 빈 배열을 반환한다. a === 0이면 2차 방정식으로 fallback한다.
 * 모든 계수는 finite number여야 한다.
 *
 * @param a 3차항 계수
 * @param b 2차항 계수
 * @param c 1차항 계수
 * @param d 상수항
 * @param eps 중복근 판정 tolerance. 기본값 1e-9
 */
export function solveCubic(a: number, b: number, c: number, d: number, eps = 1e-9): number[] {
  assertFiniteNumbers([a, b, c, d]);

  if (a === 0) return solveQuadratic(b, c, d, eps);

  // Cardano 공식 — depressed cubic t³ + pt + q = 0으로 치환
  const A = b / a;
  const B = c / a;
  const C = d / a;

  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;

  const discriminant = (q / 2) ** 2 + (p / 3) ** 3;
  const discriminantEps = eps * eps;

  const shift = -A / 3;

  let roots: number[];

  if (discriminant > discriminantEps) {
    // 실수 근 1개
    const sqrtD = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtD);
    const v = Math.cbrt(-q / 2 - sqrtD);
    roots = [u + v + shift];
  } else if (discriminant < -discriminantEps) {
    // 실수 근 3개 — trigonometric method
    const r = Math.sqrt((-(p / 3)) ** 3);
    const theta = Math.acos(Math.max(-1, Math.min(1, -q / 2 / r)));
    const m = 2 * Math.cbrt(r);
    roots = [
      m * Math.cos(theta / 3) + shift,
      m * Math.cos((theta + 2 * Math.PI) / 3) + shift,
      m * Math.cos((theta + 4 * Math.PI) / 3) + shift,
    ].sort((x, y) => x - y);
  } else {
    // 중복근 (discriminant ≈ 0)
    const u = Math.cbrt(-q / 2);
    const r1 = 2 * u + shift;
    const r2 = -u + shift;
    if (Math.abs(r1 - r2) <= eps) {
      roots = [r1];
    } else {
      roots = [r1, r2].sort((x, y) => x - y);
    }
  }

  // 중복근 eps 판정으로 deduplicate
  return roots.reduce<number[]>((acc, r) => {
    if (acc.length === 0 || Math.abs(r - (acc[acc.length - 1] as number)) > eps) {
      acc.push(r);
    }
    return acc;
  }, []);
}
