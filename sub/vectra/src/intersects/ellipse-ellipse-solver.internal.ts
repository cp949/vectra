// 단조 구간 root 탐색의 최대 반복. bisection만으로도 double 분해능에 닿는 횟수다.
const MAX_ROOT_ITERATIONS = 64;

/**
 * `f(x) = B·u(x)² + E·u(x) + D·(A·x² - 1)`, `u(x) = P x² + Q x + R`의 계수다.
 *
 * ellipse 교차의 x 소거식이 이 형태다. 단항식 계수로 전개하지 않고 이 형태로 값을 계산한다.
 * ellipse가 납작하면 `B·u²`의 전개 계수가 1e20 규모가 되고 `D` 항은 1e2 규모라, 전개하면 `D` 항이 반올림에 묻힌다.
 * `u`는 그대로 계산해도 상쇄 오차가 `P x²`, `Q x`, `R` 크기의 double 분해능에 머문다.
 */
export interface ConicQuartic {
  readonly P: number;
  readonly Q: number;
  readonly R: number;
  readonly B: number;
  readonly E: number;
  readonly D: number;
  readonly A: number;
}

/**
 * {@link ConicQuartic} `f`의 `[lo, hi]` 안 근 후보를 push한다.
 *
 * 도함수로 단조 구간을 나눠 푼다. 계수로 나누지 않아 최고차 계수가 0에 가까워도 근을 잃지 않는다.
 * - 2차 도함수의 근(변곡점)으로 1차 도함수를 단조 구간으로 나눈다.
 * - 각 구간에서 1차 도함수의 근(임계점)을 구한다.
 * - 임계점으로 나눈 각 단조 구간에서 부호가 바뀌면 근을 구한다.
 * - 이웃 두 구간 모두 근이 없는 임계점은 `tangentOut`에 push한다. 부호를 바꾸지 않는 중근(접점) 후보다.
 *   이웃 구간에 근이 있는 임계점은 두 근 사이 꼭짓점이라 넣지 않는다.
 *
 * 후보는 근사값이다. 호출자가 다듬고 검증한다. 정렬·중복 제거는 하지 않는다.
 *
 * @param out 부호 변화로 찾은 근을 push할 배열
 * @param tangentOut 근이 없는 이웃 구간 사이의 임계점을 push할 배열
 * @param f 근을 구할 식
 * @param lo 탐색 구간 하한
 * @param hi 탐색 구간 상한. `lo < hi`
 */
