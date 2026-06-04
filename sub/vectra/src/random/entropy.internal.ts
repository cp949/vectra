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

/**
 * [0, range) 범위의 정수를 편향 없이 반환한다.
 *
 * Web Crypto가 사용 가능하면 rejection sampling으로 modulo bias를 제거한다.
 * 사용 불가능한 환경에서는 `Math.random` 기반 truncation으로 fallback한다.
 *
 * @param range - 상한값(exclusive). 양의 안전 정수이며 2^32 이하여야 한다.
 * @throws {RangeError} range가 양의 안전 정수가 아니거나 2^32를 초과하면 던진다.
 */
export const randomUint32Below = (range: number): number => {
  if (!Number.isSafeInteger(range) || range <= 0 || range > UINT32_SIZE) {
    throw new RangeError('range must be a positive safe integer less than or equal to 2^32');
  }

  if (!hasCrypto()) {
    return Math.floor(Math.random() * range);
  }

  // rejection sampling: UINT32_SIZE % range 만큼의 상단 값을 버려 편향을 제거한다
  const limit = UINT32_SIZE - (UINT32_SIZE % range);

  while (true) {
    const value = cryptoUint32();

    if (value < limit) {
      return value % range;
    }
  }
};
