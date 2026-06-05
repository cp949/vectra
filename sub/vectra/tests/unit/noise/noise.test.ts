/**
 * noise deterministic 2D scalar field 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { createNoise2 } from '../../../src/noise/create-noise-2';
import { fbm2 } from '../../../src/noise/fbm-2';
import { perlinNoise2 } from '../../../src/noise/perlin-noise-2';
import { ridgedFbm2 } from '../../../src/noise/ridged-fbm-2';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

// 대표 fractional sample grid. integer lattice point는 항상 0이므로 fractional 좌표만 둔다.
const SAMPLE_GRID: Array<[number, number]> = [];
for (let i = 0; i < 8; i += 1) {
  for (let j = 0; j < 8; j += 1) {
    SAMPLE_GRID.push([i * 0.37 + 0.13, j * 0.41 - 0.29]);
  }
}

describe('perlinNoise2', () => {
  test('같은 seed와 coordinate는 반복 호출에서 같은 값을 반환한다', () => {
    const a = perlinNoise2(3.14, -2.71, { seed: 42 });
    const b = perlinNoise2(3.14, -2.71, { seed: 42 });
    expect(a).toBe(b);
  });

  test('integer lattice point에서 0을 반환한다', () => {
    expect(perlinNoise2(0, 0, { seed: 42 })).toBe(0);
    expect(perlinNoise2(5, -3, { seed: 42 })).toBe(0);
    expect(perlinNoise2(-7, 11, { seed: 1 })).toBe(0);
  });

  test('서로 다른 seed는 대표 fractional coordinate에서 다른 값을 반환한다', () => {
    const a = perlinNoise2(1.5, 2.5, { seed: 1 });
    const b = perlinNoise2(1.5, 2.5, { seed: 2 });
    expect(a).not.toBe(b);
  });

  test('생략 seed는 default seed로 deterministic하다', () => {
    expect(perlinNoise2(1.5, 2.5)).toBe(perlinNoise2(1.5, 2.5));
  });

  test('대표 grid sample에서 결과가 [-1, 1]이다', () => {
    for (const [x, y] of SAMPLE_GRID) {
      const value = perlinNoise2(x, y, { seed: 7 });
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  test('string seed는 deterministic하게 hashing된다', () => {
    expect(perlinNoise2(1.5, 2.5, { seed: 'vectra' })).toBe(perlinNoise2(1.5, 2.5, { seed: 'vectra' }));
    expect(perlinNoise2(1.5, 2.5, { seed: 'vectra' })).not.toBe(perlinNoise2(1.5, 2.5, { seed: 'other' }));
  });

  test('음수/fractional numeric seed도 deterministic하게 처리한다', () => {
    expect(perlinNoise2(1.5, 2.5, { seed: -3.5 })).toBe(perlinNoise2(1.5, 2.5, { seed: -3.5 }));
    expect(perlinNoise2(1.5, 2.5, { seed: -3.5 })).not.toBe(perlinNoise2(1.5, 2.5, { seed: 3.5 }));
  });

  test('numeric seed와 그 canonical string seed는 같은 field다', () => {
    // number seed는 canonical 문자열 표현을 거쳐 hashing하므로 42와 "42"가 같은 field로 매핑된다.
    expect(perlinNoise2(1.5, 2.5, { seed: 42 })).toBe(perlinNoise2(1.5, 2.5, { seed: '42' }));
    expect(perlinNoise2(1.5, 2.5, { seed: -3.5 })).toBe(perlinNoise2(1.5, 2.5, { seed: '-3.5' }));
  });

  test('x의 non-finite 입력은 RangeError다', () => {
    for (const value of NON_FINITE) {
      expect(() => perlinNoise2(value, 0, { seed: 1 })).toThrow(RangeError);
    }
  });

  test('y의 non-finite 입력은 RangeError다', () => {
    for (const value of NON_FINITE) {
      expect(() => perlinNoise2(0, value, { seed: 1 })).toThrow(RangeError);
    }
  });

  test('numeric seed의 non-finite 입력은 RangeError다', () => {
    for (const value of NON_FINITE) {
      expect(() => perlinNoise2(1.5, 2.5, { seed: value })).toThrow(RangeError);
    }
  });
});

describe('createNoise2', () => {
  test('perlinNoise2(x, y, { seed })와 같은 값을 반환한다', () => {
    const sample = createNoise2({ seed: 42 });
    for (const [x, y] of SAMPLE_GRID) {
      expect(sample(x, y)).toBe(perlinNoise2(x, y, { seed: 42 }));
    }
  });

  test('같은 seed로 만든 두 함수는 같은 coordinate에서 같은 값을 반환한다', () => {
    const a = createNoise2({ seed: 99 });
    const b = createNoise2({ seed: 99 });
    expect(a(1.5, 2.5)).toBe(b(1.5, 2.5));
  });

  test('서로 다른 seed로 만든 함수는 대표 coordinate에서 다른 값을 반환한다', () => {
    const a = createNoise2({ seed: 1 });
    const b = createNoise2({ seed: 2 });
    expect(a(1.5, 2.5)).not.toBe(b(1.5, 2.5));
  });

  test('두 instance를 interleave 호출해도 서로 mutable state를 공유하지 않는다', () => {
    const a = createNoise2({ seed: 1 });
    const b = createNoise2({ seed: 2 });
    const a1 = a(1.5, 2.5);
    const b1 = b(1.5, 2.5);
    // 호출 순서를 섞어도 각 instance는 자신의 seed field만 본다.
    expect(b(1.5, 2.5)).toBe(b1);
    expect(a(1.5, 2.5)).toBe(a1);
  });

  test('생략 seed는 perlinNoise2 default seed와 일치한다', () => {
    const sample = createNoise2();
    expect(sample(1.5, 2.5)).toBe(perlinNoise2(1.5, 2.5));
  });

  test('numeric seed의 non-finite 입력은 생성 시점에 RangeError다', () => {
    for (const value of NON_FINITE) {
      expect(() => createNoise2({ seed: value })).toThrow(RangeError);
    }
  });

  test('반환 함수는 x의 non-finite 입력을 RangeError로 거부한다', () => {
    const sample = createNoise2({ seed: 1 });
    for (const value of NON_FINITE) {
      expect(() => sample(value, 0)).toThrow(RangeError);
    }
  });

  test('반환 함수는 y의 non-finite 입력을 RangeError로 거부한다', () => {
    const sample = createNoise2({ seed: 1 });
    for (const value of NON_FINITE) {
      expect(() => sample(0, value)).toThrow(RangeError);
    }
  });
});

describe('fbm2', () => {
  test('같은 seed/coordinate/options에서 반복 호출 결과가 같다', () => {
    const a = fbm2(1.5, 2.5, { seed: 42, octaves: 3 });
    const b = fbm2(1.5, 2.5, { seed: 42, octaves: 3 });
    expect(a).toBe(b);
  });

  test('서로 다른 seed는 대표 coordinate에서 다른 값을 반환한다', () => {
    expect(fbm2(1.5, 2.5, { seed: 1 })).not.toBe(fbm2(1.5, 2.5, { seed: 2 }));
  });

  test('octaves: 1은 normalized base Perlin noise와 같다', () => {
    for (const [x, y] of SAMPLE_GRID) {
      expect(fbm2(x, y, { seed: 7, octaves: 1 })).toBe(perlinNoise2(x, y, { seed: 7 }));
    }
  });

  test('default options와 명시 options 대표값이 모두 deterministic하다', () => {
    expect(fbm2(1.5, 2.5, { seed: 5 })).toBe(fbm2(1.5, 2.5, { seed: 5 }));
    expect(fbm2(1.5, 2.5, { seed: 5, octaves: 6, lacunarity: 2.5, gain: 0.4 })).toBe(
      fbm2(1.5, 2.5, { seed: 5, octaves: 6, lacunarity: 2.5, gain: 0.4 })
    );
  });

  test('default octaves는 명시 octaves: 4와 같다', () => {
    expect(fbm2(1.5, 2.5, { seed: 5 })).toBe(fbm2(1.5, 2.5, { seed: 5, octaves: 4, lacunarity: 2, gain: 0.5 }));
  });

  test('대표 grid sample에서 결과가 [-1, 1]이다', () => {
    for (const [x, y] of SAMPLE_GRID) {
      const value = fbm2(x, y, { seed: 7 });
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  test('octaves의 invalid value는 RangeError다', () => {
    for (const octaves of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => fbm2(1.5, 2.5, { seed: 1, octaves })).toThrow(RangeError);
    }
  });

  test('lacunarity의 invalid value는 RangeError다', () => {
    for (const lacunarity of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => fbm2(1.5, 2.5, { seed: 1, lacunarity })).toThrow(RangeError);
    }
  });

  test('gain의 invalid value는 RangeError다', () => {
    for (const gain of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => fbm2(1.5, 2.5, { seed: 1, gain })).toThrow(RangeError);
    }
  });

  test('x/y/numeric seed의 non-finite 입력은 RangeError다', () => {
    for (const value of NON_FINITE) {
      expect(() => fbm2(value, 0, { seed: 1 })).toThrow(RangeError);
      expect(() => fbm2(0, value, { seed: 1 })).toThrow(RangeError);
      expect(() => fbm2(1.5, 2.5, { seed: value })).toThrow(RangeError);
    }
  });

  test('극단적 입력으로 중간 계산이 non-finite가 되면 RangeError다', () => {
    // frequency overflow: 좌표/lacunarity가 octave에서 Infinity로 발산.
    expect(() => fbm2(1e308, 0, { seed: 1 })).toThrow(RangeError);
    expect(() => fbm2(1.5, 2.5, { seed: 1, lacunarity: 1e103 })).toThrow(RangeError);
    // amplitude overflow: gain이 너무 커서 amplitude가 Infinity로 발산.
    expect(() => fbm2(1.5, 2.5, { seed: 1, gain: Number.MAX_VALUE })).toThrow(RangeError);
  });
});

describe('ridgedFbm2', () => {
  test('같은 seed/coordinate/options에서 반복 호출 결과가 같다', () => {
    const a = ridgedFbm2(1.5, 2.5, { seed: 42, octaves: 3 });
    const b = ridgedFbm2(1.5, 2.5, { seed: 42, octaves: 3 });
    expect(a).toBe(b);
  });

  test('서로 다른 seed는 대표 coordinate에서 다른 값을 반환한다', () => {
    expect(ridgedFbm2(1.5, 2.5, { seed: 1 })).not.toBe(ridgedFbm2(1.5, 2.5, { seed: 2 }));
  });

  test('대표 grid sample에서 결과가 [-1, 1]이다', () => {
    for (const [x, y] of SAMPLE_GRID) {
      const value = ridgedFbm2(x, y, { seed: 7 });
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  test('default options 대표값이 deterministic하다', () => {
    expect(ridgedFbm2(1.5, 2.5, { seed: 5 })).toBe(ridgedFbm2(1.5, 2.5, { seed: 5 }));
  });

  test('default octaves는 명시 octaves: 4와 같다', () => {
    expect(ridgedFbm2(1.5, 2.5, { seed: 5 })).toBe(
      ridgedFbm2(1.5, 2.5, { seed: 5, octaves: 4, lacunarity: 2, gain: 0.5 })
    );
  });

  test('octaves: 1은 ridge 변환 (1 - |base|) * 2 - 1을 적용한 값이다', () => {
    for (const [x, y] of SAMPLE_GRID) {
      const base = perlinNoise2(x, y, { seed: 7 });
      // octave 1 합성: sum=(1-|base|), totalAmplitude=1, 그 뒤 [0,1]→[-1,1] 매핑.
      const expected = (1 - Math.abs(base)) * 2 - 1;
      expect(ridgedFbm2(x, y, { seed: 7, octaves: 1 })).toBeCloseTo(expected, 12);
    }
  });

  test('octaves의 invalid value는 RangeError다', () => {
    for (const octaves of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => ridgedFbm2(1.5, 2.5, { seed: 1, octaves })).toThrow(RangeError);
    }
  });

  test('lacunarity의 invalid value는 RangeError다', () => {
    for (const lacunarity of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => ridgedFbm2(1.5, 2.5, { seed: 1, lacunarity })).toThrow(RangeError);
    }
  });

  test('gain의 invalid value는 RangeError다', () => {
    for (const gain of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => ridgedFbm2(1.5, 2.5, { seed: 1, gain })).toThrow(RangeError);
    }
  });

  test('x/y/numeric seed의 non-finite 입력은 RangeError다', () => {
    for (const value of NON_FINITE) {
      expect(() => ridgedFbm2(value, 0, { seed: 1 })).toThrow(RangeError);
      expect(() => ridgedFbm2(0, value, { seed: 1 })).toThrow(RangeError);
      expect(() => ridgedFbm2(1.5, 2.5, { seed: value })).toThrow(RangeError);
    }
  });

  test('극단적 입력으로 중간 계산이 non-finite가 되면 RangeError다', () => {
    // frequency overflow: 좌표/lacunarity가 octave에서 Infinity로 발산.
    expect(() => ridgedFbm2(1e308, 0, { seed: 1 })).toThrow(RangeError);
    expect(() => ridgedFbm2(1.5, 2.5, { seed: 1, lacunarity: 1e103 })).toThrow(RangeError);
    // amplitude overflow: gain이 너무 커서 amplitude가 Infinity로 발산.
    expect(() => ridgedFbm2(1.5, 2.5, { seed: 1, gain: Number.MAX_VALUE })).toThrow(RangeError);
  });
});
