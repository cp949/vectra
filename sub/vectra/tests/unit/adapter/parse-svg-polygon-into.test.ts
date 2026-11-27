/** SVG polygon의 교차 배치 좌표와 문자열 변환을 시험한다. */

import { describe, expect, test } from 'vitest';
import { parseSvgPolygonInto } from '../../../src/adapter/parse-svg-polygon-into';
import { svgPolygonToString } from '../../../src/adapter/svg-polygon-to-string';

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygonInto — 정상 파싱
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygonInto — 정상 파싱', () => {
  test('콤마 구분 좌표쌍을 파싱한다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '10,20 30,40 50,60');
    expect(out).toEqual([10, 20, 30, 40, 50, 60]);
  });

  test('공백 구분 숫자열을 파싱한다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '10 20 30 40');
    expect(out).toEqual([10, 20, 30, 40]);
  });

  test('콤마와 공백 혼합 입력을 파싱한다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '10,20 30 40');
    expect(out).toEqual([10, 20, 30, 40]);
  });

  test('음수·소수·지수 표기를 파싱한다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '-3.5 2.5e2');
    expect(out).toEqual([-3.5, 250]);
  });

  test('단일 좌표쌍을 파싱한다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '5,7');
    expect(out).toEqual([5, 7]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygonInto — 빈 입력 처리
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygonInto — 빈 입력', () => {
  test('빈 문자열이면 out.length = 0이다', () => {
    const out: number[] = [1, 2];
    parseSvgPolygonInto(out, '');
    expect(out).toHaveLength(0);
  });

  test('공백만 있는 문자열은 빈 배열로 처리한다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '   ');
    expect(out).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygonInto — 재사용 (out 초기화)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygonInto — 재사용 시 이전 결과 덮어쓰기', () => {
  test('두 번 호출 시 첫 호출 결과를 덮어쓴다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(6);

    parseSvgPolygonInto(out, '1,2');
    expect(out).toEqual([1, 2]);
  });

  test('빈 문자열로 두 번째 호출 시 out이 비워진다', () => {
    const out: number[] = [];
    parseSvgPolygonInto(out, '10,20');
    parseSvgPolygonInto(out, '');
    expect(out).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygonInto — malformed 입력 (throw)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygonInto — malformed 입력 throw', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    const out: number[] = [];
    expect(() => parseSvgPolygonInto(out, '10,20,30')).toThrow();
  });

  test('단일 숫자 토큰이면 Error를 throw한다', () => {
    const out: number[] = [];
    expect(() => parseSvgPolygonInto(out, '10')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    const out: number[] = [];
    expect(() => parseSvgPolygonInto(out, 'abc,20')).toThrow();
  });

  test('y 위치에 non-numeric 토큰이면 Error를 throw한다', () => {
    const out: number[] = [];
    expect(() => parseSvgPolygonInto(out, '10,xyz')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolygonInto + svgPolygonToString — round-trip
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolygonInto + svgPolygonToString — round-trip', () => {
  test('parse → toString → parse가 동치다 (정수 좌표)', () => {
    const out1: number[] = [];
    parseSvgPolygonInto(out1, '10,20 30,40 50,60');
    const str = svgPolygonToString(out1);
    const out2: number[] = [];
    parseSvgPolygonInto(out2, str);
    expect(out2).toEqual(out1);
  });

  test('음수·소수 좌표 round-trip', () => {
    const out1: number[] = [];
    parseSvgPolygonInto(out1, '-1.5,2.5 -3.25,4.75');
    const str = svgPolygonToString(out1);
    const out2: number[] = [];
    parseSvgPolygonInto(out2, str);
    expect(out2).toEqual([-1.5, 2.5, -3.25, 4.75]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// svgPolygonToString — precision 옵션
// ─────────────────────────────────────────────────────────────────────────────

describe('svgPolygonToString — precision 옵션', () => {
  test('precision 2로 소수점 이하 2자리로 반올림한다', () => {
    const points: number[] = [1.23456, 7.89012];
    const str = svgPolygonToString(points, { precision: 2 });
    expect(str).toBe('1.23 7.89');
  });

  test('precision 0으로 정수 형태로 반올림한다', () => {
    const points: number[] = [1.7, 2.3, 3.5, 4.9];
    const str = svgPolygonToString(points, { precision: 0 });
    expect(str).toBe('2 2 4 5');
  });

  test('precision 미지정 시 String(n) 기반 포맷을 사용한다', () => {
    const points: number[] = [1.5, 2.25];
    const str = svgPolygonToString(points);
    expect(str).toBe('1.5 2.25');
  });

  test('trailing zero를 제거한다', () => {
    const points: number[] = [1, 2];
    const str = svgPolygonToString(points, { precision: 3 });
    expect(str).toBe('1 2');
  });

  test('빈 배열은 빈 문자열을 반환한다', () => {
    const str = svgPolygonToString([]);
    expect(str).toBe('');
  });
});

test('좌표 개수가 홀수면 RangeError를 던진다', () => {
  expect(() => svgPolygonToString([1, 2, 3])).toThrow(RangeError);
});
