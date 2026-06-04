import { describe, expect, test } from 'vitest';
import { parseSvgPointsInto } from '../../../src/adapter/parse-svg-points-into';
import type { XYObjectWritable } from '../../../src/types/index';

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPointsInto — 정상 파싱
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPointsInto — 정상 파싱', () => {
  test('콤마 구분 좌표쌍을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
    expect(out[2]).toEqual({ x: 50, y: 60 });
  });

  test('공백 구분 숫자열을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '10 20 30 40');
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
  });

  test('콤마와 공백 혼합 입력을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '10,20 30 40');
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
  });

  test('음수·소수·지수 표기를 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '-3.5 2.5e2');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: -3.5, y: 250 });
  });

  test('단일 좌표쌍을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '5,7');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 5, y: 7 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPointsInto — 빈 입력 처리
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPointsInto — 빈 입력', () => {
  test('빈 문자열이면 out.length = 0이다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 2 }];
    parseSvgPointsInto(out, '');
    expect(out).toHaveLength(0);
  });

  test('공백만 있는 문자열은 빈 배열로 처리한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '   ');
    expect(out).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPointsInto — 재사용 (out 초기화)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPointsInto — 재사용 시 이전 결과 덮어쓰기', () => {
  test('두 번 호출 시 첫 호출 결과를 덮어쓴다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(3);

    parseSvgPointsInto(out, '1,2');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 1, y: 2 });
  });

  test('빈 문자열로 두 번째 호출 시 out이 비워진다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPointsInto(out, '10,20');
    parseSvgPointsInto(out, '');
    expect(out).toHaveLength(0);
  });

  test('반환값은 out 자체다', () => {
    const out: XYObjectWritable[] = [];
    const result = parseSvgPointsInto(out, '1,2');
    expect(result).toBe(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPointsInto — malformed 입력 (throw)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPointsInto — malformed 입력 throw', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPointsInto(out, '10,20,30')).toThrow();
  });

  test('단일 숫자 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPointsInto(out, '10')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPointsInto(out, 'abc,20')).toThrow();
  });

  test('y 위치에 non-numeric 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPointsInto(out, '10,xyz')).toThrow();
  });
});
