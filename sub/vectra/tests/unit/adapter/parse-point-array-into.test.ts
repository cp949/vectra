import { describe, expect, test } from 'vitest';
import { parsePointArrayInto } from '../../../src/adapter/parse-point-array-into';
import type { XYObjectWritable } from '../../../src/types/index';

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArrayInto — 정상 파싱 (동일 kernel 재사용 검증)
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArrayInto — 정상 파싱', () => {
  test('콤마 구분 좌표쌍을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parsePointArrayInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
    expect(out[2]).toEqual({ x: 50, y: 60 });
  });

  test('공백 구분 숫자열을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parsePointArrayInto(out, '10 20 30 40');
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
  });

  test('콤마와 공백 혼합 입력을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parsePointArrayInto(out, '10,20 30 40');
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
  });

  test('음수·소수·지수 표기를 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parsePointArrayInto(out, '-3.5 2.5e2');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: -3.5, y: 250 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArrayInto — 빈 입력 처리
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArrayInto — 빈 입력', () => {
  test('빈 문자열이면 out.length = 0이다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 2 }];
    parsePointArrayInto(out, '');
    expect(out).toHaveLength(0);
  });

  test('공백만 있는 문자열은 빈 배열로 처리한다', () => {
    const out: XYObjectWritable[] = [];
    parsePointArrayInto(out, '   ');
    expect(out).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArrayInto — 재사용
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArrayInto — 재사용 시 이전 결과 덮어쓰기', () => {
  test('두 번 호출 시 첫 호출 결과를 덮어쓴다', () => {
    const out: XYObjectWritable[] = [];
    parsePointArrayInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(3);

    parsePointArrayInto(out, '1,2');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 1, y: 2 });
  });

  test('반환값은 out 자체다', () => {
    const out: XYObjectWritable[] = [];
    const result = parsePointArrayInto(out, '1,2');
    expect(result).toBe(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArrayInto — malformed 입력 (throw)
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArrayInto — malformed 입력 throw', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parsePointArrayInto(out, '10,20,30')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parsePointArrayInto(out, 'abc,20')).toThrow();
  });
});
