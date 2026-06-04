import { describe, expect, test } from 'vitest';
import * as easing from '../../../src/easing';
import { constant } from '../../../src/easing/constant';
import { hold } from '../../../src/easing/hold';
import { linear } from '../../../src/easing/linear';
import { smootherstep } from '../../../src/easing/smootherstep';
import { smoothstep } from '../../../src/easing/smoothstep';
import { step } from '../../../src/easing/step';
import { steps } from '../../../src/easing/steps';
import { nonFiniteValues } from './easing-test-helpers';

describe('easing - linear', () => {
  test('t를 그대로 반환한다', () => {
    expect(linear(0)).toBe(0);
    expect(linear(1)).toBe(1);
    expect(linear(0.5)).toBe(0.5);
    expect(linear(0.25)).toBe(0.25);
    expect(linear(0.75)).toBe(0.75);
  });

  test('범위 밖 t도 그대로 반환한다', () => {
    expect(linear(-0.5)).toBe(-0.5);
    expect(linear(1.5)).toBe(1.5);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => linear(value)).toThrow(RangeError);
  });
});

describe('easing - constant', () => {
  test('value 기본값 0을 반환한다', () => {
    expect(constant(0)).toBe(0);
    expect(constant(0.5)).toBe(0);
    expect(constant(1)).toBe(0);
  });

  test('명시한 value를 t와 무관하게 반환한다', () => {
    expect(constant(0, 3)).toBe(3);
    expect(constant(0.5, 3)).toBe(3);
    expect(constant(1, 3)).toBe(3);
    expect(constant(0, -1)).toBe(-1);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => constant(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite value %s는 RangeError를 던진다', (value) => {
    expect(() => constant(0, value)).toThrow(RangeError);
  });
});

describe('easing - hold', () => {
  test('threshold 기본값 0.5 기준으로 0 또는 1을 반환한다', () => {
    expect(hold(0)).toBe(0);
    expect(hold(0.49)).toBe(0);
    expect(hold(0.5)).toBe(1);
    expect(hold(1)).toBe(1);
  });

  test('명시한 threshold 기준으로 동작한다', () => {
    expect(hold(0.3, 0.3)).toBe(1);
    expect(hold(0.29, 0.3)).toBe(0);
    expect(hold(0, 0)).toBe(1);
  });

  test('범위 밖 t도 처리한다 (clamp하지 않음)', () => {
    expect(hold(-0.1)).toBe(0);
    expect(hold(1.1)).toBe(1);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => hold(value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('비finite threshold %s는 RangeError를 던진다', (value) => {
    expect(() => hold(0, value)).toThrow(RangeError);
  });
});

describe('easing - step', () => {
  test('steps=4일 때 계단형 값을 반환한다', () => {
    expect(step(0, 4)).toBe(0);
    expect(step(0.24, 4)).toBe(0);
    expect(step(0.25, 4)).toBe(0.25);
    expect(step(0.5, 4)).toBe(0.5);
    expect(step(0.75, 4)).toBe(0.75);
  });

  test('t === 1에서 정확히 1을 반환한다 (endpoint 보장)', () => {
    expect(step(1, 4)).toBe(1);
    expect(step(1, 1)).toBe(1);
    expect(step(1, 10)).toBe(1);
  });

  test('steps=1일 때 0 또는 1을 반환한다', () => {
    expect(step(0, 1)).toBe(0);
    expect(step(0.99, 1)).toBe(0);
    expect(step(1, 1)).toBe(1);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => step(value, 4)).toThrow(RangeError);
  });

  test('steps가 양의 정수가 아니면 RangeError를 던진다', () => {
    expect(() => step(0.5, 0)).toThrow(RangeError);
    expect(() => step(0.5, -1)).toThrow(RangeError);
    expect(() => step(0.5, 1.5)).toThrow(RangeError);
    expect(() => step(0.5, Number.NaN)).toThrow(RangeError);
  });
});

describe('easing - steps', () => {
  test('direction="end" (기본값)이면 구간 끝에서 계단이 올라간다', () => {
    expect(steps(0, 4)).toBe(0);
    expect(steps(0.24, 4)).toBe(0);
    expect(steps(0.25, 4)).toBe(0.25);
    expect(steps(0.5, 4)).toBe(0.5);
    expect(steps(0.75, 4)).toBe(0.75);
  });

  test('direction="start"이면 구간 시작에서 계단이 올라간다', () => {
    expect(steps(0, 4, 'start')).toBe(0);
    expect(steps(0.01, 4, 'start')).toBe(0.25);
    expect(steps(0.25, 4, 'start')).toBe(0.25);
    expect(steps(0.26, 4, 'start')).toBe(0.5);
  });

  test('direction="end" 명시 시 기본값과 동일하다', () => {
    expect(steps(0.5, 4, 'end')).toBe(steps(0.5, 4));
  });

  test('t === 1에서 정확히 1을 반환한다', () => {
    expect(steps(1, 4)).toBe(1);
    expect(steps(1, 4, 'start')).toBe(1);
    expect(steps(1, 1)).toBe(1);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => steps(value, 4)).toThrow(RangeError);
  });

  test('count가 양의 정수가 아니면 RangeError를 던진다', () => {
    expect(() => steps(0.5, 0)).toThrow(RangeError);
    expect(() => steps(0.5, -1)).toThrow(RangeError);
    expect(() => steps(0.5, 1.5)).toThrow(RangeError);
  });

  test('invalid direction은 RangeError를 던진다', () => {
    // @ts-expect-error 의도적으로 잘못된 direction 전달
    expect(() => steps(0.5, 4, 'middle')).toThrow(RangeError);
  });
});

describe('easing - smoothstep', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(smoothstep(0.5)).toBe(0.5);
  });

  test('대표 값이 수식과 일치한다', () => {
    const t = 0.25;
    expect(smoothstep(t)).toBe(t * t * (3 - 2 * t));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => smoothstep(value)).toThrow(RangeError);
  });
});

