/**
 * power-basis 다항식 helper.
 *
 * 계수 배열 `coeffs[i]`는 `t^i`의 계수다 (낮은 차수 → 높은 차수). Bezier × ellipse boundary
 * 판정에서 implicit residual `f(t)`의 root와 closed interval 최솟값을 구하는 데 쓴다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

// 선행(최고차) 계수를 degenerate로 간주해 차수를 낮출 때 쓰는 상대 임계값.
const TRIM_EPS = 1e-12;

// 같은 root로 묶을 parameter 간격.
const ROOT_DEDUPE_T = 1e-9;

// bisection 반복 횟수. double 정밀도 수렴에 충분하다.
const BISECTION_ITERATIONS = 60;

/**
 * Horner 방식으로 `p(t)`를 계산한다.
 *
 * @param coeffs power-basis 계수 (낮은 차수 → 높은 차수)
 * @param t 평가 parameter
 */
export function evaluatePolynomial(coeffs: readonly number[], t: number): number {
  let value = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    value = value * t + coeffs[i];
  }
  return value;
}

/**
 * `p'(t)`의 power-basis 계수를 반환한다. 상수 다항식이면 빈 배열이다.
 *
 * @param coeffs power-basis 계수 (낮은 차수 → 높은 차수)
 */
export function differentiatePolynomial(coeffs: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < coeffs.length; i++) {
    out.push(i * coeffs[i]);
  }
  return out;
}

/**
 * 두 다항식의 곱 계수를 반환한다.
 *
 * @param a 첫 번째 다항식 power-basis 계수
 * @param b 두 번째 다항식 power-basis 계수
 */
export function multiplyPolynomials(a: readonly number[], b: readonly number[]): number[] {
  if (a.length === 0 || b.length === 0) return [];
  const out = new Array<number>(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] += a[i] * b[j];
    }
  }
  return out;
}

/**
 * 선행 0 계수를 제거한 유효 최고차(degree)를 반환한다.
 *
 * 계수 절댓값의 최댓값을 scale로 삼아 상대 임계값(`TRIM_EPS`)으로 판정한다. degenerate
 * Bezier(고차항이 사라지는 경우)에서 가짜 고차 root를 만들지 않으려고 차수를 낮춘다.
 */
function effectiveDegree(coeffs: readonly number[]): number {
  let scale = 0;
  for (const c of coeffs) {
    const abs = Math.abs(c);
    if (abs > scale) scale = abs;
  }
  const threshold = TRIM_EPS * Math.max(1, scale);
  let degree = coeffs.length - 1;
  while (degree > 0 && Math.abs(coeffs[degree]) <= threshold) {
    degree--;
  }
  return degree;
}

/**
 * monotonic 구간 `[a, b]`에서 부호가 바뀌는 root를 bisection으로 찾는다.
 *
 * 호출자가 `fa`와 `fb`의 부호가 다름을 보장한다.
 */
function bisectRoot(coeffs: readonly number[], a: number, b: number, fa: number): number {
  let lo = a;
  let hi = b;
  let flo = fa;
  for (let i = 0; i < BISECTION_ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const fmid = evaluatePolynomial(coeffs, mid);
    if (fmid === 0) return mid;
    if (flo < 0 === fmid < 0) {
      lo = mid;
      flo = fmid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * `[0, 1]` closed interval 안의 실근을 오름차순으로 반환한다.
 *
 * 차수별 처리:
 * - 상수: 빈 배열.
 * - 1차: 선형 root.
 * - 2차: 판별식 기반 root.
 * - 3차 이상: 도함수 root로 monotonic 구간을 나눈 뒤 부호 변화 구간에서 bisection.
 *
 * 도함수 root는 재귀로 구한다. 인접 임계점 사이에서는 다항식이 monotonic이므로 부호가 바뀌면
 * 정확히 하나의 root가 있다. 접점(중근)은 부호 변화를 만들지 않으므로 누락될 수 있고, root
 * isolation이 아니라 최솟값 판정(`minOnClosedUnit`)의 보조로 쓰는 것을 전제한다.
 *
 * @param coeffs power-basis 계수 (낮은 차수 → 높은 차수)
 */
export function realRootsInClosedUnit(coeffs: readonly number[]): number[] {
  const degree = effectiveDegree(coeffs);
  if (degree <= 0) return [];

  if (degree === 1) {
    const root = -coeffs[0] / coeffs[1];
    return root >= 0 && root <= 1 ? [root] : [];
  }

  if (degree === 2) {
    const a = coeffs[2];
    const b = coeffs[1];
    const c = coeffs[0];
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    const sqrtDisc = Math.sqrt(disc);
    const candidates = [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)];
    const out: number[] = [];
    for (const r of candidates) {
      if (r >= 0 && r <= 1) out.push(r);
    }
    return out.sort((x, y) => x - y);
  }

  // 3차 이상: 도함수 임계점으로 monotonic 구간 분할
  const trimmed = coeffs.slice(0, degree + 1);
  const critical = realRootsInClosedUnit(differentiatePolynomial(trimmed));
  const breaks = [0, ...critical, 1].sort((a, b) => a - b);

  const roots: number[] = [];
  const pushRoot = (r: number): void => {
    if (!roots.some((x) => Math.abs(x - r) <= ROOT_DEDUPE_T)) roots.push(r);
  };

  for (let i = 0; i < breaks.length - 1; i++) {
    const a = breaks[i];
    const b = breaks[i + 1];
    if (b - a <= ROOT_DEDUPE_T) continue;
    const fa = evaluatePolynomial(trimmed, a);
    const fb = evaluatePolynomial(trimmed, b);
    if (fa === 0) pushRoot(a);
    if (fb === 0) pushRoot(b);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
      pushRoot(bisectRoot(trimmed, a, b, fa));
    }
  }

  return roots.sort((x, y) => x - y);
}

/**
 * `[0, 1]` closed interval에서 `p(t)`의 최솟값을 반환한다.
 *
 * 최솟값은 양 끝점 또는 도함수 root(임계점)에서 나온다.
 *
 * @param coeffs power-basis 계수 (낮은 차수 → 높은 차수)
 */
export function minOnClosedUnit(coeffs: readonly number[]): number {
  const critical = realRootsInClosedUnit(differentiatePolynomial(coeffs));
  let min = Math.min(evaluatePolynomial(coeffs, 0), evaluatePolynomial(coeffs, 1));
  for (const t of critical) {
    const value = evaluatePolynomial(coeffs, t);
    if (value < min) min = value;
  }
  return min;
}
