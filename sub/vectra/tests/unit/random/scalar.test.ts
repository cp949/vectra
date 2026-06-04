import { afterEach, describe, expect, test, vi } from 'vitest';
import { angle } from '../../../src/random/angle';
import { randomUint32Below } from '../../../src/random/entropy.internal';
import { float } from '../../../src/random/float';
import { int } from '../../../src/random/int';
import { random } from '../../../src/random/random';
import { sign } from '../../../src/random/sign';

const sequence = (values: readonly number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('random scalar foundation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('random은 injected rng 값을 그대로 반환한다', () => {
    expect(random(() => 0.25)).toBe(0.25);
  });

  test('random은 rng가 없으면 Web Crypto default source에서 값을 가져온다', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint32Array) => {
        array[0] = 0x80000000;
        return array;
      },
    });
    expect(random()).toBe(0.5);
  });

  test('float는 half-open 범위를 선형 보간한다', () => {
    expect(float(10, 20, () => 0)).toBe(10);
    expect(float(10, 20, () => 0.5)).toBe(15);
    expect(float(10, 20, () => 0.999)).toBeCloseTo(19.99);
  });

  test('int는 양 끝을 포함하는 정수를 반환한다', () => {
    expect(int(2, 5, () => 0)).toBe(2);
    expect(int(2, 5, () => 0.5)).toBe(4);
    expect(int(2, 5, () => 0.999)).toBe(5);
  });

  test('randomUint32Below는 modulo bias를 피하기 위해 rejection sampling을 사용한다', () => {
    const values = [0xffffffff, 7];
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint32Array) => {
        array[0] = values.shift() ?? 0;
        return array;
      },
    });
    expect(randomUint32Below(10)).toBe(7);
  });

  test('int는 rng가 없으면 randomUint32Below 결과를 사용한다', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint32Array) => {
        array[0] = 2;
        return array;
      },
    });
    expect(int(2, 5)).toBe(4);
  });

  test('int는 잘못된 범위에서 RangeError를 던진다', () => {
    expect(() => int(5, 2, () => 0.1)).toThrow(RangeError);
  });

  test('sign은 0.5를 기준으로 -1 또는 1을 반환한다', () => {
    expect(sign(() => 0.499)).toBe(-1);
    expect(sign(() => 0.5)).toBe(1);
  });

  test('angle은 [-PI, PI) 범위를 반환한다', () => {
    expect(angle(() => 0)).toBe(-Math.PI);
    expect(angle(() => 0.5)).toBe(0);
  });

  test('scalar 함수는 같은 rng sequence로 재현 가능하다', () => {
    const rngA = sequence([0.1, 0.2, 0.3]);
    const rngB = sequence([0.1, 0.2, 0.3]);
    expect([random(rngA), float(0, 10, rngA), int(0, 9, rngA)]).toEqual([
      random(rngB),
      float(0, 10, rngB),
      int(0, 9, rngB),
    ]);
  });
});
