/**
 * grid neighbor collection(gridNeighbors4Into / gridNeighbors4 / gridNeighbors8Into / gridNeighbors8)
 * 계약 테스트.
 *
 * gridNeighbors4의 N/E/S/W order, gridNeighbors8의 N/NE/E/SE/S/SW/W/NW order, center cell 미포함,
 * tuple/object cell input, negative cell offset, invalid col/row(NaN/Infinity/-Infinity/non-integer)·
 * unsafe neighbor result RangeError, Into 같은 array ref 반환과 성공 시 content 교체, validation
 * 실패 시 out 미수정, companion 새 plain array 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridNeighbors4 } from '../../../src/grid/grid-neighbors-4';
import { gridNeighbors4Into } from '../../../src/grid/grid-neighbors-4-into';
import { gridNeighbors8 } from '../../../src/grid/grid-neighbors-8';
import { gridNeighbors8Into } from '../../../src/grid/grid-neighbors-8-into';
import type { GridCellWritable } from '../../../src/types';

describe('gridNeighbors4Into - cardinal neighbor collection', () => {
  test('object cell에서 N, E, S, W 순서로 4개 neighbor를 기록한다', () => {
    const out: GridCellWritable[] = [];
    const result = gridNeighbors4Into(out, { col: 10, row: 20 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { col: 10, row: 19 },
      { col: 11, row: 20 },
      { col: 10, row: 21 },
      { col: 9, row: 20 },
    ]);
  });

  test('tuple cell input을 object cell과 동일하게 처리한다', () => {
    const out: GridCellWritable[] = [];
    gridNeighbors4Into(out, [10, 20]);
    expect(out).toEqual([
      { col: 10, row: 19 },
      { col: 11, row: 20 },
      { col: 10, row: 21 },
      { col: 9, row: 20 },
    ]);
  });

  test('negative col/row cell도 offset을 그대로 적용한다', () => {
    const out: GridCellWritable[] = [];
    gridNeighbors4Into(out, { col: -3, row: -5 });
    expect(out).toEqual([
      { col: -3, row: -6 },
      { col: -2, row: -5 },
      { col: -3, row: -4 },
      { col: -4, row: -5 },
    ]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1.5])(
    'invalid col/row %s는 RangeError다',
    (bad) => {
      expect(() => gridNeighbors4Into([], { col: bad, row: 0 })).toThrow(RangeError);
      expect(() => gridNeighbors4Into([], { col: 0, row: bad })).toThrow(RangeError);
    }
  );

  test('neighbor 계산 결과가 unsafe integer이면 RangeError다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridNeighbors4Into(out, { col: Number.MAX_SAFE_INTEGER, row: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });

  test('Into는 같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: GridCellWritable[] = [
      { col: 7, row: 7 },
      { col: 8, row: 8 },
    ];
    const result = gridNeighbors4Into(out, { col: 0, row: 0 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { col: 0, row: -1 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: -1, row: 0 },
    ]);
  });

  test('기존 out이 결과보다 길면 stale 잔여 element를 제거한다', () => {
    const out: GridCellWritable[] = [
      { col: 1, row: 1 },
      { col: 2, row: 2 },
      { col: 3, row: 3 },
      { col: 4, row: 4 },
      { col: 5, row: 5 },
    ];
    const result = gridNeighbors4Into(out, { col: 0, row: 0 });
    expect(result).toBe(out);
    expect(out).toHaveLength(4);
    expect(out).toEqual([
      { col: 0, row: -1 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: -1, row: 0 },
    ]);
  });

  test('validation 실패 시 out을 수정하지 않는다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridNeighbors4Into(out, { col: Number.NaN, row: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });
});

describe('gridNeighbors4 - allocating companion', () => {
  test('새 plain { col, row }[] 배열을 반환한다', () => {
    expect(gridNeighbors4({ col: 0, row: 0 })).toEqual([
      { col: 0, row: -1 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: -1, row: 0 },
    ]);
  });

  test('호출마다 서로 다른 새 array ref를 반환한다', () => {
    expect(gridNeighbors4({ col: 0, row: 0 })).not.toBe(gridNeighbors4({ col: 0, row: 0 }));
  });

  test('companion도 invalid input에서 RangeError다', () => {
    expect(() => gridNeighbors4({ col: Number.NaN, row: 0 })).toThrow(RangeError);
  });
});

describe('gridNeighbors8Into - cardinal + diagonal neighbor collection', () => {
  test('N, NE, E, SE, S, SW, W, NW 순서로 8개 neighbor를 기록한다', () => {
    const out: GridCellWritable[] = [];
    const result = gridNeighbors8Into(out, { col: 10, row: 20 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { col: 10, row: 19 },
      { col: 11, row: 19 },
      { col: 11, row: 20 },
      { col: 11, row: 21 },
      { col: 10, row: 21 },
      { col: 9, row: 21 },
      { col: 9, row: 20 },
      { col: 9, row: 19 },
    ]);
  });

  test('center cell을 포함하지 않는다', () => {
    const out = gridNeighbors8Into([], { col: 10, row: 20 });
    expect(out).not.toContainEqual({ col: 10, row: 20 });
    expect(out).toHaveLength(8);
  });

  test('tuple cell input을 처리한다', () => {
    const out: GridCellWritable[] = [];
    gridNeighbors8Into(out, [0, 0]);
    expect(out).toEqual([
      { col: 0, row: -1 },
      { col: 1, row: -1 },
      { col: 1, row: 0 },
      { col: 1, row: 1 },
      { col: 0, row: 1 },
      { col: -1, row: 1 },
      { col: -1, row: 0 },
      { col: -1, row: -1 },
    ]);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1.5])(
    'invalid col/row %s는 RangeError다',
    (bad) => {
      expect(() => gridNeighbors8Into([], { col: bad, row: 0 })).toThrow(RangeError);
    }
  );

  test('neighbor 계산 결과가 unsafe integer이면 RangeError다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridNeighbors8Into(out, { col: Number.MAX_SAFE_INTEGER, row: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });

  test('validation 실패 시 out을 수정하지 않는다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridNeighbors8Into(out, { col: 0, row: Number.NaN })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });
});

describe('gridNeighbors8 - allocating companion', () => {
  test('새 plain { col, row }[] 배열을 반환한다', () => {
    expect(gridNeighbors8({ col: 0, row: 0 })).toEqual([
      { col: 0, row: -1 },
      { col: 1, row: -1 },
      { col: 1, row: 0 },
      { col: 1, row: 1 },
      { col: 0, row: 1 },
      { col: -1, row: 1 },
      { col: -1, row: 0 },
      { col: -1, row: -1 },
    ]);
  });

  test('호출마다 서로 다른 새 array ref를 반환한다', () => {
    expect(gridNeighbors8({ col: 0, row: 0 })).not.toBe(gridNeighbors8({ col: 0, row: 0 }));
  });

  test('companion도 invalid input에서 RangeError다', () => {
    expect(() => gridNeighbors8({ col: Number.NaN, row: 0 })).toThrow(RangeError);
  });
});
