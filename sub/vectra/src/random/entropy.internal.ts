export const UINT32_SIZE = 0x100000000 as const;

export const hasCrypto = (): boolean => typeof globalThis.crypto?.getRandomValues === 'function';

/**
 * 호출자가 `hasCrypto() === true`임을 보장한 뒤에만 호출해야 한다.
 * 자체 가드를 두지 않는다.
 */
export const cryptoUint32 = (): number => {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] ?? 0;
};

/** Web Crypto 우선, 미지원 환경에서는 `Math.random`으로 fallback한다. */
export const defaultRandom = (): number => {
  if (!hasCrypto()) {
    return Math.random();
  }

  return cryptoUint32() / UINT32_SIZE;
};

// Math.random() [0,1)을 [0, UINT32_SIZE) 정수로 매핑한다. 비암호학적 PRNG 출력이다.
const fallbackUint32 = (): number => Math.floor(Math.random() * UINT32_SIZE);

/**
 * getUint32가 생성한 uint32에 rejection sampling을 적용해 [0, range) 정수를 편향 없이 반환한다.
 *
 * UINT32_SIZE % range 만큼의 상단 값을 버려 modulo bias를 제거한다. crypto/fallback 두 path가
 * 동일한 수식과 loop를 공유한다.
 */
const rejectSample = (getUint32: () => number, range: number): number => {
  const limit = UINT32_SIZE - (UINT32_SIZE % range);

  while (true) {
    const value = getUint32();

    if (value < limit) {
      return value % range;
    }
  }
};

/**
 * [0, range) 범위의 정수를 편향 없이 반환한다.
 *
 * Web Crypto가 사용 가능하면 `cryptoUint32`를, 미지원 환경에서는 `Math.random` 기반
 * `fallbackUint32`를 source로 rejection sampling을 적용한다. 두 path 모두 modulo bias를
 * 제거하며 균등 분포를 보장한다. fallback path는 비암호학적이므로 보안 용도로 사용하면 안 된다.
 *
 * @param range - 상한값(exclusive). 양의 안전 정수이며 2^32 이하여야 한다.
 * @throws {RangeError} range가 양의 안전 정수가 아니거나 2^32를 초과하면 던진다.
 */
export const randomUint32Below = (range: number): number => {
  if (!Number.isSafeInteger(range) || range <= 0 || range > UINT32_SIZE) {
    throw new RangeError('range must be a positive safe integer less than or equal to 2^32');
  }

  return rejectSample(hasCrypto() ? cryptoUint32 : fallbackUint32, range);
};
