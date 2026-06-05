import { describe, expect, test } from 'vitest';
import { clamp } from '../../../src/math/clamp';
import { difference } from '../../../src/math/difference';
import { fromPercent } from '../../../src/math/from-percent';
import { inverseLerp } from '../../../src/math/inverse-lerp';
import { lerp } from '../../../src/math/lerp';
import { maxAdd } from '../../../src/math/max-add';
import { minSub } from '../../../src/math/min-sub';
import { percent } from '../../../src/math/percent';
import { remap } from '../../../src/math/remap';
import { smoothMax } from '../../../src/math/smooth-max';
import { smoothMin } from '../../../src/math/smooth-min';
import { within } from '../../../src/math/within';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('math 범위 제한 - clamp', () => {
  test('값을 closed range 안으로 제한한다', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  test('0-length range는 유효하며 min을 반환한다', () => {
    expect(clamp(4, 3, 3)).toBe(3);
  });

  test('뒤집힌 range는 RangeError를 던진다', () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => clamp(value, 0, 1)).toThrow(RangeError);
    expect(() => clamp(0, value, 1)).toThrow(RangeError);
    expect(() => clamp(0, 0, value)).toThrow(RangeError);
  });
});

describe('math 범위 판정 - within', () => {
  test('값이 closed range 안에 있는지 반환한다', () => {
    expect(within(0, 0, 10)).toBe(true);
    expect(within(5, 0, 10)).toBe(true);
    expect(within(10, 0, 10)).toBe(true);
    expect(within(-1, 0, 10)).toBe(false);
    expect(within(11, 0, 10)).toBe(false);
  });

  test('0-length range에서는 같은 값만 true를 반환한다', () => {
    expect(within(3, 3, 3)).toBe(true);
    expect(within(4, 3, 3)).toBe(false);
  });

  test('뒤집힌 range는 RangeError를 던진다', () => {
    expect(() => within(5, 10, 0)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => within(value, 0, 1)).toThrow(RangeError);
    expect(() => within(0, value, 1)).toThrow(RangeError);
    expect(() => within(0, 0, value)).toThrow(RangeError);
  });
});

describe('math 보간 - lerp', () => {
  test('두 값 사이의 선형 보간값을 반환한다', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    expect(lerp(10, 20, -0.5)).toBe(5);
    expect(lerp(10, 20, 1.5)).toBe(25);
  });

  test('같은 시작값과 끝값을 허용한다', () => {
    expect(lerp(7, 7, 4)).toBe(7);
  });
});

describe('math 보간 - inverseLerp', () => {
  test('source range에서 값의 비율을 반환한다', () => {
    expect(inverseLerp(10, 20, 10)).toBe(0);
    expect(inverseLerp(10, 20, 12.5)).toBe(0.25);
    expect(inverseLerp(10, 20, 20)).toBe(1);
  });

  test('반환값을 clamp하지 않는다', () => {
    expect(inverseLerp(10, 20, 5)).toBe(-0.5);
    expect(inverseLerp(10, 20, 25)).toBe(1.5);
  });

  test('뒤집힌 source range와 0-length source range는 RangeError를 던진다', () => {
    expect(() => inverseLerp(20, 10, 15)).toThrow(RangeError);
    expect(() => inverseLerp(10, 10, 10)).toThrow(RangeError);
  });
});

describe('math 보간 - remap', () => {
  test('값을 source range에서 target range로 선형 변환한다', () => {
    expect(remap(5, 0, 10, 100, 200)).toBe(150);
  });

  test('반환값을 clamp하지 않는다', () => {
    expect(remap(-5, 0, 10, 100, 200)).toBe(50);
    expect(remap(15, 0, 10, 100, 200)).toBe(250);
  });

  test('뒤집힌 target range를 허용한다', () => {
    expect(remap(2.5, 0, 10, 100, 0)).toBe(75);
  });

  test('뒤집힌 source range와 0-length source range는 RangeError를 던진다', () => {
    expect(() => remap(5, 10, 0, 100, 200)).toThrow(RangeError);
    expect(() => remap(5, 10, 10, 100, 200)).toThrow(RangeError);
  });
});

describe('math 보간 - percent', () => {
  test('ordered range에서 값의 비율을 반환한다', () => {
    expect(percent(10, 10, 20)).toBe(0);
    expect(percent(12.5, 10, 20)).toBe(0.25);
    expect(percent(20, 10, 20)).toBe(1);
  });

  test('반환값을 clamp하지 않는다', () => {
    expect(percent(5, 10, 20)).toBe(-0.5);
    expect(percent(25, 10, 20)).toBe(1.5);
  });

  test('뒤집힌 range와 0-length range는 RangeError를 던진다', () => {
    expect(() => percent(15, 20, 10)).toThrow(RangeError);
    expect(() => percent(10, 10, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => percent(value, 0, 1)).toThrow(RangeError);
    expect(() => percent(0, value, 1)).toThrow(RangeError);
    expect(() => percent(0, 0, value)).toThrow(RangeError);
  });
});

describe('math 보간 - fromPercent', () => {
  test('비율을 target range의 값으로 변환한다', () => {
    expect(fromPercent(0, 100, 200)).toBe(100);
    expect(fromPercent(0.25, 100, 200)).toBe(125);
    expect(fromPercent(1, 100, 200)).toBe(200);
  });

  test('percent를 clamp하지 않는다', () => {
    expect(fromPercent(-0.5, 100, 200)).toBe(50);
    expect(fromPercent(1.5, 100, 200)).toBe(250);
  });

  test('뒤집힌 target range를 허용한다', () => {
    expect(fromPercent(0.25, 100, 0)).toBe(75);
  });

  test('0-length target range는 유효하며 같은 값을 반환한다', () => {
    expect(fromPercent(4, 7, 7)).toBe(7);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => fromPercent(value, 0, 1)).toThrow(RangeError);
    expect(() => fromPercent(0, value, 1)).toThrow(RangeError);
    expect(() => fromPercent(0, 0, value)).toThrow(RangeError);
  });
});

