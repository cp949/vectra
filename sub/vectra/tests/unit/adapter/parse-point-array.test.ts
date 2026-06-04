import { describe, expect, test } from 'vitest';
import { parsePointArray } from '../../../src/adapter/parse-point-array';
import { parsePointArrayInto } from '../../../src/adapter/parse-point-array-into';

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArray — companion 기본 동작
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArray — 새 배열 반환', () => {
  test('콤마 구분 좌표쌍을 파싱해 새 배열을 반환한다', () => {
    const result = parsePointArray('10,20 30,40 50,60');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: 10, y: 20 });
    expect(result[1]).toEqual({ x: 30, y: 40 });
    expect(result[2]).toEqual({ x: 50, y: 60 });
  });

  test('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(parsePointArray('')).toEqual([]);
  });

  test('단일 좌표쌍을 파싱한다', () => {
    const result = parsePointArray('5,7');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 5, y: 7 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArray — Into 결과와 동등
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArray — parsePointArrayInto 결과와 동등', () => {
  test('세 포인트 입력 결과가 Into와 deep equal이다', () => {
    const input = '10,20 30,40 50,60';
    const out: { x: number; y: number }[] = [];
    parsePointArrayInto(out, input);
    expect(parsePointArray(input)).toEqual(out);
  });

  test('빈 문자열 결과가 Into와 동등하다', () => {
    const out: { x: number; y: number }[] = [];
    parsePointArrayInto(out, '');
    expect(parsePointArray('')).toEqual(out);
  });

  test('공백·콤마 혼합 결과가 Into와 동등하다', () => {
    const input = '10,20 30 40';
    const out: { x: number; y: number }[] = [];
    parsePointArrayInto(out, input);
    expect(parsePointArray(input)).toEqual(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArray — 새 array identity
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArray — 새 array 반환 확인', () => {
  test('매 호출마다 새 배열을 반환한다', () => {
    const a = parsePointArray('1,2 3,4');
    const b = parsePointArray('1,2 3,4');
    expect(a).not.toBe(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArray — malformed 입력 throw (Into 정책 동일)
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArray — malformed 입력 throw', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    expect(() => parsePointArray('10,20,30')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    expect(() => parsePointArray('abc,20')).toThrow();
  });
});
