/**
 * grid line traversal(gridLineInto / gridLine) 계약 테스트.
 *
 * same cell single output, horizontal/vertical/45도 diagonal/steep/shallow slope의 deterministic
 * Bresenham order, negative direction의 start → end order, tuple/object cell input, invalid col/row
 * (NaN/Infinity/-Infinity/non-integer)·unsafe integer·line length overflow RangeError, Into 같은
 * array ref 반환과 성공 시 content 교체, validation 실패 시 out 미수정, companion 새 plain array
 * 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridLine } from '../../../src/grid/grid-line';
import { gridLineInto } from '../../../src/grid/grid-line-into';
import type { GridCellWritable } from '../../../src/types';

describe('gridLineInto - start cell에서 end cell까지 Bresenham traversal', () => {
  test('same cell은 한 cell만 기록한다', () => {
    const out: GridCellWritable[] = [];
    const result = gridLineInto(out, { col: 3, row: 3 }, { col: 3, row: 3 });
    expect(result).toBe(out);
    expect(out).toEqual([{ col: 3, row: 3 }]);
  });

  test('horizontal line을 start → end 순서로 기록한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 0, row: 0 }, { col: 3, row: 0 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 3, row: 0 },
    ]);
  });

  test('vertical line을 start → end 순서로 기록한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 0, row: 0 }, { col: 0, row: 3 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 0, row: 1 },
      { col: 0, row: 2 },
      { col: 0, row: 3 },
    ]);
  });

  test('45도 diagonal line을 기록한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 0, row: 0 }, { col: 3, row: 3 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 1 },
      { col: 2, row: 2 },
      { col: 3, row: 3 },
    ]);
  });

  test('steep slope의 deterministic Bresenham order를 고정한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 0, row: 0 }, { col: 2, row: 5 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 2 },
      { col: 1, row: 3 },
      { col: 2, row: 4 },
      { col: 2, row: 5 },
    ]);
  });

  test('shallow slope의 deterministic Bresenham order를 고정한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 0, row: 0 }, { col: 5, row: 2 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 1 },
      { col: 3, row: 1 },
      { col: 4, row: 2 },
      { col: 5, row: 2 },
    ]);
  });

  test('asymmetric slope의 tie에서 두 축을 동시에 step한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 0, row: 0 }, { col: 2, row: 4 });
    // adx=2, ady=4. step 0과 step 2에서 col/row가 같은 iteration에 동시 step(diagonal)한다.
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 1 },
      { col: 1, row: 2 },
      { col: 2, row: 3 },
      { col: 2, row: 4 },
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
    const result = gridLineInto(out, { col: 8, row: 8 }, { col: 8, row: 8 });
    expect(result).toBe(out);
    expect(out).toEqual([{ col: 8, row: 8 }]);
  });

  test('end가 start보다 작은 negative direction도 start → end 순서로 기록한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, { col: 3, row: 3 }, { col: 0, row: 0 });
    expect(out).toEqual([
      { col: 3, row: 3 },
      { col: 2, row: 2 },
      { col: 1, row: 1 },
      { col: 0, row: 0 },
    ]);
  });

  test('tuple cell input을 object cell과 동일하게 처리한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, [0, 0], [2, 0]);
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
    ]);
  });

  test('start는 tuple, end는 object인 혼합 입력도 처리한다', () => {
    const out: GridCellWritable[] = [];
    gridLineInto(out, [0, 0], { col: 2, row: 0 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
    ]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
  ])('invalid col/row %s는 RangeError다', (bad) => {
    expect(() => gridLineInto([], { col: bad, row: 0 }, { col: 3, row: 0 })).toThrow(RangeError);
    expect(() => gridLineInto([], { col: 0, row: 0 }, { col: bad, row: 0 })).toThrow(RangeError);
  });

  test('safe integer 범위를 벗어난 col/row는 RangeError다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridLineInto(out, { col: 2 ** 53, row: 0 }, { col: 0, row: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });

  test('line length가 safe array length를 넘으면 RangeError다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridLineInto(out, { col: 0, row: 0 }, { col: Number.MAX_SAFE_INTEGER, row: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });

  test('Into는 같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: GridCellWritable[] = [
      { col: 7, row: 7 },
      { col: 8, row: 8 },
    ];
    const result = gridLineInto(out, { col: 0, row: 0 }, { col: 1, row: 0 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
    ]);
  });

  test('validation 실패 시 out을 수정하지 않는다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridLineInto(out, { col: Number.NaN, row: 0 }, { col: 3, row: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });
});

describe('gridLine - allocating companion', () => {
  test('새 plain { col, row }[] 배열을 반환한다', () => {
    expect(gridLine({ col: 0, row: 0 }, { col: 2, row: 2 })).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 1 },
      { col: 2, row: 2 },
    ]);
  });

  test('호출마다 서로 다른 새 array ref를 반환한다', () => {
    const a = gridLine({ col: 0, row: 0 }, { col: 1, row: 0 });
    const b = gridLine({ col: 0, row: 0 }, { col: 1, row: 0 });
    expect(a).not.toBe(b);
  });

  test('companion도 invalid input에서 RangeError다', () => {
    expect(() => gridLine({ col: Number.NaN, row: 0 }, { col: 2, row: 0 })).toThrow(RangeError);
  });
});
