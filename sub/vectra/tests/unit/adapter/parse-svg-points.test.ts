import { describe, expect, test } from 'vitest';
import { parseSvgPoints } from '../../../src/adapter/parse-svg-points';
import { parseSvgPointsInto } from '../../../src/adapter/parse-svg-points-into';

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPoints — companion 기본 동작
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPoints — 새 배열 반환', () => {
  test('콤마 구분 좌표쌍을 파싱해 새 배열을 반환한다', () => {
    const result = parseSvgPoints('10,20 30,40 50,60');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: 10, y: 20 });
    expect(result[1]).toEqual({ x: 30, y: 40 });
    expect(result[2]).toEqual({ x: 50, y: 60 });
  });

  test('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(parseSvgPoints('')).toEqual([]);
  });

  test('단일 좌표쌍을 파싱한다', () => {
    const result = parseSvgPoints('5,7');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 5, y: 7 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPoints — Into 결과와 동등
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPoints — parseSvgPointsInto 결과와 동등', () => {
  test('세 포인트 입력 결과가 Into와 deep equal이다', () => {
    const input = '10,20 30,40 50,60';
    const out: { x: number; y: number }[] = [];
    parseSvgPointsInto(out, input);
    expect(parseSvgPoints(input)).toEqual(out);
  });

  test('빈 문자열 결과가 Into와 동등하다', () => {
    const out: { x: number; y: number }[] = [];
    parseSvgPointsInto(out, '');
    expect(parseSvgPoints('')).toEqual(out);
  });

  test('공백·콤마 혼합 결과가 Into와 동등하다', () => {
    const input = '10,20 30 40';
    const out: { x: number; y: number }[] = [];
    parseSvgPointsInto(out, input);
    expect(parseSvgPoints(input)).toEqual(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPoints — tolerant/strict 정책 유지
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPoints — malformed 입력 throw (Into 정책 동일)', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    expect(() => parseSvgPoints('10,20,30')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    expect(() => parseSvgPoints('abc,20')).toThrow();
  });
});
