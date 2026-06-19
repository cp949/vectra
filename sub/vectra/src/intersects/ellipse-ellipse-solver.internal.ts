/**
 * 4차 방정식 `c4 x⁴ + c3 x³ + c2 x² + c1 x + c0 = 0`의 실수 근을 반환한다.
 *
 * Ferrari 방법으로 depressed quartic을 풀고, 정렬·중복 제거 없이 raw root 배열을 돌려준다.
 * leading coeff가 0에 수렴하면 3차/2차/1차로 단계적으로 downgrade한다
 * (`solveCubic`/`solveQuadratic`의 degenerate downgrade 패턴).
 * 모든 계수는 finite라고 가정한다(호출 전 검증).
 *
 * @param eps leading coeff downgrade와 중근 판정 tolerance
 */
export function solveQuarticReal(c4: number, c3: number, c2: number, c1: number, c0: number, eps: number): number[] {
  // leading coeff가 0에 수렴하면 저차 방정식으로 downgrade
  if (Math.abs(c4) <= eps) {
    return solveCubicReal(c3, c2, c1, c0, eps);
  }

  // monic으로 정규화: x⁴ + a x³ + b x² + c x + d = 0
  const a = c3 / c4;
  const b = c2 / c4;
  const c = c1 / c4;
  const d = c0 / c4;

  // depressed quartic으로 치환 x = y - a/4: y⁴ + p y² + q y + r = 0
  const a2 = a * a;
  const p = b - (3 * a2) / 8;
  const q = c - (a * b) / 2 + (a2 * a) / 8;
  const r = d - (a * c) / 4 + (a2 * b) / 16 - (3 * a2 * a2) / 256;
  const shift = -a / 4;

  const roots: number[] = [];

  if (Math.abs(q) <= eps) {
    // biquadratic y⁴ + p y² + r = 0 — q ≈ 0일 때 z = y²에 대한 2차식
    const zRoots = solveQuadraticReal(1, p, r, eps);
    for (const z of zRoots) {
      if (z > eps) {
        const s = Math.sqrt(z);
        roots.push(s + shift, -s + shift);
      } else if (z > -eps) {
        roots.push(shift);
      }
    }
    return roots;
  }

  // resolvent cubic z³ + 2p z² + (p² - 4r) z - q² = 0의 양수 근 z를 찾는다.
  // q ≠ 0 분기이므로 이 cubic은 z=0에서 -q² < 0, z→∞에서 +∞이라 IVT로 양수근이
  // 항상 존재한다. 따라서 아래 z 선택은 양수 근을 반드시 찾는다.
  const resolvent = solveCubicReal(1, 2 * p, p * p - 4 * r, -q * q, eps);
  let z = 0;
  for (const candidate of resolvent) {
    if (candidate > z) z = candidate;
  }
  if (z <= eps) {
    // 도달 불가 가드: q ≠ 0이면 위 IVT로 양수근이 보장된다. 여기에 도달하면 수치 실패이며,
    // 이 경로는 실제 biquadratic 케이스(q ≈ 0)가 아니므로 안전하게 빈 근으로 처리한다.
    return roots;
  }

  const sqrtZ = Math.sqrt(z);
  // y⁴ + p y² + q y + r = (y² + sqrtZ·y + (p/2 + z/2 - q/(2·sqrtZ)))·(y² - sqrtZ·y + (p/2 + z/2 + q/(2·sqrtZ)))
  const half = p / 2 + z / 2;
  const t1 = half - q / (2 * sqrtZ);
  const t2 = half + q / (2 * sqrtZ);

  for (const y of solveQuadraticReal(1, sqrtZ, t1, eps)) roots.push(y + shift);
  for (const y of solveQuadraticReal(1, -sqrtZ, t2, eps)) roots.push(y + shift);

  return roots;
}

/**
 * 3차 방정식 `a x³ + b x² + c x + d = 0`의 실수 근을 반환한다.
 *
 * `a ≈ 0`이면 2차로 downgrade한다. 정렬·중복 제거는 호출자가 한다.
 */
export function solveCubicReal(a: number, b: number, c: number, d: number, eps: number): number[] {
  if (Math.abs(a) <= eps) return solveQuadraticReal(b, c, d, eps);

  const A = b / a;
  const B = c / a;
  const C = d / a;

  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;
  const shift = -A / 3;

  const discriminant = (q / 2) ** 2 + (p / 3) ** 3;
  const discEps = eps * eps;

  if (discriminant > discEps) {
    const sqrtD = Math.sqrt(discriminant);
    const u = Math.cbrt(-q / 2 + sqrtD);
    const v = Math.cbrt(-q / 2 - sqrtD);
    return [u + v + shift];
  }
  if (discriminant < -discEps) {
    const rr = Math.sqrt((-(p / 3)) ** 3);
    const theta = Math.acos(Math.max(-1, Math.min(1, -q / 2 / rr)));
    const m = 2 * Math.cbrt(rr);
    return [
      m * Math.cos(theta / 3) + shift,
      m * Math.cos((theta + 2 * Math.PI) / 3) + shift,
      m * Math.cos((theta + 4 * Math.PI) / 3) + shift,
    ];
  }
  // 중복근
  const u = Math.cbrt(-q / 2);
  return [2 * u + shift, -u + shift];
}

/**
 * 2차 방정식 `a x² + b x + c = 0`의 실수 근을 반환한다.
 *
 * `a ≈ 0`이면 1차로 downgrade한다. discriminant가 `-eps` 미만이면 근 없음.
 */
export function solveQuadraticReal(a: number, b: number, c: number, eps: number): number[] {
  if (Math.abs(a) <= eps) {
    if (Math.abs(b) <= eps) return [];
    return [-c / b];
  }
  const disc = b * b - 4 * a * c;
  if (disc < -eps) return [];
  if (disc <= eps) return [-b / (2 * a)];
  const sqrtD = Math.sqrt(disc);
  return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)];
}
