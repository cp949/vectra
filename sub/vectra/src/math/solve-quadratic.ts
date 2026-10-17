import { pushStableRoots, quadraticRoots } from './quadratic-roots.internal';
import { assertFiniteNumbers } from './range.internal';
import { solveLinear } from './solve-linear';

/**
 * 2차 방정식 ax² + bx + c = 0의 실수 근을 반환한다.
 *
 * 근이 없으면 빈 배열을 반환한다. 중복근은 단일 원소 배열로 반환한다.
 * a === 0이면 선형 방정식으로 fallback한다(선형 해가 NaN이면 빈 배열 반환).
 * 두 근은 `q = -0.5·(b + sign(b)·√D)`로 `q/a`, `c/q`를 구해 상쇄 없이 계산한다. `D = b² - 4ac`
 * 모든 계수는 finite number여야 한다. 근 0은 `-0`이 아니라 `+0`으로 반환한다.
 *
 * `eps`를 생략하면 계수 scale 기준 상대 판정을 쓴다.
 * `|D| <= 1e-12·(b² + |4ac|)`이면 중복근으로 본다. 계수 전체를 같은 비율로 바꿔도 결과가 같다.
 * `eps`를 명시하면 기존 절대 판정을 쓴다. `D < -eps`이면 근 없음, `|D| <= eps`이면 중복근이다.
 *
 * @param a 2차항 계수
 * @param b 1차항 계수
 * @param c 상수항
 * @param eps 판별식 절대 tolerance. 생략하면 상대 판정(위 설명)을 쓴다.
 */
export function solveQuadratic(a: number, b: number, c: number, eps?: number): number[] {
  assertFiniteNumbers([a, b, c]);

  if (a === 0) {
    const r = solveLinear(b, c);
    return Number.isFinite(r) ? [r] : [];
  }

  if (eps === undefined) return quadraticRoots(a, b, c);

  const roots: number[] = [];
  const discriminant = b * b - 4 * a * c;

  if (discriminant < -eps) return roots;

  if (discriminant <= eps) {
    // `+ 0`은 -0을 +0으로 바꾼다.
    roots.push(-b / (2 * a) + 0);
    return roots;
  }

  pushStableRoots(roots, a, b, c, Math.sqrt(discriminant));
  return roots;
}
