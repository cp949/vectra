/**
 * noise domain 공유 입력 검증 helper.
 *
 * coordinate와 numeric option의 finite 계약을 한 곳에서 강제한다. public leaf끼리 직접
 * import하지 않도록 검증은 이 internal helper로 내린다.
 */

/**
 * noise 입력이 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * `NaN`, `Infinity`, `-Infinity`는 모두 위반이다. 음수와 `0`은 허용한다. coordinate처럼
 * 부호와 크기에 제약이 없는 입력에 사용한다.
 *
 * @param value 검증할 입력 scalar
 * @param name error message에 사용할 인자 이름
 */
export function assertFiniteNoiseInput(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, got ${String(value)}`);
  }
}

/**
 * noise 옵션이 finite positive number인지 검증한다. 위반 시 `RangeError`.
 *
 * `0`, 음수, `NaN`, `Infinity`, `-Infinity`는 모두 위반이다. lacunarity, gain처럼 양수만
 * 의미 있는 옵션에 사용한다.
 *
 * @param value 검증할 옵션 scalar
 * @param name error message에 사용할 옵션 이름
 */
export function assertPositiveNoiseOption(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number, got ${String(value)}`);
  }
}

/**
 * noise 옵션이 양의 정수인지 검증한다. 위반 시 `RangeError`.
 *
 * `0`, 음수, fractional, `NaN`, `Infinity`, `-Infinity`는 모두 위반이다. octaves처럼
 * 양의 정수 횟수만 의미 있는 옵션에 사용한다.
 *
 * @param value 검증할 옵션 scalar
 * @param name error message에 사용할 옵션 이름
 */
export function assertPositiveIntegerNoiseOption(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer, got ${String(value)}`);
  }
}

// 생략된 seed의 고정 default. 변경 시 default field가 바뀌므로 breaking change다.
const DEFAULT_NOISE_SEED = 0x9e3779b9;

/**
 * seed option을 deterministic uint32로 정규화한다.
 *
 * `undefined`는 고정 default seed를 쓴다. `number` seed는 finite여야 하며(위반 시
 * `RangeError`) canonical 문자열 표현을 거쳐 hashing한다. `string` seed는 FNV-1a로
 * hashing한다. seed hashing은 public determinism contract이므로 변경 시 breaking change다.
 *
 * @param seed 정규화할 seed. 생략하면 default seed.
 */
export function normalizeSeed(seed?: number | string): number {
  if (seed === undefined) {
    return DEFAULT_NOISE_SEED;
  }
  if (typeof seed === 'number') {
    assertFiniteNoiseInput(seed, 'seed');
    // canonical 문자열 표현을 거쳐 string hashing으로 위임한다. mutable module state 없이
    // 모든 finite number(음수/fractional 포함)를 deterministic하게 매핑한다.
    return hashSeedString(String(seed));
  }
  return hashSeedString(seed);
}

// 32-bit FNV-1a. seed string을 uint32 hash로 매핑한다.
function hashSeedString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
