import { describe, expect, test } from 'vitest';
import { lerpArrayInto } from '../../../src/interpolation/lerp-array-into';
import { sampleParametersInto } from '../../../src/interpolation/sample-parameters-into';

describe('interpolation collection helper - sampleParametersInto', () => {
  test('count=2이면 [0, 1]을 반환한다', () => {
    const out: number[] = [];
    const result = sampleParametersInto(out, 2);
    expect(result).toBe(out);
    expect(out).toEqual([0, 1]);
  });

  test('count=3이면 [0, 0.5, 1]을 반환한다', () => {
    const out: number[] = [];
    sampleParametersInto(out, 3);
    expect(out).toEqual([0, 0.5, 1]);
  });

  test('count=5이면 [0, 0.25, 0.5, 0.75, 1]을 반환한다', () => {
    const out: number[] = [];
    sampleParametersInto(out, 5);
    expect(out).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test('마지막 값이 정확히 1이다', () => {
    const out: number[] = [];
    sampleParametersInto(out, 7);
    expect(out[out.length - 1]).toBe(1);
  });

  test('기존 원소가 있는 out에 호출하면 결과가 정확히 count개이다', () => {
    const out: number[] = [99, 88, 77, 66, 55];
    sampleParametersInto(out, 3);
    expect(out.length).toBe(3);
    expect(out).toEqual([0, 0.5, 1]);
  });

  test('count=1이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, 1)).toThrow(RangeError);
  });

  test('count=0이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, 0)).toThrow(RangeError);
  });

  test('count=-1이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, -1)).toThrow(RangeError);
  });

  test('count=1.5이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, 1.5)).toThrow(RangeError);
  });

  test('count=Infinity이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, Infinity)).toThrow(RangeError);
  });

  test('count=NaN이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, NaN)).toThrow(RangeError);
  });

  test('count가 0xffffffff를 초과하면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, 0x100000000)).toThrow(RangeError);
  });

  test('count가 safe integer가 아니면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => sampleParametersInto(out, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  test('error 시 기존 out을 변경하지 않는다', () => {
    const out: number[] = [10, 20, 30];
    expect(() => sampleParametersInto(out, 1)).toThrow(RangeError);
    expect(out).toEqual([10, 20, 30]);
  });
});

describe('interpolation collection helper - lerpArrayInto', () => {
  test('a=[0,0], b=[10,20], t=0.5이면 [5, 10]을 반환한다', () => {
    const out: number[] = [];
    const result = lerpArrayInto(out, [0, 0], [10, 20], 0.5);
    expect(result).toBe(out);
    expect(out).toEqual([5, 10]);
  });

  test('t=0이면 a를 그대로 반환한다', () => {
    const out: number[] = [];
    lerpArrayInto(out, [3, 7, 2], [10, 20, 30], 0);
    expect(out).toEqual([3, 7, 2]);
  });

  test('t=1이면 b를 그대로 반환한다', () => {
    const out: number[] = [];
    lerpArrayInto(out, [3, 7, 2], [10, 20, 30], 1);
    expect(out).toEqual([10, 20, 30]);
  });

  test('빈 배열 a=[], b=[]이면 out을 비운다', () => {
    const out: number[] = [99, 88];
    lerpArrayInto(out, [], [], 0.5);
    expect(out).toEqual([]);
  });

  test('extrapolation: t=1.5이면 외삽값을 반환한다', () => {
    const out: number[] = [];
    lerpArrayInto(out, [0, 0], [10, 20], 1.5);
    expect(out).toEqual([15, 30]);
  });

  test('기존 원소가 있는 out에 호출하면 결과가 정확히 a.length개이다', () => {
    const out: number[] = [1, 2, 3, 4, 5];
    lerpArrayInto(out, [0, 0], [10, 20], 0.5);
    expect(out.length).toBe(2);
    expect(out).toEqual([5, 10]);
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const arr = [0, 0];
    const result = lerpArrayInto(arr, arr, [10, 20], 0.5);
    expect(result).toBe(arr);
    expect(arr).toEqual([5, 10]);
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const arr = [10, 20];
    const result = lerpArrayInto(arr, [0, 0], arr, 0.5);
    expect(result).toBe(arr);
    expect(arr).toEqual([5, 10]);
  });

  test('a와 b가 같은 배열이어도 정상 처리한다', () => {
    const arr = [5, 10];
    const out: number[] = [];
    const result = lerpArrayInto(out, arr, arr, 0.5);
    expect(result).toBe(out);
    expect(out).toEqual([5, 10]);
  });

  test('a.length !== b.length이면 RangeError를 던진다', () => {
    const out: number[] = [];
    expect(() => lerpArrayInto(out, [0, 0], [10], 0.5)).toThrow(RangeError);
    expect(out).toEqual([]);
  });

  test('a 원소가 NaN이면 RangeError를 던진다', () => {
    const out: number[] = [99];
    expect(() => lerpArrayInto(out, [Number.NaN, 0], [10, 20], 0.5)).toThrow(RangeError);
    expect(out).toEqual([99]);
  });

  test('b 원소가 Infinity이면 RangeError를 던진다', () => {
    const out: number[] = [99];
    expect(() => lerpArrayInto(out, [0, 0], [10, Number.POSITIVE_INFINITY], 0.5)).toThrow(RangeError);
    expect(out).toEqual([99]);
  });

  test('t가 NaN이면 RangeError를 던진다', () => {
    const out: number[] = [99];
    expect(() => lerpArrayInto(out, [0, 0], [10, 20], Number.NaN)).toThrow(RangeError);
    expect(out).toEqual([99]);
  });
});