describe('easing - smootherstep', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(smootherstep(0.5)).toBe(0.5);
  });

  test('대표 값이 수식과 일치한다', () => {
    const t = 0.25;
    expect(smootherstep(t)).toBe(t * t * t * (t * (t * 6 - 15) + 10));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => smootherstep(value)).toThrow(RangeError);
  });
});

describe('easing barrel - 모든 함수가 export된다', () => {
  test('basic 함수가 barrel에서 export된다', () => {
    expect(typeof easing.linear).toBe('function');
    expect(typeof easing.constant).toBe('function');
    expect(typeof easing.hold).toBe('function');
    expect(typeof easing.step).toBe('function');
    expect(typeof easing.steps).toBe('function');
    expect(typeof easing.smoothstep).toBe('function');
    expect(typeof easing.smootherstep).toBe('function');
  });

  test('polynomial 함수가 barrel에서 export된다', () => {
    expect(typeof easing.powerIn).toBe('function');
    expect(typeof easing.powerOut).toBe('function');
    expect(typeof easing.powerInOut).toBe('function');
    expect(typeof easing.quadIn).toBe('function');
    expect(typeof easing.quadOut).toBe('function');
    expect(typeof easing.quadInOut).toBe('function');
    expect(typeof easing.cubicIn).toBe('function');
    expect(typeof easing.cubicOut).toBe('function');
    expect(typeof easing.cubicInOut).toBe('function');
    expect(typeof easing.quartIn).toBe('function');
    expect(typeof easing.quartOut).toBe('function');
    expect(typeof easing.quartInOut).toBe('function');
    expect(typeof easing.quintIn).toBe('function');
    expect(typeof easing.quintOut).toBe('function');
    expect(typeof easing.quintInOut).toBe('function');
  });

  test('trig/expo/circ 함수가 barrel에서 export된다', () => {
    expect(typeof easing.sineIn).toBe('function');
    expect(typeof easing.sineOut).toBe('function');
    expect(typeof easing.sineInOut).toBe('function');
    expect(typeof easing.expoIn).toBe('function');
    expect(typeof easing.expoOut).toBe('function');
    expect(typeof easing.expoInOut).toBe('function');
    expect(typeof easing.circIn).toBe('function');
    expect(typeof easing.circOut).toBe('function');
    expect(typeof easing.circInOut).toBe('function');
  });

  test('back/bounce/elastic 함수가 barrel에서 export된다', () => {
    expect(typeof easing.backIn).toBe('function');
    expect(typeof easing.backOut).toBe('function');
    expect(typeof easing.backInOut).toBe('function');
    expect(typeof easing.bounceIn).toBe('function');
    expect(typeof easing.bounceOut).toBe('function');
    expect(typeof easing.bounceInOut).toBe('function');
    expect(typeof easing.elasticIn).toBe('function');
    expect(typeof easing.elasticOut).toBe('function');
    expect(typeof easing.elasticInOut).toBe('function');
  });
});
