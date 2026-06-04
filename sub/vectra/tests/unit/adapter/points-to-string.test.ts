import { describe, expect, test } from 'vitest';
import { parsePointArrayInto } from '../../../src/adapter/parse-point-array-into';
import { parseSvgPointsInto } from '../../../src/adapter/parse-svg-points-into';
import { pointsToString } from '../../../src/adapter/points-to-string';
import type { XYObjectWritable } from '../../../src/types/index';

// ─────────────────────────────────────────────────────────────────────────────
// pointsToString — 직렬화
// ─────────────────────────────────────────────────────────────────────────────

describe('pointsToString — 직렬화', () => {
  test('빈 배열은 빈 문자열을 반환한다', () => {
    expect(pointsToString([])).toBe('');
  });

  test('object 좌표를 공백 구분 문자열로 직렬화한다', () => {
    expect(
      pointsToString([
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ])
    ).toBe('10 20 30 40');
  });

  test('tuple 좌표를 공백 구분 문자열로 직렬화한다', () => {
    expect(
      pointsToString([
        [10, 20],
        [30, 40],
      ])
    ).toBe('10 20 30 40');
  });

  test('precision 옵션으로 소수점 자릿수를 제한한다', () => {
    expect(pointsToString([{ x: 1.567, y: 2.345 }], { precision: 2 })).toBe('1.57 2.35');
  });

  test('trailing zero를 제거한다 (precision=3, 1.500 → 1.5)', () => {
    expect(pointsToString([{ x: 1.5, y: 2.0 }], { precision: 3 })).toBe('1.5 2');
  });

  test('precision=0 이면 정수 출력을 반환한다', () => {
    expect(pointsToString([{ x: 3.7, y: 1.2 }], { precision: 0 })).toBe('4 1');
  });

  test('단일 좌표를 직렬화한다', () => {
    expect(pointsToString([{ x: 5, y: 7 }])).toBe('5 7');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parseSvgPointsInto + pointsToString — round-trip
// ─────────────────────────────────────────────────────────────────────────────

describe('parseSvgPointsInto + pointsToString — round-trip', () => {
  test('parse → toString → parse가 동치다 (정수 좌표)', () => {
    const out1: XYObjectWritable[] = [];
    parseSvgPointsInto(out1, '10,20 30,40 50,60');
    const str = pointsToString(out1);
    const out2: XYObjectWritable[] = [];
    parseSvgPointsInto(out2, str);
    expect(out2).toHaveLength(out1.length);
    for (let i = 0; i < out1.length; i++) {
      expect(out2[i].x).toBe(out1[i].x);
      expect(out2[i].y).toBe(out1[i].y);
    }
  });

  test('음수·소수 좌표 round-trip', () => {
    const out1: XYObjectWritable[] = [];
    parseSvgPointsInto(out1, '-1.5,2.5 -3.25,4.75');
    const str = pointsToString(out1);
    const out2: XYObjectWritable[] = [];
    parseSvgPointsInto(out2, str);
    expect(out2).toHaveLength(2);
    expect(out2[0].x).toBe(-1.5);
    expect(out2[0].y).toBe(2.5);
    expect(out2[1].x).toBe(-3.25);
    expect(out2[1].y).toBe(4.75);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parsePointArrayInto + pointsToString — round-trip
// ─────────────────────────────────────────────────────────────────────────────

describe('parsePointArrayInto + pointsToString — round-trip', () => {
  test('parse → toString → parse가 동치다 (정수 좌표)', () => {
    const out1: XYObjectWritable[] = [];
    parsePointArrayInto(out1, '10,20 30,40 50,60');
    const str = pointsToString(out1);
    const out2: XYObjectWritable[] = [];
    parsePointArrayInto(out2, str);
    expect(out2).toHaveLength(out1.length);
    for (let i = 0; i < out1.length; i++) {
      expect(out2[i].x).toBe(out1[i].x);
      expect(out2[i].y).toBe(out1[i].y);
    }
  });
});
