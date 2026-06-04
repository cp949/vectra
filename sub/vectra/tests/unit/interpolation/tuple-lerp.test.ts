/**
 * interpolation tuple lerp focused test.
 *
 * `lerpTupleInto` / `lerpTuple`의 runtime 동작과 TypeScript tuple type 보존을 검증한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import { lerpTuple } from '../../../src/interpolation/lerp-tuple';
import { lerpTupleInto } from '../../../src/interpolation/lerp-tuple-into';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('interpolation.lerpTupleInto — runtime 동작', () => {
  test('t=0.5에서 원소별 중간값을 out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    const result = lerpTupleInto(out, [0, 10], [2, 14], 0.5);
    expect(result).toBe(out);
    expect(out).toEqual([1, 12]);
  });

  test('t=0이면 a를, t=1이면 b를 기록한다', () => {
    const out: number[] = [];
    lerpTupleInto(out, [1, 2, 3], [4, 5, 6], 0);
    expect(out).toEqual([1, 2, 3]);
    lerpTupleInto(out, [1, 2, 3], [4, 5, 6], 1);
    expect(out).toEqual([4, 5, 6]);
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    const out: number[] = [];
    lerpTupleInto(out, [0, 10], [2, 14], -1);
    expect(out).toEqual([-2, 6]);
    lerpTupleInto(out, [0, 10], [2, 14], 2);
    expect(out).toEqual([4, 18]);
  });

  test('빈 입력을 정상 처리하고 out을 빈 배열로 만든다', () => {
    const out: number[] = [1, 2, 3];
    const result = lerpTupleInto(out, [], [], 0.5);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('out === a aliasing에서 올바른 결과를 반환한다', () => {
    const buf: number[] = [0, 10];
    const result = lerpTupleInto(buf, buf, [2, 14], 0.5);
    expect(result).toBe(buf);
    expect(buf).toEqual([1, 12]);
  });

  test('out === b aliasing에서 올바른 결과를 반환한다', () => {
    const buf: number[] = [2, 14];
    const result = lerpTupleInto(buf, [0, 10], buf, 0.5);
    expect(result).toBe(buf);
    expect(buf).toEqual([1, 12]);
  });

  test('a === b aliasing에서 동일 값을 반환한다', () => {
    const shared: number[] = [3, 7];
    const out: number[] = [];
    lerpTupleInto(out, shared, shared, 0.25);
    expect(out).toEqual([3, 7]);
  });

  test('length mismatch는 RangeError를 던지고 out을 변경하지 않는다', () => {
    const out: number[] = [9, 9, 9];
    expect(() => lerpTupleInto(out, [1, 2], [1], 0.5)).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test.each(nonFiniteValues)('non-finite t=%s는 RangeError를 던지고 out을 변경하지 않는다', (value) => {
    const out: number[] = [9, 9];
    expect(() => lerpTupleInto(out, [0, 10], [2, 14], value)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each(nonFiniteValues)('a 원소에 non-finite %s가 있으면 RangeError를 던지고 out을 변경하지 않는다', (value) => {
    const out: number[] = [9, 9];
    expect(() => lerpTupleInto(out, [0, value], [2, 14], 0.5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test.each(nonFiniteValues)('b 원소에 non-finite %s가 있으면 RangeError를 던지고 out을 변경하지 않는다', (value) => {
    const out: number[] = [9, 9];
    expect(() => lerpTupleInto(out, [0, 10], [value, 14], 0.5)).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('mutable tuple output reference type을 보존한다', () => {
    const out: [number, number] = [0, 0];
    const result = lerpTupleInto(out, [0, 10], [2, 14], 0.5);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('mutable number[] input은 number[] return type을 갖는다', () => {
    const out: number[] = [];
    const result = lerpTupleInto(out, [0, 10], [2, 14], 0.5);
    expectTypeOf(result).toEqualTypeOf<number[]>();
  });
});

describe('interpolation.lerpTuple — allocating companion', () => {
  test('Into와 동일한 representative 결과를 반환한다', () => {
    const out: number[] = [];
    lerpTupleInto(out, [0, 10, 20], [2, 12, 22], 0.5);
    expect(lerpTuple([0, 10, 20], [2, 12, 22], 0.5)).toEqual(out);
  });

  test('호출마다 새 배열을 반환한다', () => {
    const first = lerpTuple([0, 10], [2, 14], 0.5);
    const second = lerpTuple([0, 10], [2, 14], 0.5);
    expect(first).not.toBe(second);
  });

  test('t=0이면 a, t=1이면 b 값을 반환한다', () => {
    expect(lerpTuple([1, 2, 3], [4, 5, 6], 0)).toEqual([1, 2, 3]);
    expect(lerpTuple([1, 2, 3], [4, 5, 6], 1)).toEqual([4, 5, 6]);
  });

  test('t를 clamp하지 않고 extrapolation을 허용한다', () => {
    expect(lerpTuple([0, 10], [2, 14], -1)).toEqual([-2, 6]);
    expect(lerpTuple([0, 10], [2, 14], 2)).toEqual([4, 18]);
  });

  test('빈 입력은 빈 배열을 반환한다', () => {
    expect(lerpTuple([], [], 0.5)).toEqual([]);
  });

  test('length mismatch는 RangeError를 던진다', () => {
    expect(() => lerpTuple([1, 2], [1], 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('non-finite t=%s는 RangeError를 던진다', (value) => {
    expect(() => lerpTuple([0, 10], [2, 14], value)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('a 원소에 non-finite %s가 있으면 RangeError를 던진다', (value) => {
    expect(() => lerpTuple([0, value], [2, 14], 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('b 원소에 non-finite %s가 있으면 RangeError를 던진다', (value) => {
    expect(() => lerpTuple([0, 10], [value, 14], 0.5)).toThrow(RangeError);
  });

  test('readonly tuple input은 mutable tuple result type을 갖는다', () => {
    const a = [0, 10] as const;
    const b = [2, 14] as const;
    const result = lerpTuple(a, b, 0.5);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('readonly tuple input의 결과는 readonly tuple type을 갖지 않는다', () => {
    const a = [0, 10] as const;
    const b = [2, 14] as const;
    const result = lerpTuple(a, b, 0.5);
    expectTypeOf(result).not.toEqualTypeOf<readonly [number, number]>();
  });

  test('mutable number[] input은 number[] return type을 갖는다', () => {
    const a: number[] = [0, 10];
    const b: number[] = [2, 14];
    const result = lerpTuple(a, b, 0.5);
    expectTypeOf(result).toEqualTypeOf<number[]>();
  });

  test('b 길이는 type-level에서 강제되지 않고 런타임에서만 검증된다', () => {
    // type-check pass: b가 a보다 길어도 readonly number[]로 받는다.
    expect(() => lerpTuple([0, 0] as const, [1, 1, 1], 0.5)).toThrow(RangeError);
  });
});
