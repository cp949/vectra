/**
 * easing domain 공유 internal helper.
 *
 * public leaf module끼리 domain barrel을 import하지 않으므로
 * 공유 계산과 validation guard를 여기에 모은다.
 */

/**
 * t가 finite number인지 검증한다.
 *
 * NaN과 +/-Infinity를 domain 경계에서 거르기 위한 공통 guard다.
 */
export function assertFiniteT(t: number): void {
  if (!Number.isFinite(t)) {
    throw new RangeError('easing t must be a finite number');
  }
}

/**
 * exponent가 finite positive number(> 0)인지 검증한다.
 *
 * powerIn/Out/InOut에서 사용한다.
 */
export function assertPositiveFiniteExponent(exponent: number): void {
  if (!Number.isFinite(exponent) || exponent <= 0) {
    throw new RangeError('easing exponent must be a finite positive number (> 0)');
  }
}

/**
 * t ** exponent 방식의 ease-in 계산을 수행한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function powerInRaw(t: number, exponent: number): number {
  return t ** exponent;
}

/**
 * 1 - (1 - t) ** exponent 방식의 ease-out 계산을 수행한다.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function powerOutRaw(t: number, exponent: number): number {
  return 1 - (1 - t) ** exponent;
}

/**
 * ease-in-out 계산을 수행한다.
 *
 * t < 0.5이면 (2 * t) ** exponent / 2, t >= 0.5이면 1 - (2 - 2 * t) ** exponent / 2.
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function powerInOutRaw(t: number, exponent: number): number {
  if (t < 0.5) {
    return (2 * t) ** exponent / 2;
  }
  return 1 - (2 - 2 * t) ** exponent / 2;
}

/**
 * back easing의 overshoot이 finite number인지 검증한다.
 *
 * non-finite overshoot은 공식 연산 결과를 예측 불가하게 만들므로 거른다.
 * 음수 overshoot은 anticipation 반전을 위해 허용한다.
 */
export function assertFiniteOvershoot(overshoot: number): void {
  if (!Number.isFinite(overshoot)) {
    throw new RangeError('easing overshoot must be a finite number');
  }
}

/**
 * fn이 callable function인지 검증한다.
 *
 * with* composition helper에서 사용한다.
 */
export function assertEasingFunction(fn: unknown): void {
  if (typeof fn !== 'function') {
    throw new RangeError('easing wrapper fn must be a function');
  }
}

/**
 * blend weight가 finite number인지 검증한다.
 *
 * easeBlend는 weight를 clamp하지 않고 extrapolation을 허용하되 non-finite만 거른다.
 */
export function assertFiniteWeight(weight: number): void {
  if (!Number.isFinite(weight)) {
    throw new RangeError('easing blend weight must be a finite number');
  }
}

/**
 * elastic easing의 amplitude가 유효한지 검증한다.
 *
 * amplitude >= 1이어야 하며 finite positive number를 요구한다.
 */
export function assertElasticAmplitude(amplitude: number): void {
  if (!Number.isFinite(amplitude) || amplitude < 1) {
    throw new RangeError('easing elastic amplitude must be a finite number >= 1');
  }
}

/**
 * elastic easing의 period가 유효한지 검증한다.
 *
 * period > 0이어야 하며 finite positive number를 요구한다.
 */
export function assertElasticPeriod(period: number): void {
  if (!Number.isFinite(period) || period <= 0) {
    throw new RangeError('easing elastic period must be a finite positive number (> 0)');
  }
}

// ─── 공유 상수 ────────────────────────────────────────────────────────────────

/** back easing 기본 overshoot 값 (Penner 표준값). */
export const DEFAULT_BACK_OVERSHOOT = 1.70158;

/** bounce 공식 상수 (Penner 표준값). */
export const BOUNCE_N1 = 7.5625;
export const BOUNCE_D1 = 2.75;

/** elastic easing 기본 파라미터. */
export const ELASTIC_DEFAULT_AMPLITUDE = 1;
export const ELASTIC_DEFAULT_PERIOD = 0.3;

// ─── sine raw ─────────────────────────────────────────────────────────────────

