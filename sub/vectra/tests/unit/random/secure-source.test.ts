import { afterEach, describe, expect, test, vi } from 'vitest';
import { randomUint32 } from '../../../src/random/random-uint32';
import { secureRandomSource } from '../../../src/random/secure-random-source';

/** Web Crypto mock — buf[0]에 고정값을 기록한다 */
const makeCryptoMock = (value: number) => ({
  getRandomValues: (array: Uint32Array) => {
    array[0] = value;
    return array;
  },
});

describe('randomUint32', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('Web Crypto mock 주입 시 buffer의 첫 uint32를 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock(0xdeadbeef));
    expect(randomUint32()).toBe(0xdeadbeef);
  });

  test('0을 반환하는 mock에서 0을 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock(0));
    expect(randomUint32()).toBe(0);
  });

  test('globalThis.crypto가 없으면 RangeError를 던진다', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => randomUint32()).toThrow(RangeError);
    expect(() => randomUint32()).toThrow('Web Crypto getRandomValues is not available');
  });

  test('getRandomValues가 없는 객체에서 RangeError를 던진다', () => {
    vi.stubGlobal('crypto', {});
    expect(() => randomUint32()).toThrow(RangeError);
  });
});

describe('secureRandomSource', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('Web Crypto mock 주입 시 [0, 1) float를 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock(0x80000000));
    const rng = secureRandomSource();
    expect(rng()).toBe(0.5);
  });

  test('uint32 최댓값(0xffffffff)은 1 미만의 값을 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock(0xffffffff));
    const rng = secureRandomSource();
    const value = rng();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  test('uint32 0은 0.0을 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock(0));
    const rng = secureRandomSource();
    expect(rng()).toBe(0);
  });

  test('globalThis.crypto가 없으면 factory 시점에 RangeError를 던진다', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => secureRandomSource()).toThrow(RangeError);
    expect(() => secureRandomSource()).toThrow('Web Crypto getRandomValues is not available');
  });

  test('getRandomValues가 없는 객체에서 factory 시점에 RangeError를 던진다', () => {
    vi.stubGlobal('crypto', {});
    expect(() => secureRandomSource()).toThrow(RangeError);
  });
});
