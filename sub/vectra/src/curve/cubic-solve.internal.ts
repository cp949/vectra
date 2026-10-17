import { quadraticRootsInUnitInto } from '../math/quadratic-roots.internal';

/**
 * quadratic 방정식 at² + bt + c = 0의 실근을 out에 push한다.
 * closedUnit=true이면 [0,1] closed interval, false이면 (0,1) open interval로 한정한다.
 * a === 0이면 linear 방정식으로 처리한다. 중복근 판정은 계수 scale 기준 상대값이다.
 */
export function solveQuadratic(out: number[], a: number, b: number, c: number, closedUnit = false): void {
  quadraticRootsInUnitInto(out, a, b, c, closedUnit);
}

/** 3차항 무시 상대 tolerance. `|a| <= CUBIC_REL_EPS·max(|b|, |c|, |d|)` */
const CUBIC_REL_EPS = 1e-12;

/**
 * 판별식 0 판정에서 p, q의 반올림 잡음에 곱하는 안전 계수. 공개 `solveCubic`(eps 생략)과 같은 판정이다.
 * - 판별식은 근 간격의 6제곱 크기라 절대값과 비교하면 붙은 근을 중근으로 합친다.
 * - 판별식 값에 대한 상대 임계는 근 크기가 간격보다 크면 잡음보다 작아 중근(접점)을 놓친다.
 * - 그래서 임계를 p, q 잡음이 판별식에 전파되는 양으로 둔다.
 */
const CUBIC_NOISE_FACTOR = 16;

/** [0, 1] 경계 근을 받아 주는 parameter tolerance. 정규화 parameter 축 값이라 계수 scale과 무관하다. */
const UNIT_PARAM_EPS = 1e-12;

/**
 * cubic 방정식 at³ + bt² + ct + d = 0의 실근을 [0,1] closed interval로 한정하여 out에 push한다.
 * Cardano 공식 기반. 수치 안정성을 위해 depressed cubic p·u + q 형태로 변환 후 풀고, 실수 근만 추출한다.
 * [0, 1]에서 at³ 항은 |a| 이하로만 기여한다. 다른 계수 대비 무시할 만큼 작으면 quadratic으로 푼다.
 *
 * 중근 판정은 `|D| <= 16·ε·S²·(|q|·S + p²)`이다. `S = max(|A|, √|B|, ∛|C|)`는 근 크기 scale이다.
 * `|p| <= 16·ε·S²`이면 3중근으로 본다. 판정은 `solveCubic`(eps 생략)과 같아야 한다. 한쪽을 고치면 다른 쪽도 고친다.
 */
export function solveCubicInClosedUnit(out: number[], a: number, b: number, c: number, d: number): void {
  if (Math.abs(a) <= CUBIC_REL_EPS * Math.max(Math.abs(b), Math.abs(c), Math.abs(d))) {
    solveQuadratic(out, b, c, d, true);
    return;
  }

  // monic form: t³ + At² + Bt + C = 0
  const A = b / a;
  const B = c / a;
  const C = d / a;

  // depressed cubic u³ + pu + q = 0 (t = u - A/3)
  // p = B - A²/3, q = 2A³/27 - AB/3 + C
  const A3 = A / 3;
  const p = B - A * A3;
  const q = (2 * A * A * A - 9 * A * B + 27 * C) / 27;

  const halfQ = q / 2;
  const p3Cubed = (p / 3) * (p / 3) * (p / 3);
  const discriminant = halfQ * halfQ + p3Cubed;
  const rootScale = Math.max(Math.abs(A), Math.sqrt(Math.abs(B)), Math.cbrt(Math.abs(C)));
  const noise = CUBIC_NOISE_FACTOR * Number.EPSILON * rootScale * rootScale;
  const discriminantEps = noise * (Math.abs(q) * rootScale + p * p);

  const pushIfInUnit = (t: number): void => {
    if (t >= -UNIT_PARAM_EPS && t <= 1 + UNIT_PARAM_EPS) {
      out.push(Math.max(0, Math.min(1, t)));
    }
  };

  if (discriminant > discriminantEps) {
    // 실근 1개
    const sqrtD = Math.sqrt(discriminant);
    const u = cbrtSigned(-halfQ + sqrtD) + cbrtSigned(-halfQ - sqrtD);
    pushIfInUnit(u - A3);
  } else if (discriminant < -discriminantEps) {
    // 실근 3개 (삼각함수 방법). D < 0이면 (p/3)³ < 0이라 r > 0이다
    const r = Math.sqrt(-p3Cubed);
    const cosTheta = Math.max(-1, Math.min(1, -halfQ / r));
    const theta = Math.acos(cosTheta);
    const twoR13 = 2 * Math.cbrt(r);
    pushIfInUnit(twoR13 * Math.cos(theta / 3) - A3);
    pushIfInUnit(twoR13 * Math.cos((theta + 2 * Math.PI) / 3) - A3);
    pushIfInUnit(twoR13 * Math.cos((theta + 4 * Math.PI) / 3) - A3);
  } else if (Math.abs(p) <= noise) {
    // 3중근. p가 잡음 수준이면 q도 잡음 수준이라 cbrt(-q/2)는 잡음의 세제곱근이다
    pushIfInUnit(-A3);
  } else {
    // 중근 (discriminant ≈ 0)
    const u1 = cbrtSigned(-halfQ);
    pushIfInUnit(2 * u1 - A3);
    pushIfInUnit(-u1 - A3);
  }
}

function cbrtSigned(x: number): number {
  return x < 0 ? -Math.cbrt(-x) : Math.cbrt(x);
}

/**
 * quadratic 방정식 at² + bt + c = 0의 근을 (0, 1) 범위로 한정하여 out에 push한다.
 * a === 0이면 linear 방정식으로 처리한다. 중복근 판정은 계수 scale 기준 상대값이다.
 */
export function solveQuadraticInOpenUnit(out: number[], a: number, b: number, c: number): void {
  quadraticRootsInUnitInto(out, a, b, c, false);
}
