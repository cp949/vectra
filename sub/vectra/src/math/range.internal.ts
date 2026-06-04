/**
 * values가 모두 finite number인지 검증한다.
 *
 * NaN과 +/-Infinity를 public math helper 경계에서 거르기 위한 공통 guard이다.
 */
export function assertFiniteNumbers(values: readonly number[]): void {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new RangeError('math arguments must be finite numbers');
    }
  }
}

/**
 * value가 finite positive number인지 검증한다.
 *
 * snap gap처럼 0과 음수를 모두 금지하는 scalar parameter에 사용한다.
 */
export function assertPositiveFiniteNumber(value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError('math argument must be a positive finite number');
  }
}

/**
 * value가 finite non-negative number인지 검증한다.
 *
 * fuzzy epsilon처럼 0은 허용하지만 음수는 허용하지 않는 parameter에 사용한다.
 */
export function assertNonNegativeFiniteNumber(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError('math argument must be a non-negative finite number');
  }
}

/**
 * rounding helper의 place/base에서 finite positive scale factor를 계산한다.
 *
 * `place`는 safe integer여야 하고 `base`는 0보다 크며 1이 아니어야 한다.
 * `base ** place`가 overflow되거나 0으로 underflow되면 RangeError를 던진다.
 */
export function roundingFactor(place: number, base: number): number {
  assertFiniteNumbers([place, base]);

  if (!Number.isSafeInteger(place)) {
    throw new RangeError('math rounding place must be a safe integer');
  }

  if (base <= 0 || base === 1) {
    throw new RangeError('math rounding base must be positive and not equal to 1');
  }

  const factor = base ** place;

  if (!Number.isFinite(factor) || factor <= 0) {
    throw new RangeError('math rounding factor must be a positive finite number');
  }

  return factor;
}

/**
 * ordered range 전제인 `min <= max`를 검증한다.
 *
 * closed range처럼 0-length range를 유효하게 다루는 helper에서 사용한다.
 */
export function assertOrderedRange(min: number, max: number): void {
  if (min > max) {
    throw new RangeError('range min must be less than or equal to max');
  }
}

/**
 * half-open wrap처럼 0-length range를 허용하지 않는 `min < max` 전제를 검증한다.
 */
export function assertStrictOrderedRange(min: number, max: number): void {
  if (min >= max) {
    throw new RangeError('range min must be less than max');
  }
}

/**
 * 비율 계산이 가능한 ordered source range인지 검증한다.
 *
 * `min < max`를 요구하므로 뒤집힌 range와 0-length range를 모두 거부한다.
 */
export function assertNonZeroOrderedRange(min: number, max: number): void {
  assertOrderedRange(min, max);

  if (min === max) {
    throw new RangeError('range must have non-zero length');
  }
}

/**
 * values가 모두 Number.isSafeInteger 기준을 만족하는지 검증한다.
 *
 * integer wrap helper가 정밀도 손실 없이 modulo를 계산할 수 있는 입력만 통과시킨다.
 */
export function assertSafeIntegers(values: readonly number[]): void {
  for (const value of values) {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError('math integer arguments must be safe integers');
    }
  }
}

/**
 * 두 safe integer 사이의 차이가 safe integer로 표현 가능한지 검증해 반환한다.
 *
 * 정수 wrap에서 modulo offset 계산 전 정밀도 손실을 막기 위한 helper이다.
 */
export function safeIntegerDifference(value: number, min: number): number {
  const difference = value - min;

  if (!Number.isSafeInteger(difference)) {
    throw new RangeError('math integer difference must be a safe integer');
  }

  return difference;
}

/**
 * 정수 wrap의 modulo span이 safe integer로 표현 가능한지 검증해 반환한다.
 *
 * inclusive range는 `max - min + 1`, half-open range는 `max - min`을 span으로 사용한다.
 */
export function safeIntegerModuloSpan(min: number, max: number, inclusive: boolean): number {
  const width = max - min;
  const span = inclusive ? width + 1 : width;

  if (!Number.isSafeInteger(span)) {
    throw new RangeError('math integer wrap span must be a safe integer');
  }

  return span;
}

/**
 * JS remainder를 [0, divisor) 범위의 modulo 값으로 보정한다.
 *
 * `divisor`는 양수라는 전제를 호출자가 보장한다. 결과의 -0은 0으로 정규화한다.
 */
export function positiveModulo(value: number, divisor: number): number {
  const remainder = value % divisor;
  const wrapped = remainder < 0 ? remainder + divisor : remainder;

  return Object.is(wrapped, -0) ? 0 : wrapped;
}
