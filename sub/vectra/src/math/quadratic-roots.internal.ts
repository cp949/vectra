/**
 * 판별식을 계수 scale(b² + |4ac|)로 정규화한 값이 이 이하이면 0으로 보는 기본 상대 tolerance.
 *
 * double 판별식 계산의 상쇄 오차(약 1e-16)보다 충분히 크고, 서로 다른 두 근으로 구분해야 하는
 * 근 간격(상대 약 1e-6)보다 충분히 작다.
 */
export const QUADRATIC_REL_EPS = 1e-12;

/**
 * 판별식 제곱근 `sqrtD`가 주어진 2차 방정식의 두 실근을 상쇄 없이 구해 오름차순으로 out에 push한다.
 *
 * `a !== 0`이고 `sqrtD > 0`이어야 한다. 이 경우 `q = -0.5·(b + sign(b)·sqrtD)`는 0이 아니다.
 * `b === 0`이면 부호를 +로 보고 `q = -0.5·sqrtD`를 쓴다.
 * 근은 `q/a`, `c/q`다. `-b ± sqrtD` 중 크기가 비슷한 두 항을 빼지 않아 상쇄가 없다.
 */
export function pushStableRoots(out: number[], a: number, b: number, c: number, sqrtD: number): void {
  const q = -0.5 * (b < 0 ? b - sqrtD : b + sqrtD);
  // `+ 0`은 -0을 +0으로 바꾼다. c === 0이면 근 0의 부호가 계수 부호에 따라 갈리지 않게 한다.
  const r1 = q / a + 0;
  const r2 = c / q + 0;
  if (r1 <= r2) {
    out.push(r1, r2);
  } else {
    out.push(r2, r1);
  }
}

/**
 * 2차 방정식 `a x² + b x + c = 0`의 실수 근을 오름차순 새 배열로 반환한다.
 *
 * 근 개수는 0, 1, 2개다. 1개는 중복근 또는 선형 해이다.
 * 계수 전체를 같은 비율로 키우거나 줄여도 근이 같다. 절대 tolerance를 쓰지 않는다.
 *
 * - `a === 0`: 선형 `b x + c = 0`. `b === 0`이면 근이 없다.
 * - `|D| <= relEps·(b² + |4ac|)`: 중복근 `-b / (2a)` 하나. `D = b² - 4ac`
 * - `D < 0`: 근이 없다.
 * - 그 외: 두 근. {@link pushStableRoots}와 같은 안정 공식으로 구한다.
 *
 * 배열 리터럴로 반환한다. 빈 배열에 push하면 백킹 스토어 할당이 커서 느리다.
 *
 * @param relEps 중복근 판정 상대 tolerance. 기본값 {@link QUADRATIC_REL_EPS}
 */
export function quadraticRoots(a: number, b: number, c: number, relEps: number = QUADRATIC_REL_EPS): number[] {
  if (a === 0) {
    return b === 0 ? [] : [-c / b + 0];
  }

  const bb = b * b;
  const ac4 = 4 * a * c;
  const discriminant = bb - ac4;

  if (Math.abs(discriminant) <= relEps * (bb + Math.abs(ac4))) {
    return [-b / (2 * a) + 0];
  }
  if (discriminant < 0) return [];

  const sqrtD = Math.sqrt(discriminant);
  const q = -0.5 * (b < 0 ? b - sqrtD : b + sqrtD);
  const r1 = q / a + 0;
  const r2 = c / q + 0;
  return r1 <= r2 ? [r1, r2] : [r2, r1];
}

/**
 * {@link quadraticRoots}와 같은 근 중 단위 구간에 속하는 것만 오름차순으로 out에 push한다.
 *
 * closedUnit=true이면 [0,1] closed interval, false이면 (0,1) open interval이다.
 * 중간 배열을 만들지 않는다. curve extrema 같은 hot path에서 쓴다.
 * 판정은 {@link quadraticRoots}를 그대로 따라야 한다. 한쪽을 고치면 다른 쪽도 고친다.
 */
export function quadraticRootsInUnitInto(out: number[], a: number, b: number, c: number, closedUnit: boolean): void {
  if (a === 0) {
    if (b === 0) return;
    const t = -c / b + 0;
    if (closedUnit ? t >= 0 && t <= 1 : t > 0 && t < 1) out.push(t);
    return;
  }

  const bb = b * b;
  const ac4 = 4 * a * c;
  const discriminant = bb - ac4;

  if (Math.abs(discriminant) <= QUADRATIC_REL_EPS * (bb + Math.abs(ac4))) {
    const t = -b / (2 * a) + 0;
    if (closedUnit ? t >= 0 && t <= 1 : t > 0 && t < 1) out.push(t);
    return;
  }
  if (discriminant < 0) return;

  const sqrtD = Math.sqrt(discriminant);
  const q = -0.5 * (b < 0 ? b - sqrtD : b + sqrtD);
  const r1 = q / a + 0;
  const r2 = c / q + 0;
  const lo = r1 <= r2 ? r1 : r2;
  const hi = r1 <= r2 ? r2 : r1;
  if (closedUnit ? lo >= 0 && lo <= 1 : lo > 0 && lo < 1) out.push(lo);
  if (closedUnit ? hi >= 0 && hi <= 1 : hi > 0 && hi < 1) out.push(hi);
}
