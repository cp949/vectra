import { cryptoUint32, hasCrypto } from './entropy.internal';

/** @throws {RangeError} Web Crypto `getRandomValues`가 없는 환경이면 던진다. */
export const randomUint32 = (): number => {
  if (!hasCrypto()) {
    throw new RangeError('Web Crypto getRandomValues is not available');
  }

  return cryptoUint32();
};
