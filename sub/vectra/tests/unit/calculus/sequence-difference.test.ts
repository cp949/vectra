/**
 * calculus sequence accumulation and difference helper unit test.
 *
 * cumulativeTrapezoid(Into) — empty/singleton/multiple, default/positive spacing,
 *   invalid values/spacing, non-finite entry, 누적 overflow, signed-zero, out atomicity와 aliasing.
 * diff(Into) — empty/singleton/multiple, order 0(copy)/1/k, invalid values/order,
 *   non-finite entry, subtraction overflow, signed-zero, atomicity와 aliasing.
 * cumulativeSum(Into) — empty/singleton/multiple, invalid values, non-finite entry,
 *   누적 overflow, signed-zero, atomicity와 aliasing.
 */

import { describe, expect, test } from 'vitest';
import { cumulativeSum } from '../../../src/calculus/cumulative-sum';
import { cumulativeSumInto } from '../../../src/calculus/cumulative-sum-into';
import { cumulativeTrapezoid } from '../../../src/calculus/cumulative-trapezoid';
import { cumulativeTrapezoidInto } from '../../../src/calculus/cumulative-trapezoid-into';
import { diff } from '../../../src/calculus/diff';
import { diffInto } from '../../../src/calculus/diff-into';

// ---------------------------------------------------------------------------
// cumulativeTrapezoidInto / cumulativeTrapezoid — 정상 동작
// ---------------------------------------------------------------------------

