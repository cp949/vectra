import { assertFiniteNumbers } from './range.internal';
import { solveQuadratic } from './solve-quadratic';

/**
 * eps를 생략했을 때 쓰는 상대 tolerance.
 * - 판별식 0 판정: `|D| <= CUBIC_REL_EPS·((q/2)² + |p/3|³)`
 * - 근 dedupe: `|Δr| <= CUBIC_REL_EPS·rootScale`
 * 판별식은 근 간격의 6제곱 크기라 절대값과 비교하면 붙은 근을 중근으로 합친다.
 */
const CUBIC_REL_EPS = 1e-12;

/**
 * 3차 방정식 ax³ + bx² + cx + d = 0의 실수 근을 반환한다.
 *
 * Cardano 공식 기반으로 구한 뒤 근삼분 정렬해 반환한다. 중복근은 단일 원소로 반환한다.
 * a === 0이면 2차 방정식으로 fallback한다. fallback에서 eps를 생략하면 {@link solveQuadratic}의 상대 판정을 쓴다.
 * 모든 계수는 finite number여야 한다.
 *
 * `eps`를 생략하면 3차 경로도 상대 판정을 쓴다. 계수 전체나 근 전체의 scale이 바뀌어도 결과가 같다.
 * - 판별식 `D = (q/2)² + (p/3)³`(monic depressed cubic `t³ + pt + q`)이 `|D| <= 1e-12·((q/2)² + |p/3|³)`이면 중근으로 본다.
 * - 근 dedupe 기준은 `1e-12·rootScale`이다. `rootScale = max(|A|, √|B|, ∛|C|)`이고 A, B, C는 monic 계수 `b/a, c/a, d/a`이다.
 * - 근 간격이 근 크기의 약 1e-6배 이하이면 double 계수 반올림 한계라 구분하지 못한다.
 *
 * `eps`를 명시하면 기존 절대 판정을 쓴다. 판별식은 `eps²`와, 근 dedupe는 `eps`와 비교한다.
 *
 * @param a 3차항 계수
 * @param b 2차항 계수
 * @param c 1차항 계수
 * @param d 상수항
 * @param eps 절대 tolerance. 생략하면 상대 판정(위 설명)을 쓴다.
 */
export function solveCubic(a: number, b: number, c: number, d: number, eps?: number): number[] {
  assertFiniteNumbers([a, b, c, d]);

  if (a === 0) return solveQuadratic(b, c, d, eps);

  // Cardano 공식 — depressed cubic t³ + pt + q = 0으로 치환
  const A = b / a;
  const B = c / a;
  const C = d / a;

  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;

  const halfQSquared = (q / 2) ** 2;
  const p3Cubed = (p / 3) ** 3;
  const discriminant = halfQSquared + p3Cubed;

  let discriminantEps: number;
  let tolerance: number;
  if (eps === undefined) {
    discriminantEps = CUBIC_REL_EPS * (halfQSquared + Math.abs(p3Cubed));
    tolerance = CUBIC_REL_EPS * Math.max(Math.abs(A), Math.sqrt(Math.abs(B)), Math.cbrt(Math.abs(C)));
  } else {
    discriminantEps = eps * eps;
    tolerance = eps;
  }

  const shift = -A / 3;

  let roots: number[];

  if (discriminant > discriminantEps) {
    // 실수 근 1개
    const sqrtD = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtD);
    const v = Math.cbrt(-q / 2 - sqrtD);
    roots = [u + v + shift];
  } else if (discriminant < -discriminantEps) {
    // 실수 근 3개 — trigonometric method. D < 0이면 (p/3)³ < 0이라 r > 0이다
    const r = Math.sqrt(-p3Cubed);
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
    if (Math.abs(r1 - r2) <= tolerance) {
      roots = [r1];
    } else {
      roots = [r1, r2].sort((x, y) => x - y);
    }
  }

  // 중복근 eps 판정으로 deduplicate
  return roots.reduce<number[]>((acc, r) => {
    if (acc.length === 0 || Math.abs(r - (acc[acc.length - 1] as number)) > tolerance) {
      acc.push(r);
    }
    return acc;
  }, []);
}
