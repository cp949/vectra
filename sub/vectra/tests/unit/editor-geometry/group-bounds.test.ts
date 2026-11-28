/**
 * editor-geometry group-bounds 단위 테스트
 *
 * groupBoundsInto / groupBounds 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { groupBounds } from '../../../src/editor-geometry/group-bounds';
import { groupBoundsInto } from '../../../src/editor-geometry/group-bounds-into';

// --- groupBoundsInto ---

describe('editor-geometry - groupBoundsInto', () => {
  test('빈 배열이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { minX: 99, minY: 99, maxX: 100, maxY: 100 };
    const result = groupBoundsInto(out, []);
    expect(result).toBe(false);
    expect(out.minX).toBe(99);
    expect(out.minY).toBe(99);
    expect(out.maxX).toBe(100);
    expect(out.maxY).toBe(100);
  });

  test('단일 object bounds를 그대로 기록한다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const result = groupBoundsInto(out, [{ minX: 1, minY: 2, maxX: 5, maxY: 6 }]);
    expect(result).toBe(true);
    expect(out.minX).toBe(1);
    expect(out.minY).toBe(2);
    expect(out.maxX).toBe(5);
    expect(out.maxY).toBe(6);
  });

  test('다수 object bounds의 union을 기록한다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const result = groupBoundsInto(out, [
      { minX: 1, minY: 2, maxX: 5, maxY: 6 },
      { minX: 3, minY: 0, maxX: 9, maxY: 4 },
      { minX: -1, minY: 1, maxX: 2, maxY: 3 },
    ]);
    expect(result).toBe(true);
    expect(out.minX).toBe(-1);
    expect(out.minY).toBe(0);
    expect(out.maxX).toBe(9);
    expect(out.maxY).toBe(6);
  });

  test('zero-size bounds(width/height = 0)를 정상 처리한다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const result = groupBoundsInto(out, [
      { minX: 3, minY: 3, maxX: 3, maxY: 3 },
      { minX: 5, minY: 5, maxX: 5, maxY: 5 },
    ]);
    expect(result).toBe(true);
    expect(out.minX).toBe(3);
    expect(out.minY).toBe(3);
    expect(out.maxX).toBe(5);
    expect(out.maxY).toBe(5);
  });

  test('NaN 좌표는 IEEE-754 propagation된다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    groupBoundsInto(out, [{ minX: Number.NaN, minY: 0, maxX: 10, maxY: 10 }]);
    expect(out.minX).toBeNaN();
  });

  test('out을 반환한다 (true 반환 시)', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const result = groupBoundsInto(out, [{ minX: 1, minY: 1, maxX: 2, maxY: 2 }]);
    expect(result).toBe(true);
  });

  test('out aliasing - 동일 out을 재사용해도 안전하다', () => {
    const out = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    groupBoundsInto(out, [
      { minX: 1, minY: 1, maxX: 3, maxY: 3 },
      { minX: 2, minY: 2, maxX: 7, maxY: 7 },
    ]);
    expect(out.minX).toBe(1);
    expect(out.minY).toBe(1);
    expect(out.maxX).toBe(7);
    expect(out.maxY).toBe(7);
  });

  test('inverted bounds를 그대로 사용한다(caller 정규화 가정)', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    // min > max: inverted bounds
    groupBoundsInto(out, [{ minX: 10, minY: 10, maxX: 5, maxY: 5 }]);
    // min이 더 크더라도 그대로 기록
    expect(out.minX).toBe(10);
    expect(out.minY).toBe(10);
    expect(out.maxX).toBe(5);
    expect(out.maxY).toBe(5);
  });
});

// --- groupBounds ---

describe('editor-geometry - groupBounds', () => {
  test('빈 배열이면 undefined를 반환한다', () => {
    const result = groupBounds([]);
    expect(result).toBeUndefined();
  });

  test('단일 object bounds를 plain object로 반환한다', () => {
    const result = groupBounds([{ minX: 1, minY: 2, maxX: 5, maxY: 6 }]);
    expect(result).not.toBeUndefined();
    expect(result?.minX).toBe(1);
    expect(result?.minY).toBe(2);
    expect(result?.maxX).toBe(5);
    expect(result?.maxY).toBe(6);
  });

  test('다수 bounds의 union을 plain object로 반환한다', () => {
    const result = groupBounds([
      { minX: 1, minY: 2, maxX: 5, maxY: 6 },
      { minX: 3, minY: 0, maxX: 9, maxY: 4 },
      { minX: -1, minY: 1, maxX: 2, maxY: 3 },
    ]);
    expect(result?.minX).toBe(-1);
    expect(result?.minY).toBe(0);
    expect(result?.maxX).toBe(9);
    expect(result?.maxY).toBe(6);
  });

  test('결과 object는 plain { min, max } 형태다', () => {
    const result = groupBounds([{ minX: 0, minY: 0, maxX: 10, maxY: 10 }]);
    expect(result).toEqual({
      minX: 0,
      minY: 0,
      maxX: 10,
      maxY: 10,
    });
  });

  test('zero-size bounds를 정상 처리한다', () => {
    const result = groupBounds([{ minX: 5, minY: 5, maxX: 5, maxY: 5 }]);
    expect(result?.minX).toBe(5);
    expect(result?.minY).toBe(5);
    expect(result?.maxX).toBe(5);
    expect(result?.maxY).toBe(5);
  });

  test('NaN 좌표는 propagation된다', () => {
    const result = groupBounds([{ minX: Number.NaN, minY: 0, maxX: 10, maxY: 10 }]);
    expect(result?.minX).toBeNaN();
  });
});
