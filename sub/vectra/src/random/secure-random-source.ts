import { cryptoUint32, hasCrypto, UINT32_SIZE } from './entropy.internal';
import type { RandomSource } from './random';

/**
 * Web Crypto `getRandomValues`로 uint32를 만들어 `[0, 1)` float를 반환하는 `RandomSource`를 새로 만든다.
 *
 * factory 시점에 가드를 수행하므로 반환된 source는 항상 안전하다.
 * 이후 환경에서 `globalThis.crypto`가 제거되면 source 호출 시 `TypeError`가 발생하며, 이는 caller 책임이다.
 *
 * @throws {RangeError} Web Crypto `getRandomValues`가 없는 환경이면 던진다.
 */
export const secureRandomSource = (): RandomSource => {
  if (!hasCrypto()) {
    throw new RangeError('Web Crypto getRandomValues is not available');
  }

  return () => cryptoUint32() / UINT32_SIZE;
};
