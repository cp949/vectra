/**
 * calculus numeric sequence helper unit test.
 *
 * linspace(Into) — endpoint true/false, binCount 0/1/2+, descending range, equal endpoints,
 *   invalid scalar/count/options, non-finite intermediate (span/step), `-0` canonicalize,
 *   `out` atomicity (success truncate / failure preserve).
 * steps(Into) — positive/negative/zero step, count 0/1/N, invalid scalar/count, non-finite intermediate,
 *   `-0` canonicalize, `out` atomicity.
 * range(Into) — default step, positive/negative step, direction mismatch, fractional step,
 *   stop-exclusive boundary, invalid scalar/zero step, safe-count overflow, non-finite intermediate,
 *   `-0` canonicalize, `out` atomicity.
 */

import { describe, expect, test } from 'vitest';
import { linspace } from '../../../src/calculus/linspace';
import { linspaceInto } from '../../../src/calculus/linspace-into';
import { range } from '../../../src/calculus/range';
import { rangeInto } from '../../../src/calculus/range-into';
import { steps } from '../../../src/calculus/steps';
import { stepsInto } from '../../../src/calculus/steps-into';

// ---------------------------------------------------------------------------
// linspaceInto / linspace
// ---------------------------------------------------------------------------

describe('linspaceInto — 균등 sample 생성 (Into)', () => {
  test('endpoint 기본값(true)으로 양 끝점을 포함한 5개 sample을 생성한다', () => {
    const out: number[] = [];
    const result = linspaceInto(out, 0, 1, 5);
    expect(result).toBe(out);
    expect(out).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test('endpoint: false이면 마지막 entry로 xMax를 포함하지 않는다', () => {
    expect(linspaceInto([], 0, 1, 4, { endpoint: false })).toEqual([0, 0.25, 0.5, 0.75]);
  });

  test('endpoint: true와 binCount 2는 양 끝점만 반환한다', () => {
    expect(linspaceInto([], 0, 1, 2)).toEqual([0, 1]);
  });

  test('binCount 0은 빈 sequence를 반환한다', () => {
    expect(linspaceInto([], 0, 1, 0)).toEqual([]);
  });

  test('binCount 1은 endpoint 옵션과 무관하게 [xMin]을 반환한다', () => {
    expect(linspaceInto([], 5, 10, 1)).toEqual([5]);
    expect(linspaceInto([], 5, 10, 1, { endpoint: false })).toEqual([5]);
    expect(linspaceInto([], 5, 10, 1, { endpoint: true })).toEqual([5]);
  });

  test('descending range도 균등 간격을 유지한다', () => {
    expect(linspaceInto([], 1, 0, 5)).toEqual([1, 0.75, 0.5, 0.25, 0]);
  });

  test('xMin === xMax이면 모든 entry가 같은 값이다', () => {
    expect(linspaceInto([], 7, 7, 4)).toEqual([7, 7, 7, 7]);
  });

  test('endpoint: true에서 마지막 entry는 산식이 아니라 xMax를 직접 기록한다', () => {
    // 0.1 * 10 !== 1.0 in float64 — endpoint 직접 기록으로 drift를 막는다
    const result = linspaceInto([], 0, 1, 11);
    expect(result[10]).toBe(1);
    expect(result[0]).toBe(0);
  });

  test('성공 시 out의 기존 entry를 truncate한다', () => {
    const out: number[] = [99, 99, 99, 99, 99, 99];
    linspaceInto(out, 0, 1, 3);
    expect(out).toEqual([0, 0.5, 1]);
    expect(out).toHaveLength(3);
  });

  test('endpoint: false에서 binCount === 2는 [xMin, xMin + (xMax-xMin)/2]', () => {
    expect(linspaceInto([], 0, 1, 2, { endpoint: false })).toEqual([0, 0.5]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'xMin %s는 RangeError를 던지고 out을 수정하지 않는다',
    (xMin) => {
      const out: number[] = [9, 9];
      expect(() => linspaceInto(out, xMin, 1, 4)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'xMax %s는 RangeError를 던지고 out을 수정하지 않는다',
    (xMax) => {
      const out: number[] = [9, 9];
      expect(() => linspaceInto(out, 0, xMax, 4)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'binCount %s는 RangeError를 던지고 out을 수정하지 않는다',
    (binCount) => {
      const out: number[] = [9, 9];
      expect(() => linspaceInto(out, 0, 1, binCount)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test('xMax - xMin overflow는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    expect(() => linspaceInto(out, -Number.MAX_VALUE, Number.MAX_VALUE, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('결과의 -0은 0으로 canonicalize된다', () => {
    // descending sequence(xMin > xMax > 0)에서 step < 0이라도 i === 0 위치의 xMin === 0은
    // canonicalize 대상이다. -0 입력도 0으로 기록한다.
    const result = linspaceInto([], 0, -1, 2);
    expect(result).toEqual([0, -1]);
    expect(Object.is(result[0], 0)).toBe(true);

    const fromNegativeZero = linspaceInto([], -0, 1, 3);
    expect(Object.is(fromNegativeZero[0], 0)).toBe(true);

    // xMin === xMax === -0이면 endpoint anchor(i=0, lastIndex)와 loop body 모두 -0 후보다.
    // 모든 index에서 +0이 기록되어야 한다.
    const allNegZero = linspaceInto([], -0, -0, 4);
    for (const v of allNegZero) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});

describe('linspace — 균등 sample 생성', () => {
  test('새 배열을 반환한다', () => {
    const result = linspace(0, 1, 5);
    expect(result).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test('endpoint: false 옵션을 그대로 전달한다', () => {
    expect(linspace(0, 1, 4, { endpoint: false })).toEqual([0, 0.25, 0.5, 0.75]);
  });

  test('invalid input은 RangeError를 던진다', () => {
    expect(() => linspace(Number.NaN, 1, 4)).toThrow(RangeError);
    expect(() => linspace(0, 1, -1)).toThrow(RangeError);
  });

  test('binCount 0은 새 빈 배열을 반환한다', () => {
    expect(linspace(0, 1, 0)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// stepsInto / steps
// ---------------------------------------------------------------------------

describe('stepsInto — start + step * index sequence (Into)', () => {
  test('positive step으로 count개의 entry를 기록한다', () => {
    expect(stepsInto([], 0, 2, 4)).toEqual([0, 2, 4, 6]);
  });

  test('negative step으로 감소 sequence를 기록한다', () => {
    expect(stepsInto([], 10, -3, 4)).toEqual([10, 7, 4, 1]);
  });

  test('step === 0이면 모든 entry가 start와 같다', () => {
    expect(stepsInto([], 5, 0, 3)).toEqual([5, 5, 5]);
  });

  test('count 0은 빈 sequence를 반환한다', () => {
    expect(stepsInto([], 1, 1, 0)).toEqual([]);
  });

  test('count 1은 [start]를 반환한다', () => {
    expect(stepsInto([], 7, 100, 1)).toEqual([7]);
  });

  test('성공 시 out의 기존 entry를 truncate한다', () => {
    const out: number[] = [99, 99, 99, 99, 99];
    stepsInto(out, 0, 1, 3);
    expect(out).toEqual([0, 1, 2]);
    expect(out).toHaveLength(3);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'start %s는 RangeError를 던지고 out을 수정하지 않는다',
    (start) => {
      const out: number[] = [9, 9];
      expect(() => stepsInto(out, start, 1, 3)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'step %s는 RangeError를 던지고 out을 수정하지 않는다',
    (step) => {
      const out: number[] = [9, 9];
      expect(() => stepsInto(out, 0, step, 3)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'count %s는 RangeError를 던지고 out을 수정하지 않는다',
    (count) => {
      const out: number[] = [9, 9];
      expect(() => stepsInto(out, 0, 1, count)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test('start + step * index overflow는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    expect(() => stepsInto(out, Number.MAX_VALUE, Number.MAX_VALUE, 4)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('결과의 -0은 0으로 canonicalize된다', () => {
    // start === -0이면 i === 0 entry로 그대로 -0이 들어가지 않아야 한다.
    const result = stepsInto([], -0, 0, 3);
    expect(result).toEqual([0, 0, 0]);
    expect(Object.is(result[0], 0)).toBe(true);

    // start === step === -0이면 모든 loop body entry가 -0 + -0*i = -0 후보다.
    // 모든 index에서 +0이 기록되어야 한다.
    const allNegZero = stepsInto([], -0, -0, 4);
    for (const v of allNegZero) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});

describe('steps — start + step * index sequence', () => {
  test('새 배열을 반환한다', () => {
    expect(steps(0, 2, 4)).toEqual([0, 2, 4, 6]);
  });

  test('invalid input은 RangeError를 던진다', () => {
    expect(() => steps(Number.NaN, 1, 3)).toThrow(RangeError);
    expect(() => steps(0, 1, -1)).toThrow(RangeError);
  });

  test('count 0은 새 빈 배열을 반환한다', () => {
    expect(steps(1, 1, 0)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// rangeInto / range
// ---------------------------------------------------------------------------

describe('rangeInto — half-open stop-exclusive sequence (Into)', () => {
  test('default step(1)로 range(0, 4)는 [0, 1, 2, 3]', () => {
    const out: number[] = [];
    const result = rangeInto(out, 0, 4);
    expect(result).toBe(out);
    expect(out).toEqual([0, 1, 2, 3]);
  });

  test('positive step으로 range(1, 6, 2)는 [1, 3, 5]', () => {
    expect(rangeInto([], 1, 6, 2)).toEqual([1, 3, 5]);
  });

  test('negative step으로 range(5, 0, -2)는 [5, 3, 1]', () => {
    expect(rangeInto([], 5, 0, -2)).toEqual([5, 3, 1]);
  });

  test('step > 0인데 start >= stop이면 빈 sequence', () => {
    expect(rangeInto([], 5, 0, 1)).toEqual([]);
    expect(rangeInto([], 3, 3, 1)).toEqual([]);
  });

  test('step < 0인데 start <= stop이면 빈 sequence', () => {
    expect(rangeInto([], 0, 5, -1)).toEqual([]);
    expect(rangeInto([], 2, 2, -1)).toEqual([]);
  });

  test('stop은 결과에 포함하지 않는다 (exact divisible boundary)', () => {
    expect(rangeInto([], 0, 4, 2)).toEqual([0, 2]);
    expect(rangeInto([], 0, 6, 2)).toEqual([0, 2, 4]);
  });

  test('fractional step도 허용한다 (toBeCloseTo로 float drift 허용)', () => {
    const result = rangeInto([], 0, 1, 0.25);
    expect(result).toHaveLength(4);
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(0.25);
    expect(result[2]).toBeCloseTo(0.5);
    expect(result[3]).toBeCloseTo(0.75);
  });

  test('non-representable step도 stop-exclusive를 유지한다 (ceil-down)', () => {
    // 0.3 / 0.1 = 2.9999999999999996(fp drift) → Math.ceil → 3
    // entries[2] = 0.1*2 = 0.2 < 0.3 ✓
    const result = rangeInto([], 0, 0.3, 0.1);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(0.1);
    expect(result[2]).toBeCloseTo(0.2);
    for (const v of result) {
      expect(v).toBeLessThan(0.3);
    }
  });

  test('non-representable step의 ceil-up overshoot은 잘려나간다', () => {
    // (0.4 - 0.1) / 0.1 = 3.0000000000000004(fp drift) → Math.ceil → 4
    // 산식 entries[3] = 0.1 + 0.1*3 = 0.4(== stop)이므로 stop-exclusive 정책으로 잘려나가 3개만 남는다.
    const result = rangeInto([], 0.1, 0.4, 0.1);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[1]).toBeCloseTo(0.2);
    expect(result[2]).toBeCloseTo(0.3);
    for (const v of result) {
      expect(v).toBeLessThan(0.4);
    }
  });

  test('negative step의 fp drift overshoot도 잘려나간다', () => {
    // (-0.4 - -0.1) / -0.1 = 3.0000000000000004 → ceil → 4
    // 산식 entries[3] = -0.1 + -0.1*3 = -0.4(== stop)이므로 stop-exclusive로 잘려나가 3개만 남는다.
    const result = rangeInto([], -0.1, -0.4, -0.1);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(-0.1);
    expect(result[1]).toBeCloseTo(-0.2);
    expect(result[2]).toBeCloseTo(-0.3);
    for (const v of result) {
      expect(v).toBeGreaterThan(-0.4);
    }
  });

  test('성공 시 out의 기존 entry를 truncate한다', () => {
    const out: number[] = [99, 99, 99, 99, 99];
    rangeInto(out, 0, 3);
    expect(out).toEqual([0, 1, 2]);
    expect(out).toHaveLength(3);
  });

  test('step === 0은 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    expect(() => rangeInto(out, 0, 5, 0)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'start %s는 RangeError를 던지고 out을 수정하지 않는다',
    (start) => {
      const out: number[] = [9, 9];
      expect(() => rangeInto(out, start, 5)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'stop %s는 RangeError를 던지고 out을 수정하지 않는다',
    (stop) => {
      const out: number[] = [9, 9];
      expect(() => rangeInto(out, 0, stop)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'step %s는 RangeError를 던지고 out을 수정하지 않는다',
    (step) => {
      const out: number[] = [9, 9];
      expect(() => rangeInto(out, 0, 5, step)).toThrow(RangeError);
      expect(out).toEqual([9, 9]);
    }
  );

  test('safe-integer를 넘는 count는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    // (Number.MAX_VALUE - 0) / 1 → ceil → not a safe integer
    expect(() => rangeInto(out, 0, Number.MAX_VALUE, 1)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('stop - start overflow는 RangeError이며 out을 수정하지 않는다', () => {
    const out: number[] = [9, 9];
    expect(() => rangeInto(out, -Number.MAX_VALUE, Number.MAX_VALUE, 1)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('결과의 -0은 0으로 canonicalize된다', () => {
    // start === -0, default step(1) → i === 0의 자연 산식은 +0이지만 정책상 +0 단정.
    const result = rangeInto([], -0, 3);
    expect(result).toEqual([0, 1, 2]);
    expect(Object.is(result[0], 0)).toBe(true);

    // step < 0과 start === -0의 조합은 i === 0에서 -0 + -0 = -0이 자연스럽게 발생한다.
    // canonicalize가 동작해 +0이 기록되어야 한다.
    const negStep = rangeInto([], -0, -3, -1);
    expect(negStep).toEqual([0, -1, -2]);
    expect(Object.is(negStep[0], 0)).toBe(true);
  });
});

describe('range — half-open stop-exclusive sequence', () => {
  test('새 배열을 반환한다', () => {
    expect(range(0, 4)).toEqual([0, 1, 2, 3]);
  });

  test('positive step', () => {
    expect(range(1, 6, 2)).toEqual([1, 3, 5]);
  });

  test('negative step', () => {
    expect(range(5, 0, -2)).toEqual([5, 3, 1]);
  });

  test('direction mismatch는 빈 배열', () => {
    expect(range(5, 0, 1)).toEqual([]);
    expect(range(0, 5, -1)).toEqual([]);
  });

  test('step === 0은 RangeError', () => {
    expect(() => range(0, 5, 0)).toThrow(RangeError);
  });

  test('invalid scalar는 RangeError', () => {
    expect(() => range(Number.NaN, 5)).toThrow(RangeError);
    expect(() => range(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});
