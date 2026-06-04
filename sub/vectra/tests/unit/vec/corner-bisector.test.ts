/**
 * cornerBisector helper 단위 테스트.
 *
 * 대상 함수:
 *  - cornerBisectorInto : corner vertex b의 내각 이등분 단위 벡터를 out에 기록 (boolean-primary)
 *  - cornerBisector     : allocating companion, 실패 시 undefined
 */

import { describe, expect, test } from 'vitest';
import type { XYWritable } from '../../../src/types';
import { cornerBisector } from '../../../src/vec/corner-bisector';
import { cornerBisectorInto } from '../../../src/vec/corner-bisector-into';

const SQRT1_2 = Math.SQRT1_2;

describe('cornerBisectorInto — 내각 이등분 단위 벡터', () => {
  test('직각 corner의 bisector는 단위 대각선 방향이다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = cornerBisectorInto(out, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(SQRT1_2);
    expect(out.y).toBeCloseTo(SQRT1_2);
  });

  test('성공 결과는 단위 벡터다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    cornerBisectorInto(out, { x: 4, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 3 });

    expect(Math.hypot(out.x, out.y)).toBeCloseTo(1);
  });

  test('tuple 입력을 처리하고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = cornerBisectorInto(out, [1, 0], [0, 0], [0, 1]);

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(SQRT1_2);
    expect(out.y).toBeCloseTo(SQRT1_2);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = cornerBisectorInto(out, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(SQRT1_2);
    expect(out[1]).toBeCloseTo(SQRT1_2);
  });

  test('out === b self-aliasing에서도 정확한 결과를 반환한다', () => {
    const b: XYWritable = { x: 0, y: 0 };
    const result = cornerBisectorInto(b, { x: 1, y: 0 }, b, { x: 0, y: 1 });

    expect(result).toBe(b);
    expect(b.x).toBeCloseTo(SQRT1_2);
    expect(b.y).toBeCloseTo(SQRT1_2);
  });

  test('out === a self-aliasing에서도 정확한 결과를 반환한다', () => {
    const a: XYWritable = { x: 1, y: 0 };
    const result = cornerBisectorInto(a, a, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(a);
    expect(a.x).toBeCloseTo(SQRT1_2);
    expect(a.y).toBeCloseTo(SQRT1_2);
  });

  test('a === b zero-length edge는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const result = cornerBisectorInto(out, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('c === b zero-length edge는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const result = cornerBisectorInto(out, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 });

    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('반대 방향 평행 edge는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const result = cornerBisectorInto(out, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 });

    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('NaN 입력은 검증 없이 NaN으로 통과되고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = cornerBisectorInto(out, { x: NaN, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(Number.isNaN((out as { x: number }).x)).toBe(true);
  });

  test('Infinity 입력은 검증 없이 JS 산술 결과로 통과되고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = cornerBisectorInto(out, { x: Infinity, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('-Infinity 입력은 검증 없이 JS 산술 결과로 통과되고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = cornerBisectorInto(out, { x: -Infinity, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });
});

describe('cornerBisector — allocating companion', () => {
  test('성공 시 새 object를 반환한다', () => {
    const result = cornerBisector({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBeDefined();
    expect(result?.x).toBeCloseTo(SQRT1_2);
    expect(result?.y).toBeCloseTo(SQRT1_2);
  });

  test('실패 시 undefined를 반환한다', () => {
    const result = cornerBisector({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 });

    expect(result).toBeUndefined();
  });

  test('반대 방향 평행 edge에서 undefined를 반환한다', () => {
    const result = cornerBisector({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 });

    expect(result).toBeUndefined();
  });
});
