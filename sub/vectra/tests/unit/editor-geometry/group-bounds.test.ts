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
    const out = { min: { x: 99, y: 99 }, max: { x: 100, y: 100 } };
    const result = groupBoundsInto(out, []);
    expect(result).toBe(false);
    expect(out.min.x).toBe(99);
    expect(out.min.y).toBe(99);
    expect(out.max.x).toBe(100);
    expect(out.max.y).toBe(100);
  });

  test('단일 object bounds를 그대로 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const result = groupBoundsInto(out, [{ min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }]);
    expect(result).toBe(true);
    expect(out.min.x).toBe(1);
    expect(out.min.y).toBe(2);
    expect(out.max.x).toBe(5);
    expect(out.max.y).toBe(6);
  });

  test('단일 tuple bounds를 그대로 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const min = { x: 3, y: 4 } as const;
    const max = { x: 7, y: 8 } as const;
    const result = groupBoundsInto(out, [[min, max]]);
    expect(result).toBe(true);
    expect(out.min.x).toBe(3);
    expect(out.min.y).toBe(4);
    expect(out.max.x).toBe(7);
    expect(out.max.y).toBe(8);
  });

  test('다수 object bounds의 union을 기록한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const result = groupBoundsInto(out, [
      { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } },
      { min: { x: 3, y: 0 }, max: { x: 9, y: 4 } },
      { min: { x: -1, y: 1 }, max: { x: 2, y: 3 } },
    ]);
    expect(result).toBe(true);
    expect(out.min.x).toBe(-1);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(9);
    expect(out.max.y).toBe(6);
  });

  test('tuple 형식 BoundsLike 입력을 처리한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const a = [
      { x: 0, y: 0 },
      { x: 4, y: 4 },
    ] as const;
    const b = [
      { x: 2, y: 2 },
      { x: 6, y: 8 },
    ] as const;
    const result = groupBoundsInto(out, [a, b]);
    expect(result).toBe(true);
    expect(out.min.x).toBe(0);
    expect(out.min.y).toBe(0);
    expect(out.max.x).toBe(6);
    expect(out.max.y).toBe(8);
  });

  test('object 형식과 tuple 형식 BoundsLike를 혼합해서 처리한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const tuple = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ] as const;
    const result = groupBoundsInto(out, [{ min: { x: 5, y: 5 }, max: { x: 15, y: 15 } }, tuple]);
    expect(result).toBe(true);
    expect(out.min.x).toBe(5);
    expect(out.min.y).toBe(5);
    expect(out.max.x).toBe(20);
    expect(out.max.y).toBe(20);
  });

  test('zero-size bounds(width/height = 0)를 정상 처리한다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const result = groupBoundsInto(out, [
      { min: { x: 3, y: 3 }, max: { x: 3, y: 3 } },
      { min: { x: 5, y: 5 }, max: { x: 5, y: 5 } },
    ]);
    expect(result).toBe(true);
    expect(out.min.x).toBe(3);
    expect(out.min.y).toBe(3);
    expect(out.max.x).toBe(5);
    expect(out.max.y).toBe(5);
  });

  test('NaN 좌표는 IEEE-754 propagation된다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    groupBoundsInto(out, [{ min: { x: Number.NaN, y: 0 }, max: { x: 10, y: 10 } }]);
    expect(out.min.x).toBeNaN();
  });

  test('out을 반환한다 (true 반환 시)', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    const result = groupBoundsInto(out, [{ min: { x: 1, y: 1 }, max: { x: 2, y: 2 } }]);
    expect(result).toBe(true);
  });

  test('out aliasing - 동일 out을 재사용해도 안전하다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } };
    groupBoundsInto(out, [
      { min: { x: 1, y: 1 }, max: { x: 3, y: 3 } },
      { min: { x: 2, y: 2 }, max: { x: 7, y: 7 } },
    ]);
    expect(out.min.x).toBe(1);
    expect(out.min.y).toBe(1);
    expect(out.max.x).toBe(7);
    expect(out.max.y).toBe(7);
  });

  test('inverted bounds를 그대로 사용한다(caller 정규화 가정)', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    // min > max: inverted bounds
    groupBoundsInto(out, [{ min: { x: 10, y: 10 }, max: { x: 5, y: 5 } }]);
    // min이 더 크더라도 그대로 기록
    expect(out.min.x).toBe(10);
    expect(out.min.y).toBe(10);
    expect(out.max.x).toBe(5);
    expect(out.max.y).toBe(5);
  });
});

// --- groupBounds ---

describe('editor-geometry - groupBounds', () => {
  test('빈 배열이면 undefined를 반환한다', () => {
    const result = groupBounds([]);
    expect(result).toBeUndefined();
  });

  test('단일 object bounds를 plain object로 반환한다', () => {
    const result = groupBounds([{ min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }]);
    expect(result).not.toBeUndefined();
    expect(result?.min.x).toBe(1);
    expect(result?.min.y).toBe(2);
    expect(result?.max.x).toBe(5);
    expect(result?.max.y).toBe(6);
  });

  test('단일 tuple bounds를 plain object로 반환한다', () => {
    const min = { x: 3, y: 4 } as const;
    const max = { x: 7, y: 8 } as const;
    const result = groupBounds([[min, max]]);
    expect(result?.min.x).toBe(3);
    expect(result?.min.y).toBe(4);
    expect(result?.max.x).toBe(7);
    expect(result?.max.y).toBe(8);
  });

  test('다수 bounds의 union을 plain object로 반환한다', () => {
    const result = groupBounds([
      { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } },
      { min: { x: 3, y: 0 }, max: { x: 9, y: 4 } },
      { min: { x: -1, y: 1 }, max: { x: 2, y: 3 } },
    ]);
    expect(result?.min.x).toBe(-1);
    expect(result?.min.y).toBe(0);
    expect(result?.max.x).toBe(9);
    expect(result?.max.y).toBe(6);
  });

  test('결과 object는 plain { min, max } 형태다', () => {
    const result = groupBounds([{ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }]);
    expect(result).toEqual({
      min: { x: 0, y: 0 },
      max: { x: 10, y: 10 },
    });
  });

  test('zero-size bounds를 정상 처리한다', () => {
    const result = groupBounds([{ min: { x: 5, y: 5 }, max: { x: 5, y: 5 } }]);
    expect(result?.min.x).toBe(5);
    expect(result?.min.y).toBe(5);
    expect(result?.max.x).toBe(5);
    expect(result?.max.y).toBe(5);
  });

  test('NaN 좌표는 propagation된다', () => {
    const result = groupBounds([{ min: { x: Number.NaN, y: 0 }, max: { x: 10, y: 10 } }]);
    expect(result?.min.x).toBeNaN();
  });
});
