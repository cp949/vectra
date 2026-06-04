import { describe, expect, test } from 'vitest';
import { parseSvgPolylineInto } from '../../../src/adapter/parse-svg-polyline-into';
import { svgPolylineToString } from '../../../src/adapter/svg-polyline-to-string';
import type { XYObjectWritable } from '../../../src/types/index';

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolylineInto — 정상 파싱
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolylineInto — 정상 파싱', () => {
  test('콤마 구분 좌표쌍을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
    expect(out[2]).toEqual({ x: 50, y: 60 });
  });

  test('공백 구분 숫자열을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '10 20 30 40');
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
  });

  test('콤마와 공백 혼합 입력을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '10,20 30 40');
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 20 });
    expect(out[1]).toEqual({ x: 30, y: 40 });
  });

  test('음수·소수·지수 표기를 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '-3.5 2.5e2');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: -3.5, y: 250 });
  });

  test('단일 좌표쌍을 파싱한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '5,7');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 5, y: 7 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolylineInto — 빈 입력 처리
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolylineInto — 빈 입력', () => {
  test('빈 문자열이면 out.length = 0이다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 2 }];
    parseSvgPolylineInto(out, '');
    expect(out).toHaveLength(0);
  });

  test('공백만 있는 문자열은 빈 배열로 처리한다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '   ');
    expect(out).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolylineInto — 재사용 (out 초기화)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolylineInto — 재사용 시 이전 결과 덮어쓰기', () => {
  test('두 번 호출 시 첫 호출 결과를 덮어쓴다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '10,20 30,40 50,60');
    expect(out).toHaveLength(3);

    parseSvgPolylineInto(out, '1,2');
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 1, y: 2 });
  });

  test('빈 문자열로 두 번째 호출 시 out이 비워진다', () => {
    const out: XYObjectWritable[] = [];
    parseSvgPolylineInto(out, '10,20');
    parseSvgPolylineInto(out, '');
    expect(out).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolylineInto — malformed 입력 (throw)
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolylineInto — malformed 입력 throw', () => {
  test('홀수 개 숫자 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPolylineInto(out, '10,20,30')).toThrow();
  });

  test('단일 숫자 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPolylineInto(out, '10')).toThrow();
  });

  test('non-numeric 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPolylineInto(out, 'abc,20')).toThrow();
  });

  test('y 위치에 non-numeric 토큰이면 Error를 throw한다', () => {
    const out: XYObjectWritable[] = [];
    expect(() => parseSvgPolylineInto(out, '10,xyz')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPolylineInto + svgPolylineToString — round-trip
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPolylineInto + svgPolylineToString — round-trip', () => {
  test('parse → toString → parse가 동치다 (정수 좌표)', () => {
    const out1: XYObjectWritable[] = [];
    parseSvgPolylineInto(out1, '10,20 30,40 50,60');
    const str = svgPolylineToString(out1);
    const out2: XYObjectWritable[] = [];
    parseSvgPolylineInto(out2, str);
    expect(out2).toHaveLength(out1.length);
    for (let i = 0; i < out1.length; i++) {
      expect(out2[i].x).toBe(out1[i].x);
      expect(out2[i].y).toBe(out1[i].y);
    }
  });

  test('음수·소수 좌표 round-trip', () => {
    const out1: XYObjectWritable[] = [];
    parseSvgPolylineInto(out1, '-1.5,2.5 -3.25,4.75');
    const str = svgPolylineToString(out1);
    const out2: XYObjectWritable[] = [];
    parseSvgPolylineInto(out2, str);
    expect(out2).toHaveLength(2);
    expect(out2[0].x).toBe(-1.5);
    expect(out2[0].y).toBe(2.5);
    expect(out2[1].x).toBe(-3.25);
    expect(out2[1].y).toBe(4.75);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// svgPolylineToString — precision 옵션
// ─────────────────────────────────────────────────────────────────────────────

describe('svgPolylineToString — precision 옵션', () => {
  test('precision 2로 소수점 이하 2자리로 반올림한다', () => {
    const points: XYObjectWritable[] = [{ x: 1.23456, y: 7.89012 }];
    const str = svgPolylineToString(points, { precision: 2 });
    expect(str).toBe('1.23 7.89');
  });

  test('precision 0으로 정수 형태로 반올림한다', () => {
    const points: XYObjectWritable[] = [
      { x: 1.7, y: 2.3 },
      { x: 3.5, y: 4.9 },
    ];
    const str = svgPolylineToString(points, { precision: 0 });
    expect(str).toBe('2 2 4 5');
  });

  test('precision 미지정 시 String(n) 기반 포맷을 사용한다', () => {
    const points: XYObjectWritable[] = [{ x: 1.5, y: 2.25 }];
    const str = svgPolylineToString(points);
    expect(str).toBe('1.5 2.25');
  });

  test('trailing zero를 제거한다', () => {
    const points: XYObjectWritable[] = [{ x: 1, y: 2 }];
    const str = svgPolylineToString(points, { precision: 3 });
    expect(str).toBe('1 2');
  });

  test('빈 배열은 빈 문자열을 반환한다', () => {
    const str = svgPolylineToString([]);
    expect(str).toBe('');
  });
});
