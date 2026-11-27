/** parseSvgPolygon이 SVG points 문자열을 교차 배치 좌표의 새 배열로 파싱하는지 시험한다. */

import { describe, expect, test } from 'vitest';
import { parseSvgPolygon } from '../../../src/adapter/parse-svg-polygon';
import { parseSvgPolygonInto } from '../../../src/adapter/parse-svg-polygon-into';

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygon — companion 기본 동작
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygon — 새 배열 반환', () => {
  test('콤마 구분 좌표쌍을 파싱해 새 배열을 반환한다', () => {
    const result = parseSvgPolygon('10,20 30,40 50,60');
    expect(result).toEqual([10, 20, 30, 40, 50, 60]);
  });

  test('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(parseSvgPolygon('')).toEqual([]);
  });

  test('단일 좌표쌍을 파싱한다', () => {
    const result = parseSvgPolygon('5,7');
    expect(result).toEqual([5, 7]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygon — Into 결과와 동등
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygon — parseSvgPolygonInto 결과와 동등', () => {
  test('세 포인트 입력 결과가 Into와 deep equal이다', () => {
    const input = '10,20 30,40 50,60';
    const out: number[] = [];
    parseSvgPolygonInto(out, input);
    expect(parseSvgPolygon(input)).toEqual(out);
  });

  test('빈 문자열 결과가 Into와 동등하다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '');
    expect(parseSvgPolygon('')).toEqual(out);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygon — malformed 입력 throw (Into 정책 동일)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygon — malformed 입력 throw', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    expect(() => parseSvgPolygon('10,20,30')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    expect(() => parseSvgPolygon('abc,20')).toThrow();
  });
});
