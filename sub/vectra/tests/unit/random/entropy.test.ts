import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  cryptoUint32,
  defaultRandom,
  hasCrypto,
  randomUint32Below,
  UINT32_SIZE,
} from '../../../src/random/entropy.internal';

/**
 * Web Crypto mock — 주어진 값들을 순서대로 buf[0]에 기록한다.
 * scalar.test.ts의 values.shift() 패턴을 따른다.
 */
const makeCryptoMock = (values: number[]) => ({
  getRandomValues: (array: Uint32Array) => {
    array[0] = values.shift() ?? 0;
    return array;
  },
});

describe('hasCrypto', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('crypto.getRandomValues가 존재하면 true를 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock([0]));
    expect(hasCrypto()).toBe(true);
  });

  test('crypto가 undefined이면 false를 반환한다', () => {
    vi.stubGlobal('crypto', undefined);
    expect(hasCrypto()).toBe(false);
  });

  test('getRandomValues가 없는 객체이면 false를 반환한다', () => {
    vi.stubGlobal('crypto', {});
    expect(hasCrypto()).toBe(false);
  });
});

describe('cryptoUint32', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('mock crypto의 첫 uint32를 그대로 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock([0xdeadbeef]));
    expect(cryptoUint32()).toBe(0xdeadbeef);
  });

  test('0을 기록하는 mock에서 0을 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock([0]));
    expect(cryptoUint32()).toBe(0);
  });
});

describe('defaultRandom', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('crypto 분기에서 cryptoUint32 / UINT32_SIZE를 반환한다', () => {
    vi.stubGlobal('crypto', makeCryptoMock([0x80000000]));
    expect(defaultRandom()).toBe(0.5);
  });

  test('fallback 분기에서 [0, 1) 범위 값을 반환한다', () => {
    vi.stubGlobal('crypto', undefined);
    const value = defaultRandom();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});

describe('randomUint32Below — RangeError 가드', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('range=0은 RangeError를 던진다', () => {
    expect(() => randomUint32Below(0)).toThrow(RangeError);
    expect(() => randomUint32Below(0)).toThrow('range must be a positive safe integer less than or equal to 2^32');
  });

  test('range=-1은 RangeError를 던진다', () => {
    expect(() => randomUint32Below(-1)).toThrow(RangeError);
  });

  test('range=UINT32_SIZE+1은 RangeError를 던진다', () => {
    expect(() => randomUint32Below(UINT32_SIZE + 1)).toThrow(RangeError);
  });

  test('range=Number.MAX_SAFE_INTEGER+1(unsafe)은 RangeError를 던진다', () => {
    expect(() => randomUint32Below(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });
});

describe('randomUint32Below — crypto 분기', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('limit 초과 첫 값(0xffffffff)을 버리고 다음 유효 값을 반환한다', () => {
    // range=10: limit = UINT32_SIZE - (UINT32_SIZE % 10) = 0xfffffff6.
    // 0xffffffff >= limit → 버려짐. 7 < limit → 7 % 10 = 7.
    vi.stubGlobal('crypto', makeCryptoMock([0xffffffff, 7]));
    expect(randomUint32Below(10)).toBe(7);
  });

  test('경계값 value=limit은 버려지고 다음 값을 반환한다', () => {
    // range=3: limit = UINT32_SIZE - (UINT32_SIZE % 3) = 0xfffffffe.
    // value=0xfffffffe는 value < limit가 거짓이므로 버려짐. 다음 value=2 → 2 % 3 = 2.
    vi.stubGlobal('crypto', makeCryptoMock([0xfffffffe, 2]));
    expect(randomUint32Below(3)).toBe(2);
  });
});

describe('randomUint32Below — fallback 분기 정수 범위', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('range=10에서 [0, 10) 정수를 반환한다', () => {
    vi.stubGlobal('crypto', undefined);
    for (let i = 0; i < 200; i++) {
      const value = randomUint32Below(10);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(10);
    }
  });

  test('range=1은 항상 0을 반환한다', () => {
    vi.stubGlobal('crypto', undefined);
    for (let i = 0; i < 50; i++) {
      expect(randomUint32Below(1)).toBe(0);
    }
  });

  test('range=UINT32_SIZE에서 [0, UINT32_SIZE) 정수를 반환한다', () => {
    vi.stubGlobal('crypto', undefined);
    const value = randomUint32Below(UINT32_SIZE);
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(UINT32_SIZE);
  });
});

describe('randomUint32Below — fallback 분기 rejection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('limit 초과 uint32를 만드는 첫 Math.random 값을 버리고 다음 값을 반환한다', () => {
    // range=3: limit = 0xfffffffe.
    // Math.random()=0xffffffff/UINT32_SIZE → fallbackUint32 = floor(... * UINT32_SIZE) = 0xffffffff >= limit → 버려짐.
    // 다음 Math.random()=2/UINT32_SIZE → fallbackUint32 = 2 < limit → 2 % 3 = 2.
    // rejection이면 Math.random이 2회 호출된다. truncation이면 1회만 호출되고 값도 다르다.
    vi.stubGlobal('crypto', undefined);
    const spy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0xffffffff / UINT32_SIZE)
      .mockReturnValueOnce(2 / UINT32_SIZE);
    expect(randomUint32Below(3)).toBe(2);
    // 첫 값(limit 초과)이 버려지고 두 번째 값이 소비되었음을 검증한다.
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('randomUint32Below — fallback 분기 균등 분포 (bias-free)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('range=3에서 각 버킷이 N/3의 ±5% 이내다', () => {
    vi.stubGlobal('crypto', undefined);
    const range = 3;
    const N = 30000;
    const buckets = new Array(range).fill(0);
    for (let i = 0; i < N; i++) {
      buckets[randomUint32Below(range)]++;
    }
    const expectedPer = Math.round(N / range);
    const tolerance = Math.ceil((N / range) * 0.05);
    for (const count of buckets) {
      expect(Math.abs(count - expectedPer)).toBeLessThanOrEqual(tolerance);
    }
  });

  test('range=5(truncation bias가 드러나는 경우)에서 각 버킷이 N/5의 ±5% 이내다', () => {
    // UINT32_SIZE % 5 = 1. truncation 시 버킷 0이 초과 빈도를 갖는다. rejection이면 균등.
    vi.stubGlobal('crypto', undefined);
    const range = 5;
    const N = 30000;
    const buckets = new Array(range).fill(0);
    for (let i = 0; i < N; i++) {
      buckets[randomUint32Below(range)]++;
    }
    const expectedPer = Math.round(N / range);
    const tolerance = Math.ceil((N / range) * 0.05);
    for (const count of buckets) {
      expect(Math.abs(count - expectedPer)).toBeLessThanOrEqual(tolerance);
    }
  });
});