/** 1 - cos(t*PI/2). validation 없이 계산만 수행한다. */
export function sineInRaw(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/** sin(t*PI/2). validation 없이 계산만 수행한다. */
export function sineOutRaw(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

/** -(cos(PI*t) - 1) / 2. validation 없이 계산만 수행한다. */
export function sineInOutRaw(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ─── expo raw ─────────────────────────────────────────────────────────────────

/** t === 0 ? 0 : 2^(10t - 10). validation 없이 계산만 수행한다. */
export function expoInRaw(t: number): number {
  return t === 0 ? 0 : 2 ** (10 * t - 10);
}

/** t === 1 ? 1 : 1 - 2^(-10t). validation 없이 계산만 수행한다. */
export function expoOutRaw(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

/** expo ease-in-out. validation 없이 계산만 수행한다. */
export function expoInOutRaw(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return 2 ** (20 * t - 10) / 2;
  return (2 - 2 ** (-20 * t + 10)) / 2;
}

// ─── circ raw ─────────────────────────────────────────────────────────────────

/** 1 - sqrt(1 - t²). validation 없이 계산만 수행한다. */
export function circInRaw(t: number): number {
  return 1 - Math.sqrt(1 - t * t);
}

/** sqrt(1 - (t-1)²). validation 없이 계산만 수행한다. */
export function circOutRaw(t: number): number {
  return Math.sqrt(1 - (t - 1) ** 2);
}

/** circ ease-in-out. validation 없이 계산만 수행한다. */
export function circInOutRaw(t: number): number {
  if (t < 0.5) {
    return (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2;
  }
  return (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2;
}

// ─── bounce raw ───────────────────────────────────────────────────────────────

/**
 * bounceOut piecewise 계산 내부 함수.
 *
 * validation 없이 계산만 수행한다. 호출 전 finite 검증을 호출자가 보장해야 한다.
 */
export function bounceOutRaw(t: number): number {
  if (t < 1 / BOUNCE_D1) {
    return BOUNCE_N1 * t * t;
  }
  if (t < 2 / BOUNCE_D1) {
    const u = t - 1.5 / BOUNCE_D1;
    return BOUNCE_N1 * u * u + 0.75;
  }
  if (t < 2.5 / BOUNCE_D1) {
    const u = t - 2.25 / BOUNCE_D1;
    return BOUNCE_N1 * u * u + 0.9375;
  }
  const u = t - 2.625 / BOUNCE_D1;
  return BOUNCE_N1 * u * u + 0.984375;
}

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

// ─── bias raw ─────────────────────────────────────────────────────────────────

/**
 * Schlick-style bias 수식 계산.
 *
 * 수식: t / (((1 / amount - 2) * (1 - t)) + 1)
 * validation 없이 계산만 수행한다. 호출 전 amount가 (0, 1) 범위임을 호출자가 보장해야 한다.
 * t === 0 → 0, t === 1 → 1 (exact endpoint).
 */
export function biasRaw(t: number, amount: number): number {
  return t / ((1 / amount - 2) * (1 - t) + 1);
}

// ─── broad shaping raw ────────────────────────────────────────────────────────

/**
 * endpoint-normalized centered logistic 계산.
 *
 * raw `L(x) = 1 / (1 + exp(-steepness * (x - 0.5)))`를
 * `(L(t) - L(0)) / (L(1) - L(0))`로 정규화한다.
 * validation 없이 계산만 수행한다. 호출 전 t가 finite, steepness가 finite positive(> 0)임을
 * 호출자가 보장해야 한다. endpoint exact 고정은 호출자 책임이다.
 */
export function logisticNormalizedRaw(t: number, steepness: number): number {
  const lo = 1 / (1 + Math.exp(0.5 * steepness));
  const hi = 1 / (1 + Math.exp(-0.5 * steepness));
  const lt = 1 / (1 + Math.exp(-steepness * (t - 0.5)));
  return (lt - lo) / (hi - lo);
}

/**
 * breakpoint `center`에서 두 조각을 잇는 ease-out-in seat 계산.
 *
 * `t <= center`: `0.5 * (1 - (1 - t / center) ** power)`.
 * `t > center`: `0.5 + 0.5 * ((t - center) / (1 - center)) ** power`.
 * `t === center`에서 `0.5`, `t === 0`에서 `0`, `t === 1`에서 `1` (formula exact).
 * validation 없이 계산만 수행한다. 호출 전 t가 finite, `0 < center < 1`, power가 finite
 * positive(> 0)임을 호출자가 보장해야 한다. `[0, 1]` 밖 t와 fractional power 조합은 NaN을 만들 수 있다.
 */
export function seatRaw(t: number, center: number, power: number): number {
  if (t <= center) {
    return 0.5 * (1 - (1 - t / center) ** power);
  }
  return 0.5 + 0.5 * ((t - center) / (1 - center)) ** power;
}

/**
 * threshold 주변 width 폭의 연속(C1) smoothstep 전이 계산.
 *
 * `edge0 = threshold - width / 2`, `u = clamp((t - edge0) / width, 0, 1)`,
 * 반환 `u * u * (3 - 2 * u)`. band 밖은 평탄(`0`/`1`), `t === threshold`에서 `0.5`.
 * validation 없이 계산만 수행한다. 호출 전 t/threshold가 finite, width가 finite positive(> 0)임을
 * 호출자가 보장해야 한다.
 */
export function cliffRaw(t: number, threshold: number, width: number): number {
  const edge0 = threshold - width / 2;
  const u = (t - edge0) / width;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u * u * (3 - 2 * u);
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
