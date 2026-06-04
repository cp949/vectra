import { describe, expect, test } from 'vitest';
import { clampedLerp } from '../../../src/interpolation/clamped-lerp';
import { clampedLerpByElapsed } from '../../../src/interpolation/clamped-lerp-by-elapsed';
import { inverseLerp, inverseLerpClamped } from '../../../src/interpolation/inverse-lerp';
import { lerpByElapsed } from '../../../src/interpolation/lerp-by-elapsed';
import { moveToward } from '../../../src/interpolation/move-toward';
import { progressByElapsed } from '../../../src/interpolation/progress-by-elapsed';
import { remap, remapClamped } from '../../../src/interpolation/remap';
import { mix, unclampedLerp } from '../../../src/interpolation/unclamped-lerp';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('interpolation 선형 보간 - unclampedLerp', () => {
  test('두 값 사이의 선형 보간값을 반환한다', () => {
    expect(unclampedLerp(10, 20, 0)).toBe(10);
    expect(unclampedLerp(10, 20, 0.5)).toBe(15);
    expect(unclampedLerp(10, 20, 1)).toBe(20);
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    expect(unclampedLerp(10, 20, -0.5)).toBe(5);
    expect(unclampedLerp(10, 20, 1.5)).toBe(25);
  });

  test('같은 시작값과 끝값을 허용한다', () => {
    expect(unclampedLerp(7, 7, 4)).toBe(7);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => unclampedLerp(value, 1, 0.5)).toThrow(RangeError);
    expect(() => unclampedLerp(0, value, 0.5)).toThrow(RangeError);
    expect(() => unclampedLerp(0, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation 선형 보간 - mix (unclampedLerp alias)', () => {
  test('unclampedLerp와 동일한 representative values를 반환한다', () => {
    expect(mix(10, 20, 0)).toBe(unclampedLerp(10, 20, 0));
    expect(mix(10, 20, 0.5)).toBe(unclampedLerp(10, 20, 0.5));
    expect(mix(10, 20, 1)).toBe(unclampedLerp(10, 20, 1));
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    expect(mix(10, 20, -0.5)).toBe(5);
    expect(mix(10, 20, 1.5)).toBe(25);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => mix(value, 1, 0.5)).toThrow(RangeError);
    expect(() => mix(0, value, 0.5)).toThrow(RangeError);
    expect(() => mix(0, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation 선형 보간 - clampedLerp', () => {
  test('두 값 사이의 선형 보간값을 반환한다', () => {
    expect(clampedLerp(10, 20, 0)).toBe(10);
    expect(clampedLerp(10, 20, 0.5)).toBe(15);
    expect(clampedLerp(10, 20, 1)).toBe(20);
  });

  test('t < 0이면 a를 반환한다 (t-clamp)', () => {
    // t-clamp 방식: t를 [0,1]로 clamp 후 lerp한다
    // result가 endpoint를 넘지 않는다
    expect(clampedLerp(10, 20, -0.5)).toBe(10);
    expect(clampedLerp(10, 20, -100)).toBe(10);
  });

  test('t > 1이면 b를 반환한다 (t-clamp)', () => {
    expect(clampedLerp(10, 20, 1.5)).toBe(20);
    expect(clampedLerp(10, 20, 100)).toBe(20);
  });

  test('뒤집힌 범위에서도 t-clamp가 올바르게 동작한다', () => {
    // a > b 케이스: t=0이면 a, t=1이면 b
    expect(clampedLerp(20, 10, -0.5)).toBe(20);
    expect(clampedLerp(20, 10, 1.5)).toBe(10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => clampedLerp(value, 1, 0.5)).toThrow(RangeError);
    expect(() => clampedLerp(0, value, 0.5)).toThrow(RangeError);
    expect(() => clampedLerp(0, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation 역보간 - inverseLerp', () => {
  test('source range에서 값의 비율을 반환한다', () => {
    expect(inverseLerp(10, 20, 10)).toBe(0);
    expect(inverseLerp(10, 20, 15)).toBe(0.5);
    expect(inverseLerp(10, 20, 20)).toBe(1);
  });

  test('반환값을 clamp하지 않는다', () => {
    expect(inverseLerp(10, 20, 5)).toBe(-0.5);
    expect(inverseLerp(10, 20, 25)).toBe(1.5);
  });

  test('zero-range는 RangeError를 던진다', () => {
    expect(() => inverseLerp(10, 10, 10)).toThrow(RangeError);
  });

  test('역방향 range는 RangeError를 던진다', () => {
    expect(() => inverseLerp(20, 10, 15)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => inverseLerp(value, 1, 0.5)).toThrow(RangeError);
    expect(() => inverseLerp(0, value, 0.5)).toThrow(RangeError);
    expect(() => inverseLerp(0, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation 역보간 - inverseLerpClamped', () => {
  test('source range 안의 값은 inverseLerp와 동일한 결과를 반환한다', () => {
    expect(inverseLerpClamped(10, 20, 10)).toBe(0);
    expect(inverseLerpClamped(10, 20, 15)).toBe(0.5);
    expect(inverseLerpClamped(10, 20, 20)).toBe(1);
  });

  test('source range 아래 값은 0으로 clamp된다', () => {
    expect(inverseLerpClamped(10, 20, 5)).toBe(0);
    expect(inverseLerpClamped(10, 20, -100)).toBe(0);
  });

  test('source range 위의 값은 1로 clamp된다', () => {
    expect(inverseLerpClamped(10, 20, 25)).toBe(1);
    expect(inverseLerpClamped(10, 20, 1000)).toBe(1);
  });

  test('zero-range는 RangeError를 던진다', () => {
    expect(() => inverseLerpClamped(10, 10, 10)).toThrow(RangeError);
  });

  test('역방향 range는 RangeError를 던진다', () => {
    expect(() => inverseLerpClamped(20, 10, 15)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => inverseLerpClamped(value, 1, 0.5)).toThrow(RangeError);
    expect(() => inverseLerpClamped(0, value, 0.5)).toThrow(RangeError);
    expect(() => inverseLerpClamped(0, 1, value)).toThrow(RangeError);
  });
});

describe('interpolation 범위 변환 - remap', () => {
  test('값을 source range에서 target range로 선형 변환한다', () => {
    expect(remap(5, 0, 10, 100, 200)).toBe(150);
    expect(remap(0, 0, 10, 100, 200)).toBe(100);
    expect(remap(10, 0, 10, 100, 200)).toBe(200);
  });

  test('반환값을 clamp하지 않는다', () => {
    expect(remap(-5, 0, 10, 100, 200)).toBe(50);
    expect(remap(15, 0, 10, 100, 200)).toBe(250);
  });

  test('뒤집힌 target range를 허용한다', () => {
    expect(remap(2.5, 0, 10, 100, 0)).toBe(75);
  });

  test('zero-range source는 RangeError를 던진다', () => {
    expect(() => remap(5, 10, 10, 100, 200)).toThrow(RangeError);
  });

  test('역방향 source range는 RangeError를 던진다', () => {
    expect(() => remap(5, 10, 0, 100, 200)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => remap(value, 0, 1, 0, 10)).toThrow(RangeError);
    expect(() => remap(0, value, 1, 0, 10)).toThrow(RangeError);
    expect(() => remap(0, 0, value, 0, 10)).toThrow(RangeError);
    expect(() => remap(0, 0, 1, value, 10)).toThrow(RangeError);
    expect(() => remap(0, 0, 1, 0, value)).toThrow(RangeError);
  });
});

describe('interpolation 범위 변환 - remapClamped', () => {
  test('source range 안의 값은 remap과 동일한 결과를 반환한다', () => {
    expect(remapClamped(5, 0, 10, 100, 200)).toBe(150);
    expect(remapClamped(0, 0, 10, 100, 200)).toBe(100);
    expect(remapClamped(10, 0, 10, 100, 200)).toBe(200);
  });

  test('source range 아래 값은 fromMin으로 clamp 후 remap된다 (source-clamp)', () => {
    // -5는 0으로 clamp → remap(0, 0, 10, 100, 200) = 100
    expect(remapClamped(-5, 0, 10, 100, 200)).toBe(100);
  });

  test('source range 위의 값은 fromMax로 clamp 후 remap된다 (source-clamp)', () => {
    // 15는 10으로 clamp → remap(10, 0, 10, 100, 200) = 200
    expect(remapClamped(15, 0, 10, 100, 200)).toBe(200);
  });

  test('뒤집힌 target range를 허용한다', () => {
    expect(remapClamped(2.5, 0, 10, 100, 0)).toBe(75);
  });

  test('zero-range source는 RangeError를 던진다', () => {
    expect(() => remapClamped(5, 10, 10, 100, 200)).toThrow(RangeError);
  });

  test('역방향 source range는 RangeError를 던진다', () => {
    expect(() => remapClamped(5, 10, 0, 100, 200)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => remapClamped(value, 0, 1, 0, 10)).toThrow(RangeError);
    expect(() => remapClamped(0, value, 1, 0, 10)).toThrow(RangeError);
    expect(() => remapClamped(0, 0, value, 0, 10)).toThrow(RangeError);
    expect(() => remapClamped(0, 0, 1, value, 10)).toThrow(RangeError);
    expect(() => remapClamped(0, 0, 1, 0, value)).toThrow(RangeError);
  });
});

describe('interpolation 목표 이동 - moveToward', () => {
  test('남은 거리가 maxDelta 이하이면 target을 반환한다', () => {
    expect(moveToward(10, 20, 15)).toBe(20);
    expect(moveToward(10, 20, 10)).toBe(20);
  });

  test('남은 거리가 maxDelta보다 크면 maxDelta만큼 이동한다', () => {
    expect(moveToward(10, 20, 5)).toBe(15);
    expect(moveToward(20, 10, 5)).toBe(15);
  });

  test('current > target일 때 target 방향(감소)으로 이동한다', () => {
    expect(moveToward(20, 10, 3)).toBe(17);
  });

  test('current === target이면 current를 반환한다', () => {
    expect(moveToward(5, 5, 10)).toBe(5);
  });

  test('maxDelta === 0은 유효하며 current를 반환한다', () => {
    expect(moveToward(10, 20, 0)).toBe(10);
  });

  test('음수 maxDelta는 RangeError를 던진다', () => {
    expect(() => moveToward(10, 20, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 current %s는 RangeError를 던진다', (value) => {
    expect(() => moveToward(value, 20, 5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 target %s는 RangeError를 던진다', (value) => {
    expect(() => moveToward(10, value, 5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 maxDelta %s는 RangeError를 던진다', (value) => {
    expect(() => moveToward(10, 20, value)).toThrow(RangeError);
  });
});

describe('interpolation elapsed-time - progressByElapsed', () => {
  test('elapsed/duration 비율을 반환한다', () => {
    expect(progressByElapsed(0, 10)).toBe(0);
    expect(progressByElapsed(5, 10)).toBe(0.5);
    expect(progressByElapsed(10, 10)).toBe(1);
  });

  test('progress를 [0, 1]로 clamp한다', () => {
    expect(progressByElapsed(-5, 10)).toBe(0);
    expect(progressByElapsed(15, 10)).toBe(1);
    expect(progressByElapsed(-1000, 10)).toBe(0);
    expect(progressByElapsed(1000, 10)).toBe(1);
  });

  test('duration <= 0은 RangeError를 던진다', () => {
    expect(() => progressByElapsed(5, 0)).toThrow(RangeError);
    expect(() => progressByElapsed(5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 elapsed %s는 RangeError를 던진다', (value) => {
    expect(() => progressByElapsed(value, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 duration %s는 RangeError를 던진다', (value) => {
    expect(() => progressByElapsed(5, value)).toThrow(RangeError);
  });
});

describe('interpolation elapsed-time - clampedLerpByElapsed', () => {
  test('elapsed progress로 a와 b 사이를 보간한다', () => {
    expect(clampedLerpByElapsed(10, 20, 5, 10)).toBe(15);
    expect(clampedLerpByElapsed(10, 20, 0, 10)).toBe(10);
    expect(clampedLerpByElapsed(10, 20, 10, 10)).toBe(20);
  });

  test('negative elapsed는 a, over-duration elapsed는 b를 반환한다 (progress clamp)', () => {
    expect(clampedLerpByElapsed(10, 20, -5, 10)).toBe(10);
    expect(clampedLerpByElapsed(10, 20, 15, 10)).toBe(20);
  });

  test('a > b에서도 endpoint 정책을 유지한다', () => {
    expect(clampedLerpByElapsed(20, 10, -5, 10)).toBe(20);
    expect(clampedLerpByElapsed(20, 10, 15, 10)).toBe(10);
  });

  test('duration <= 0은 RangeError를 던진다', () => {
    expect(() => clampedLerpByElapsed(10, 20, 5, 0)).toThrow(RangeError);
    expect(() => clampedLerpByElapsed(10, 20, 5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 a %s는 RangeError를 던진다', (value) => {
    expect(() => clampedLerpByElapsed(value, 20, 5, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b %s는 RangeError를 던진다', (value) => {
    expect(() => clampedLerpByElapsed(10, value, 5, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 elapsed %s는 RangeError를 던진다', (value) => {
    expect(() => clampedLerpByElapsed(10, 20, value, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 duration %s는 RangeError를 던진다', (value) => {
    expect(() => clampedLerpByElapsed(10, 20, 5, value)).toThrow(RangeError);
  });
});

describe('interpolation elapsed-time - lerpByElapsed', () => {
  test('raw elapsed progress로 a와 b 사이를 보간한다', () => {
    expect(lerpByElapsed(10, 20, 5, 10)).toBe(15);
    expect(lerpByElapsed(10, 20, 0, 10)).toBe(10);
    expect(lerpByElapsed(10, 20, 10, 10)).toBe(20);
  });

  test('progress를 clamp하지 않고 extrapolation을 허용한다', () => {
    expect(lerpByElapsed(10, 20, -5, 10)).toBe(5);
    expect(lerpByElapsed(10, 20, 15, 10)).toBe(25);
  });

  test('duration <= 0은 RangeError를 던진다', () => {
    expect(() => lerpByElapsed(10, 20, 5, 0)).toThrow(RangeError);
    expect(() => lerpByElapsed(10, 20, 5, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 a %s는 RangeError를 던진다', (value) => {
    expect(() => lerpByElapsed(value, 20, 5, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 b %s는 RangeError를 던진다', (value) => {
    expect(() => lerpByElapsed(10, value, 5, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 elapsed %s는 RangeError를 던진다', (value) => {
    expect(() => lerpByElapsed(10, 20, value, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 duration %s는 RangeError를 던진다', (value) => {
    expect(() => lerpByElapsed(10, 20, 5, value)).toThrow(RangeError);
  });
});
