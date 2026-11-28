/**
 * vec 성분별 나머지(modulo) helper 단위 테스트.
 *
 * moduloInto/modulo의 out 반환, aliasing, companion 일치와
 * zero divisor / 음수 피제수 / non-finite 입력의 JavaScript % pass-through를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import type { PointWritable } from '../../../src/types';
import { modulo } from '../../../src/vec/modulo';
import { moduloInto } from '../../../src/vec/modulo-into';

describe('vec modulo', () => {
  test('a와 b의 각 성분 나머지를 out에 기록하고 out을 반환한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    const result = moduloInto(out, { x: 5, y: 7 }, { x: 3, y: 4 });
    expect(result).toBe(out);
    expect(out.x).toBe(2);
    expect(out.y).toBe(3);
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const a: PointWritable = { x: 5, y: 7 };
    moduloInto(a, a, { x: 3, y: 4 });
    expect(a.x).toBe(2);
    expect(a.y).toBe(3);
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const b: PointWritable = { x: 3, y: 4 };
    moduloInto(b, { x: 5, y: 7 }, b);
    expect(b.x).toBe(2);
    expect(b.y).toBe(3);
  });

  test('음수 피제수는 JavaScript % 부호 정책(피제수 부호)을 따른다', () => {
    expect(modulo({ x: -5, y: 5 }, { x: 3, y: 3 })).toEqual({ x: -2, y: 2 });
    expect(modulo({ x: 5, y: -5 }, { x: -3, y: -3 })).toEqual({ x: 2, y: -2 });
  });

  test('zero divisor는 NaN을 반환한다', () => {
    const r = modulo({ x: 5, y: 7 }, { x: 0, y: 0 });
    expect(Number.isNaN(r.x)).toBe(true);
    expect(Number.isNaN(r.y)).toBe(true);
  });

  test('Infinity / -Infinity 피연산자는 JavaScript % 결과를 따른다', () => {
    const r1 = modulo({ x: Number.POSITIVE_INFINITY, y: 5 }, { x: 3, y: Number.POSITIVE_INFINITY });
    expect(Number.isNaN(r1.x)).toBe(true);
    expect(r1.y).toBe(5);
    const r2 = modulo({ x: Number.NEGATIVE_INFINITY, y: 5 }, { x: 3, y: 3 });
    expect(Number.isNaN(r2.x)).toBe(true);
    expect(r2.y).toBe(2);
  });

  test('NaN 피연산자는 NaN을 반환한다', () => {
    const r = modulo({ x: Number.NaN, y: 5 }, { x: 3, y: Number.NaN });
    expect(Number.isNaN(r.x)).toBe(true);
    expect(Number.isNaN(r.y)).toBe(true);
  });

  test('-0 피제수는 -0 성분을 만든다(Object.is로 검증)', () => {
    const out: PointWritable = { x: 0, y: 0 };
    moduloInto(out, { x: -0, y: -6 }, { x: 5, y: 4 });
    expect(Object.is(out.x, -0)).toBe(true);
    expect(out.y).toBe(-2);
    const r = modulo({ x: -0, y: -6 }, { x: 5, y: 4 });
    expect(Object.is(r.x, -0)).toBe(true);
    expect(r.y).toBe(-2);
  });

  test('companion은 Into와 동일한 결과를 반환한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    moduloInto(out, { x: 7, y: 11 }, { x: 4, y: 5 });
    const companion = modulo({ x: 7, y: 11 }, { x: 4, y: 5 });
    expect(companion.x).toBe(out.x);
    expect(companion.y).toBe(out.y);
  });
});