describe('cumulativeTrapezoidInto — 정상 동작', () => {
  test('empty values는 빈 sequence를 반환한다', () => {
    const out: number[] = [];
    const result = cumulativeTrapezoidInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('singleton values는 [0]을 반환한다', () => {
    expect(cumulativeTrapezoidInto([], [42])).toEqual([0]);
  });

  test('default spacing(=1)으로 cumulative trapezoid를 계산한다', () => {
    // values = [1, 3, 5, 7], dx=1.
    // result[0]=0, result[1]=(1+3)/2=2, result[2]=2+(3+5)/2=6, result[3]=6+(5+7)/2=12
    expect(cumulativeTrapezoidInto([], [1, 3, 5, 7])).toEqual([0, 2, 6, 12]);
  });

  test('spacing scale을 적용한다', () => {
    // values = [1, 3, 5], dx=2.
    // result[0]=0, result[1]=(1+3)*2/2=4, result[2]=4+(3+5)*2/2=12
    expect(cumulativeTrapezoidInto([], [1, 3, 5], 2)).toEqual([0, 4, 12]);
  });

  test('상수 sequence는 partial sum이 spacing * (n-1)배 누적된다', () => {
    expect(cumulativeTrapezoidInto([], [5, 5, 5, 5])).toEqual([0, 5, 10, 15]);
  });
});

describe('cumulativeTrapezoid — companion은 새 배열을 반환한다', () => {
  test('새 배열 반환', () => {
    expect(cumulativeTrapezoid([1, 3, 5, 7])).toEqual([0, 2, 6, 12]);
  });
  test('spacing 적용', () => {
    expect(cumulativeTrapezoid([1, 3, 5], 2)).toEqual([0, 4, 12]);
  });
});

// ---------------------------------------------------------------------------
// cumulativeTrapezoidInto — invalid input
// ---------------------------------------------------------------------------

describe('cumulativeTrapezoidInto — invalid input', () => {
  test('values가 array 아니면 TypeError이고 out 미수정', () => {
    const out: number[] = [9, 9];
    expect(() => cumulativeTrapezoidInto(out, undefined as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => cumulativeTrapezoidInto(out, null as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => cumulativeTrapezoidInto(out, 42 as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('values entry %s는 RangeError이고 out 미수정', (bad) => {
    const out: number[] = [9, 9];
    expect(() => cumulativeTrapezoidInto(out, [1, bad, 3])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([
    0,
    -1,
    -1e-9,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('spacing %s는 RangeError이고 out 미수정', (spacing) => {
    const out: number[] = [9, 9];
    expect(() => cumulativeTrapezoidInto(out, [1, 2, 3], spacing)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('spacing이 number가 아니면 RangeError', () => {
    const out: number[] = [9, 9];
    expect(() => cumulativeTrapezoidInto(out, [1, 2, 3], 'x' as unknown as number)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('spacing이 positive denormal이고 spacing * 0.5가 underflow 되면 RangeError', () => {
    // Number.MIN_VALUE는 positive finite로 spacing 1차 검증을 통과하지만
    // Number.MIN_VALUE * 0.5는 +0으로 underflow된다(double 정밀도 한계). silent zero sequence
    // 방지 정책에 따라 RangeError로 거부한다.
    const out: number[] = [9, 9];
    expect(() => cumulativeTrapezoidInto(out, [1, 2, 3], Number.MIN_VALUE)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('empty values + invalid spacing도 out 미수정으로 throw한다', () => {
    // values.length === 0이면 truncate path만 남지만, validation은 truncate 이전에 실행되어야 한다.
    // 잘못된 spacing은 RangeError이고 out은 호출 전 상태 유지.
    const out: number[] = [99, 99];
    expect(() => cumulativeTrapezoidInto(out, [], Number.NaN)).toThrow(RangeError);
    expect(out).toEqual([99, 99]);
    expect(() => cumulativeTrapezoidInto(out, [], 0)).toThrow(RangeError);
    expect(out).toEqual([99, 99]);
    expect(() => cumulativeTrapezoidInto(out, [], -1)).toThrow(RangeError);
    expect(out).toEqual([99, 99]);
  });
});

// ---------------------------------------------------------------------------
// cumulativeTrapezoidInto — 누적 overflow, signed-zero
// ---------------------------------------------------------------------------

describe('cumulativeTrapezoidInto — 누적 overflow는 RangeError', () => {
  test('partial sum이 Infinity로 overflow되면 RangeError이고 out 미수정', () => {
    const out: number[] = [9, 9];
    // values = [MAX, MAX]: inc = (MAX + MAX) * 0.5 = MAX. next = 0 + MAX = MAX(finite).
    // values = [MAX, MAX, MAX]: i=1 next=MAX. i=2 inc=MAX, next=MAX+MAX=Infinity → throw.
    expect(() => cumulativeTrapezoidInto(out, [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(
      RangeError
    );
    expect(out).toEqual([9, 9]);
  });

  test('증분 자체가 Infinity이면 RangeError', () => {
    const out: number[] = [9, 9];
    // values = [MAX, MAX]는 (MAX + MAX) = Infinity → inc finite 검증에서 throw.
    // spacing=2이면 inc = (MAX + MAX) * 1 = Infinity.
    expect(() => cumulativeTrapezoidInto(out, [Number.MAX_VALUE, Number.MAX_VALUE], 2)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('cumulativeTrapezoidInto — signed-zero canonicalize', () => {
  // commitSequenceInto의 canonicalize는 모든 sequence Into helper에 공통으로 적용한다.
  // cumulativeTrapezoidInto 산술 파이프라인(temp[0]=+0, 매 단계 +0 + (lhs+rhs)*halfDx)에서는
  // 자연스럽게 -0이 누적 결과로 떨어지지 않는다(+0 + -0 = +0). 본 케이스는 입력 -0이 결과에서
  // +0으로 보이는 contract를 잠그는 defense-in-depth 검증.
  test('-0 sequence는 +0 sequence로 canonicalize된다', () => {
    const result = cumulativeTrapezoidInto([], [-0, -0, -0]);
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// cumulativeTrapezoidInto — atomicity와 aliasing
// ---------------------------------------------------------------------------

describe('cumulativeTrapezoidInto — atomicity와 aliasing', () => {
  test('성공 시 기존 out entry를 truncate하고 같은 out을 반환한다', () => {
    const out: number[] = [99, 99, 99, 99, 99, 99];
    const result = cumulativeTrapezoidInto(out, [1, 3, 5, 7]);
    expect(result).toBe(out);
    expect(out).toEqual([0, 2, 6, 12]);
    expect(out).toHaveLength(4);
  });

  test('empty values는 pre-populated out을 빈 sequence로 truncate한다', () => {
    const out: number[] = [99, 99, 99];
    const result = cumulativeTrapezoidInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('out === values aliasing도 안전하다', () => {
    const buf: number[] = [1, 3, 5, 7];
    const result = cumulativeTrapezoidInto(buf, buf);
    expect(result).toBe(buf);
    expect(buf).toEqual([0, 2, 6, 12]);
  });
});

// ---------------------------------------------------------------------------
// diffInto / diff — 정상 동작
// ---------------------------------------------------------------------------

describe('diffInto — 정상 동작', () => {
  test('empty values는 모든 order에서 []을 반환한다', () => {
    const out: number[] = [];
    expect(diffInto(out, [])).toEqual([]);
    expect(diffInto([], [], 0)).toEqual([]);
    expect(diffInto([], [], 3)).toEqual([]);
  });

  test('singleton values는 order 0에서 copy, order >= 1에서 []', () => {
    expect(diffInto([], [42], 0)).toEqual([42]);
    expect(diffInto([], [42])).toEqual([]);
    expect(diffInto([], [42], 2)).toEqual([]);
  });

  test('default order(=1)로 forward difference를 계산한다', () => {
    expect(diffInto([], [1, 3, 6, 10])).toEqual([2, 3, 4]);
  });

  test('order 2는 difference를 두 번 적용한다', () => {
    // [1, 3, 6, 10] → [2, 3, 4] → [1, 1]
    expect(diffInto([], [1, 3, 6, 10], 2)).toEqual([1, 1]);
  });

  test('order 3은 difference를 세 번 적용한다', () => {
    // [1, 3, 6, 10] → [2, 3, 4] → [1, 1] → [0]
    expect(diffInto([], [1, 3, 6, 10], 3)).toEqual([0]);
  });

  test('order === values.length이면 빈 sequence를 반환한다(경계)', () => {
    expect(diffInto([], [1, 2], 2)).toEqual([]);
    expect(diffInto([], [1, 3, 6, 10], 4)).toEqual([]);
  });

  test('order > values.length도 빈 sequence를 반환한다', () => {
    expect(diffInto([], [1, 3, 6, 10], 5)).toEqual([]);
    expect(diffInto([], [], 3)).toEqual([]);
  });

  test('order 0은 entry-wise copy이고 caller의 values와 다른 instance다', () => {
    const values = [1, 2, 3];
    const out: number[] = [];
    const result = diffInto(out, values, 0);
    expect(result).toBe(out);
    expect(out).toEqual([1, 2, 3]);
    expect(out).not.toBe(values);
  });
});

describe('diff — companion은 새 배열을 반환한다', () => {
  test('default order', () => {
    expect(diff([1, 3, 6, 10])).toEqual([2, 3, 4]);
  });
  test('order 2', () => {
    expect(diff([1, 3, 6, 10], 2)).toEqual([1, 1]);
  });
  test('order 0은 copy', () => {
    const values = [1, 2, 3];
    const result = diff(values, 0);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(values);
  });
});

// ---------------------------------------------------------------------------
// diffInto — invalid input
// ---------------------------------------------------------------------------

describe('diffInto — invalid input', () => {
  test('values가 array 아니면 TypeError이고 out 미수정', () => {
    const out: number[] = [9, 9];
    expect(() => diffInto(out, undefined as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => diffInto(out, 'x' as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([
    -1,
    0.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('order %s는 RangeError이고 out 미수정', (order) => {
    const out: number[] = [9, 9];
    expect(() => diffInto(out, [1, 2, 3], order)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('values entry %s는 RangeError이고 out 미수정', (bad) => {
    const out: number[] = [9, 9];
    expect(() => diffInto(out, [1, bad, 3])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('empty values + invalid order도 out 미수정으로 throw한다', () => {
    // values.length === 0이어도 order validation은 산술/commit 이전에 실행되어야 한다.
    const out: number[] = [99, 99];
    expect(() => diffInto(out, [], -1)).toThrow(RangeError);
    expect(out).toEqual([99, 99]);
    expect(() => diffInto(out, [], 0.5)).toThrow(RangeError);
    expect(out).toEqual([99, 99]);
    expect(() => diffInto(out, [], Number.NaN)).toThrow(RangeError);
    expect(out).toEqual([99, 99]);
  });
});

// ---------------------------------------------------------------------------
// diffInto — subtraction overflow, signed-zero
// ---------------------------------------------------------------------------

describe('diffInto — subtraction overflow는 RangeError', () => {
  test('MAX와 -MAX의 차이는 ±Infinity가 되어 RangeError이고 out 미수정', () => {
    const out: number[] = [9, 9];
    // diff([MAX, -MAX]) → [-MAX - MAX] = [-Infinity] → throw
    expect(() => diffInto(out, [Number.MAX_VALUE, -Number.MAX_VALUE])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('2차 difference에서 overflow도 RangeError', () => {
    // [MAX, 0, -MAX] → [-MAX, -MAX] → [-MAX - -MAX = 0] finite.
    // [MAX, 0, -MAX, 0] → [-MAX, -MAX, MAX] → [0, MAX+MAX=Infinity] → 2차에서 throw.
    const out: number[] = [9, 9];
    expect(() => diffInto(out, [Number.MAX_VALUE, 0, -Number.MAX_VALUE, 0], 2)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('diffInto — signed-zero canonicalize', () => {
  test('동일 sequence의 diff 결과 -0은 +0으로 canonicalize된다', () => {
    // [+0, +0, +0]의 diff는 [+0, +0]. signed-zero canonicalize 경로 보장.
    const r1 = diffInto([], [0, 0, 0]);
    for (const v of r1) {
      expect(Object.is(v, 0)).toBe(true);
    }

    // [1, 1]의 diff는 [0]. 정상 케이스이지만 commit canonicalize를 통과.
    const r2 = diffInto([], [1, 1]);
    expect(Object.is(r2[0], 0)).toBe(true);

    // [-0, -0]: -0 - -0 = +0. 정상.
    const r3 = diffInto([], [-0, -0]);
    for (const v of r3) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// diffInto — atomicity와 aliasing
// ---------------------------------------------------------------------------

describe('diffInto — atomicity와 aliasing', () => {
  test('성공 시 기존 out entry를 truncate하고 같은 out을 반환한다', () => {
    const out: number[] = [99, 99, 99, 99, 99];
    const result = diffInto(out, [1, 3, 6, 10]);
    expect(result).toBe(out);
    expect(out).toEqual([2, 3, 4]);
    expect(out).toHaveLength(3);
  });

  test('empty values는 pre-populated out을 빈 sequence로 truncate한다(order 기본/0/k)', () => {
    const out1: number[] = [99, 99, 99];
    expect(diffInto(out1, [])).toBe(out1);
    expect(out1).toEqual([]);

    const out2: number[] = [99, 99, 99];
    expect(diffInto(out2, [], 0)).toBe(out2);
    expect(out2).toEqual([]);

    const out3: number[] = [99, 99, 99];
    expect(diffInto(out3, [], 3)).toBe(out3);
    expect(out3).toEqual([]);
  });

  test('out === values aliasing도 안전하다', () => {
    const buf: number[] = [1, 3, 6, 10];
    const result = diffInto(buf, buf);
    expect(result).toBe(buf);
    expect(buf).toEqual([2, 3, 4]);
  });

  test('out === values aliasing은 order >= 2에서도 안전하다', () => {
    const buf: number[] = [1, 3, 6, 10];
    const result = diffInto(buf, buf, 2);
    expect(result).toBe(buf);
    expect(buf).toEqual([1, 1]);
  });

  test('order 0 aliasing(copy)도 안전하다', () => {
    const buf: number[] = [1, 2, 3];
    const result = diffInto(buf, buf, 0);
    expect(result).toBe(buf);
    expect(buf).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// cumulativeSumInto / cumulativeSum — 정상 동작
// ---------------------------------------------------------------------------

describe('cumulativeSumInto — 정상 동작', () => {
  test('empty values는 빈 sequence를 반환한다', () => {
    const out: number[] = [];
    const result = cumulativeSumInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('singleton values는 [values[0]]을 반환한다', () => {
    expect(cumulativeSumInto([], [42])).toEqual([42]);
  });

  test('positive sequence의 cumulative sum', () => {
    expect(cumulativeSumInto([], [1, 2, 3, 4])).toEqual([1, 3, 6, 10]);
  });

  test('mixed sign sequence', () => {
    expect(cumulativeSumInto([], [3, -1, 2, -4])).toEqual([3, 2, 4, 0]);
  });
});

describe('cumulativeSum — companion은 새 배열을 반환한다', () => {
  test('새 배열 반환', () => {
    expect(cumulativeSum([1, 2, 3, 4])).toEqual([1, 3, 6, 10]);
  });
});

// ---------------------------------------------------------------------------
// cumulativeSumInto — invalid input
// ---------------------------------------------------------------------------

describe('cumulativeSumInto — invalid input', () => {
  test('values가 array 아니면 TypeError이고 out 미수정', () => {
    const out: number[] = [9, 9];
    expect(() => cumulativeSumInto(out, undefined as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
    expect(() => cumulativeSumInto(out, 0 as unknown as number[])).toThrow(TypeError);
    expect(out).toEqual([9, 9]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('values entry %s는 RangeError이고 out 미수정', (bad) => {
    const out: number[] = [9, 9];
    expect(() => cumulativeSumInto(out, [1, bad, 3])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

// ---------------------------------------------------------------------------
// cumulativeSumInto — 누적 overflow, signed-zero
// ---------------------------------------------------------------------------

describe('cumulativeSumInto — 누적 overflow는 RangeError', () => {
  test('MAX + MAX는 Infinity가 되어 RangeError이고 out 미수정', () => {
    const out: number[] = [9, 9];
    expect(() => cumulativeSumInto(out, [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('첫 entry는 검증 통과 후 두 번째 entry 누적에서 overflow', () => {
    const out: number[] = [9, 9];
    // values = [MAX, MAX, 0]: i=1 acc = MAX+MAX = Infinity → throw.
    expect(() => cumulativeSumInto(out, [Number.MAX_VALUE, Number.MAX_VALUE, 0])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });
});

describe('cumulativeSumInto — signed-zero canonicalize', () => {
  test('-0 누적 결과는 +0으로 canonicalize된다', () => {
    const result = cumulativeSumInto([], [-0, -0, -0]);
    for (const v of result) {
      expect(Object.is(v, 0)).toBe(true);
    }
  });

  test('단일 -0 entry도 +0으로 canonicalize된다', () => {
    const result = cumulativeSumInto([], [-0]);
    expect(Object.is(result[0], 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// cumulativeSumInto — atomicity와 aliasing
// ---------------------------------------------------------------------------

describe('cumulativeSumInto — atomicity와 aliasing', () => {
  test('성공 시 기존 out entry를 truncate하고 같은 out을 반환한다', () => {
    const out: number[] = [99, 99, 99, 99, 99, 99];
    const result = cumulativeSumInto(out, [1, 2, 3, 4]);
    expect(result).toBe(out);
    expect(out).toEqual([1, 3, 6, 10]);
    expect(out).toHaveLength(4);
  });

  test('empty values는 pre-populated out을 빈 sequence로 truncate한다', () => {
    const out: number[] = [99, 99, 99];
    const result = cumulativeSumInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('out === values aliasing도 안전하다', () => {
    const buf: number[] = [1, 2, 3, 4];
    const result = cumulativeSumInto(buf, buf);
    expect(result).toBe(buf);
    expect(buf).toEqual([1, 3, 6, 10]);
  });
});