describe('math 범위 보조 - difference', () => {
  test('두 값 사이의 절대 차이를 반환한다', () => {
    expect(difference(10, 4)).toBe(6);
    expect(difference(4, 10)).toBe(6);
    expect(difference(-3, 5)).toBe(8);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => difference(value, 1)).toThrow(RangeError);
    expect(() => difference(0, value)).toThrow(RangeError);
  });
});

describe('math 범위 보조 - maxAdd', () => {
  test('amount를 더하되 max를 넘지 않는다', () => {
    expect(maxAdd(4, 3, 10)).toBe(7);
    expect(maxAdd(8, 5, 10)).toBe(10);
  });

  test('음수 amount는 그대로 더한다', () => {
    expect(maxAdd(4, -3, 10)).toBe(1);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => maxAdd(value, 1, 10)).toThrow(RangeError);
    expect(() => maxAdd(0, value, 10)).toThrow(RangeError);
    expect(() => maxAdd(0, 1, value)).toThrow(RangeError);
  });
});

describe('math 범위 보조 - minSub', () => {
  test('amount를 빼되 min보다 작아지지 않는다', () => {
    expect(minSub(8, 3, 0)).toBe(5);
    expect(minSub(4, 10, 0)).toBe(0);
  });

  test('음수 amount는 그대로 뺀다', () => {
    expect(minSub(4, -3, 0)).toBe(7);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => minSub(value, 1, 0)).toThrow(RangeError);
    expect(() => minSub(0, value, 0)).toThrow(RangeError);
    expect(() => minSub(0, 1, value)).toThrow(RangeError);
  });
});

describe('math 범위 보조 - smoothMin', () => {
  test('abs(a - b) >= k이면 정확히 min(a, b)를 반환한다', () => {
    expect(smoothMin(2, 10, 3)).toBe(2);
  });

  test('blend 구간에서 polynomial smooth min을 반환한다', () => {
    expect(smoothMin(2, 4, 3)).toBeCloseTo(2 - ((3 - 2) / 3) ** 2 * 3 * 0.25, 12);
  });

  test('a === b이면 a - k * 0.25를 반환한다', () => {
    expect(smoothMin(5, 5, 4)).toBe(4);
  });

  test('최종 결과가 overflow로 non-finite이면 RangeError를 던진다', () => {
    expect(() => smoothMin(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('인자 순서를 바꿔도 같은 값을 반환한다', () => {
    expect(smoothMin(4, 2, 3)).toBe(smoothMin(2, 4, 3));
  });

  test('k <= 0이면 RangeError를 던진다', () => {
    expect(() => smoothMin(2, 4, 0)).toThrow(RangeError);
    expect(() => smoothMin(2, 4, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => smoothMin(value, 4, 3)).toThrow(RangeError);
    expect(() => smoothMin(2, value, 3)).toThrow(RangeError);
    expect(() => smoothMin(2, 4, value)).toThrow(RangeError);
  });
});

describe('math 범위 보조 - smoothMax', () => {
  test('abs(a - b) >= k이면 정확히 max(a, b)를 반환한다', () => {
    expect(smoothMax(2, 10, 3)).toBe(10);
  });

  test('blend 구간에서 polynomial smooth max를 반환한다', () => {
    expect(smoothMax(2, 4, 3)).toBeCloseTo(4 + ((3 - 2) / 3) ** 2 * 3 * 0.25, 12);
  });

  test('a === b이면 a + k * 0.25를 반환한다', () => {
    expect(smoothMax(5, 5, 4)).toBe(6);
  });

  test('최종 결과가 overflow로 non-finite이면 RangeError를 던진다', () => {
    expect(() => smoothMax(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test('인자 순서를 바꿔도 같은 값을 반환한다', () => {
    expect(smoothMax(4, 2, 3)).toBe(smoothMax(2, 4, 3));
  });

  test('k <= 0이면 RangeError를 던진다', () => {
    expect(() => smoothMax(2, 4, 0)).toThrow(RangeError);
    expect(() => smoothMax(2, 4, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => smoothMax(value, 4, 3)).toThrow(RangeError);
    expect(() => smoothMax(2, value, 3)).toThrow(RangeError);
    expect(() => smoothMax(2, 4, value)).toThrow(RangeError);
  });
});
