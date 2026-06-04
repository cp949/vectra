/**
 * quadratic 방정식 at² + bt + c = 0의 실근을 out에 push한다.
 * closedUnit=true이면 [0,1] closed interval, false이면 (0,1) open interval로 한정한다.
 * a가 near-zero이면 linear 방정식으로 처리한다.
 */
export function solveQuadratic(out: number[], a: number, b: number, c: number, closedUnit = false): void {
  const EPS = 1e-12;

  if (Math.abs(a) < EPS) {
    if (Math.abs(b) < EPS) return;
    const t = -c / b;
    if (closedUnit ? t >= 0 && t <= 1 : t > 0 && t < 1) out.push(t);
    return;
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return;

  if (discriminant < EPS) {
    const t = -b / (2 * a);
    if (closedUnit ? t >= 0 && t <= 1 : t > 0 && t < 1) out.push(t);
    return;
  }

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);
  if (closedUnit ? t1 >= 0 && t1 <= 1 : t1 > 0 && t1 < 1) out.push(t1);
  if (closedUnit ? t2 >= 0 && t2 <= 1 : t2 > 0 && t2 < 1) out.push(t2);
}

/**
 * cubic 방정식 at³ + bt² + ct + d = 0의 실근을 [0,1] closed interval로 한정하여 out에 push한다.
 * Cardano 공식 기반. a가 near-zero이면 quadratic으로 fallback한다.
 * 수치 안정성을 위해 depressed cubic p·u + q 형태로 변환 후 풀고, 실수 근만 추출한다.
 */
export function solveCubicInClosedUnit(out: number[], a: number, b: number, c: number, d: number): void {
  const EPS = 1e-12;

  if (Math.abs(a) < EPS) {
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
  const discriminant = halfQ * halfQ + (p / 3) * (p / 3) * (p / 3);

  const pushIfInUnit = (t: number): void => {
    if (t >= -EPS && t <= 1 + EPS) {
      out.push(Math.max(0, Math.min(1, t)));
    }
  };

  if (discriminant > EPS) {
    // 실근 1개
    const sqrtD = Math.sqrt(discriminant);
    const u = cbrtSigned(-halfQ + sqrtD) + cbrtSigned(-halfQ - sqrtD);
    pushIfInUnit(u - A3);
  } else if (discriminant < -EPS) {
    // 실근 3개 (삼각함수 방법)
    const r = Math.sqrt(-(p / 3) * (p / 3) * (p / 3));
    if (r < EPS) {
      pushIfInUnit(-A3);
      return;
    }
    const cosTheta = Math.max(-1, Math.min(1, -halfQ / r));
    const theta = Math.acos(cosTheta);
    const twoR13 = 2 * Math.cbrt(r);
    pushIfInUnit(twoR13 * Math.cos(theta / 3) - A3);
    pushIfInUnit(twoR13 * Math.cos((theta + 2 * Math.PI) / 3) - A3);
    pushIfInUnit(twoR13 * Math.cos((theta + 4 * Math.PI) / 3) - A3);
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
 * a가 near-zero이면 linear 방정식으로 처리한다.
 */
export function solveQuadraticInOpenUnit(out: number[], a: number, b: number, c: number): void {
  const EPS = 1e-12;

  if (Math.abs(a) < EPS) {
    // linear: bt + c = 0
    if (Math.abs(b) < EPS) return;
    const t = -c / b;
    if (t > 0 && t < 1) out.push(t);
    return;
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return;

  if (discriminant < EPS) {
    // 중근
    const t = -b / (2 * a);
    if (t > 0 && t < 1) out.push(t);
    return;
  }

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);
  if (t1 > 0 && t1 < 1) out.push(t1);
  if (t2 > 0 && t2 < 1) out.push(t2);
}
