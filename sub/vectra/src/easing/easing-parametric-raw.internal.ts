/**
 * easing parametric raw 계산식.
 *
 * back / elastic / bezierScalar / cubicBezier 계열의 validation 없는 raw 수식을 모은다.
 */

// ─── back raw ─────────────────────────────────────────────────────────────────

/** back ease-in 계산. s = overshoot. validation 없이 계산만 수행한다. */
export function backInRaw(t: number, s: number): number {
  return t * t * ((s + 1) * t - s);
}

/** back ease-out 계산. s = overshoot. validation 없이 계산만 수행한다. */
export function backOutRaw(t: number, s: number): number {
  const u = t - 1;
  return u * u * ((s + 1) * u + s) + 1;
}

/** back ease-in-out 계산. s = overshoot. validation 없이 계산만 수행한다. */
export function backInOutRaw(t: number, s: number): number {
  const sc = s * 1.525;
  if (t < 0.5) {
    const u = 2 * t;
    return (u * u * ((sc + 1) * u - sc)) / 2;
  }
  const u = 2 * t - 2;
  return (u * u * ((sc + 1) * u + sc) + 2) / 2;
}

// ─── bezier scalar raw ────────────────────────────────────────────────────────

/**
 * De Casteljau 알고리즘으로 scalar Bezier 값을 계산한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 t가 finite임을, pts가 길이 >= 1이고
 * 모든 원소가 finite임을 호출자가 보장해야 한다.
 * 전달된 배열의 원소를 직접 수정한다 (in-place 계산). 복사 여부는 호출자 책임이다.
 */
export function bezierScalarRaw(t: number, pts: number[]): number {
  for (let r = 1; r < pts.length; r++) {
    for (let i = 0; i < pts.length - r; i++) {
      pts[i] = (1 - t) * pts[i] + t * pts[i + 1];
    }
  }
  return pts[0];
}

// ─── cubic Bezier raw ─────────────────────────────────────────────────────────

/**
 * CSS cubic-bezier(x1, y1, x2, y2) 수식으로 y easing 값을 계산한다.
 *
 * 제어점 P0=(0,0), P1=(x1,y1), P2=(x2,y2), P3=(1,1).
 * t에 대응하는 x curve의 parameter를 Newton iteration + bisection fallback으로 구한 뒤
 * 그 parameter로 y curve 값을 반환한다.
 * validation 없이 계산만 수행한다. 호출 전 모든 인자가 유효함을 호출자가 보장해야 한다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1.
 */
export function cubicBezierRaw(t: number, x1: number, y1: number, x2: number, y2: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;

  // x(u) = ax*u^3 + bx*u^2 + cx*u 계수
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  // y(u) = ay*u^3 + by*u^2 + cy*u 계수
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  // x curve 값
  function sampleCurveX(u: number): number {
    return ((ax * u + bx) * u + cx) * u;
  }

  // x curve 미분값
  function sampleCurveDerivativeX(u: number): number {
    return (3 * ax * u + 2 * bx) * u + cx;
  }

  // y curve 값
  function sampleCurveY(u: number): number {
    return ((ay * u + by) * u + cy) * u;
  }

  // Newton iteration으로 x(u) = t를 만족하는 u를 구한다
  let u = t;
  for (let i = 0; i < 8; i++) {
    const dx = sampleCurveX(u) - t;
    if (Math.abs(dx) < 1e-7) break;
    const d = sampleCurveDerivativeX(u);
    if (Math.abs(d) < 1e-9) break;
    u -= dx / d;
  }

  // Newton이 수렴하지 않으면 bisection fallback
  const xAtU = sampleCurveX(u);
  if (Math.abs(xAtU - t) > 1e-4) {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      const xMid = sampleCurveX(mid);
      u = mid;
      if (Math.abs(xMid - t) < 1e-7) break;
      if (xMid < t) lo = mid;
      else hi = mid;
    }
  }

  return sampleCurveY(u);
}

// ─── elastic raw ──────────────────────────────────────────────────────────────

/** elastic ease-in 계산. validation 없이 계산만 수행한다. */
export function elasticInRaw(t: number, amplitude: number, period: number): number {
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
  return -(amplitude * 2 ** (10 * (t - 1)) * Math.sin(((t - 1 - s) * (2 * Math.PI)) / period));
}

/** elastic ease-out 계산. validation 없이 계산만 수행한다. */
export function elasticOutRaw(t: number, amplitude: number, period: number): number {
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude);
  return amplitude * 2 ** (-10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
}

/** elastic ease-in-out 계산. inOut period = period * 1.5. validation 없이 계산만 수행한다. */
export function elasticInOutRaw(t: number, amplitude: number, period: number): number {
  const p = period * 1.5;
  const s = (p / (2 * Math.PI)) * Math.asin(1 / amplitude);
  if (t < 0.5) {
    return -(amplitude * 2 ** (10 * (2 * t - 1) - 1) * Math.sin(((2 * t - 1 - s) * (2 * Math.PI)) / p));
  }
  return (amplitude * 2 ** (-10 * (2 * t - 1)) * Math.sin(((2 * t - 1 - s) * (2 * Math.PI)) / p)) / 2 + 1;
}