export function pushConicQuarticRootCandidates(
  out: number[],
  tangentOut: number[],
  f: ConicQuartic,
  lo: number,
  hi: number
): void {
  // 변곡점: f'' = 12 B P² x² + 12 B P Q x + f''(0) = 0의 (lo, hi) 안 근을 오름차순으로 s1 ≤ s2에 둔다.
  let s1 = Number.NaN;
  let s2 = Number.NaN;
  const qa = 12 * f.B * f.P * f.P;
  const qb = 12 * f.B * f.P * f.Q;
  const qc = evaluate(f, 2, 0);
  const disc = qb * qb - 4 * qa * qc;
  if (disc >= 0 && (qa !== 0 || qb !== 0)) {
    const q = -0.5 * (qb < 0 ? qb - Math.sqrt(disc) : qb + Math.sqrt(disc));
    // q === 0이면 qb === 0, disc === 0이라 qa ≠ 0이고 중근은 0이다.
    const r1 = q === 0 ? 0 : q / qa;
    const r2 = q === 0 ? 0 : qc / q;
    const first = r1 <= r2 ? r1 : r2;
    const second = r1 <= r2 ? r2 : r1;
    if (first > lo && first < hi) s1 = first;
    if (second > lo && second < hi && second !== first) {
      if (Number.isNaN(s1)) s1 = second;
      else s2 = second;
    }
  }

  // 임계점: 1차 도함수의 단조 구간 [lo, s1, s2, hi]에서 부호가 바뀌는 곳을 찾는다. 최대 3개다.
  let k1 = Number.NaN;
  let k2 = Number.NaN;
  let k3 = Number.NaN;
  let count = 0;
  let a = lo;
  let fa = evaluate(f, 1, a);
  for (let i = 0; i < 3; i++) {
    const b = i === 0 ? (Number.isNaN(s1) ? hi : s1) : i === 1 ? (Number.isNaN(s2) ? hi : s2) : hi;
    if (b <= a) continue;
    const fb = evaluate(f, 1, b);
    // 변곡점에서 1차 도함수가 정확히 0이면 그 변곡점이 임계점이다(예: x⁴ - 1의 x = 0). 끝점 hi는 이미 구간 경계다.
    const atBreak = fb === 0 && b < hi;
    if (atBreak || (fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
      const k = atBreak ? b : monotoneRoot(f, 1, a, b, fa);
      if (count === 0) k1 = k;
      else if (count === 1) k2 = k;
      else k3 = k;
      count++;
    }
    a = b;
    fa = fb;
  }

  // 근: 단조 구간 [lo, k1, k2, k3, hi]에서 부호가 바뀌는 곳을 찾는다.
  // 구간 i의 근 존재 여부를 비트 i에 기록해 임계점 시드 판정에 쓴다.
  let rootMask = 0;
  a = lo;
  fa = evaluate(f, 0, a);
  for (let i = 0; i <= count; i++) {
    const b = i === count ? hi : i === 0 ? k1 : i === 1 ? k2 : k3;
    const fb = evaluate(f, 0, b);
    // 값이 정확히 0인 경계는 한 번만 낸다. 구간 끝 b에서 내고, 시작 a는 lo일 때만 낸다.
    if (fa === 0 && a === lo) {
      out.push(a);
      rootMask |= 1 << i;
    }
    if (fb === 0) {
      out.push(b);
      rootMask |= 1 << i;
    } else if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
      out.push(monotoneRoot(f, 0, a, b, fa));
      rootMask |= 1 << i;
    }
    a = b;
    fa = fb;
  }

  // 임계점 i는 구간 i와 i+1 사이에 있다.
  for (let i = 0; i < count; i++) {
    if ((rootMask & (3 << i)) !== 0) continue;
    tangentOut.push(i === 0 ? k1 : i === 1 ? k2 : k3);
  }
}

/** `f`의 `order`차 도함수 값을 구한다. `order`는 0, 1, 2다. */
function evaluate(f: ConicQuartic, order: number, x: number): number {
  const u = (f.P * x + f.Q) * x + f.R;
  if (order === 0) return (f.B * u + f.E) * u + f.D * (f.A * x * x - 1);
  const du = 2 * f.P * x + f.Q;
  if (order === 1) return (2 * f.B * u + f.E) * du + 2 * f.D * f.A * x;
  return 2 * f.B * du * du + (2 * f.B * u + f.E) * 2 * f.P + 2 * f.D * f.A;
}

/**
 * 단조 구간 `[a, b]`에서 부호가 바뀌는 `f`의 `order`차 도함수의 근을 구한다.
 *
 * 호출자가 양 끝 값의 부호가 다름을 보장한다. Newton step이 bracket을 벗어나면 bisection으로 바꾼다.
 * 단조 구간이라 bracket 안의 근은 하나다.
 */
function monotoneRoot(f: ConicQuartic, order: number, a: number, b: number, fa: number): number {
  let lo = a;
  let hi = b;
  const loNegative = fa < 0;
  const tol = Number.EPSILON * Math.max(Math.abs(a), Math.abs(b));
  let x = 0.5 * (lo + hi);
  for (let i = 0; i < MAX_ROOT_ITERATIONS; i++) {
    const fx = evaluate(f, order, x);
    if (fx === 0) break;
    if (fx < 0 === loNegative) lo = x;
    else hi = x;
    let next = x - fx / evaluate(f, order + 1, x);
    if (!(next > lo && next < hi)) next = 0.5 * (lo + hi);
    const step = Math.abs(next - x);
    x = next;
    if (step <= tol) break;
  }
  return x;
}
