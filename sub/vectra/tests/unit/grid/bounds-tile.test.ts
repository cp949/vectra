/**
 * bounds tile(boundsTileInto / boundsTile) 계약 테스트.
 *
 * exact multiple equal tile collection, 오른쪽/아래 remainder tile 포함, tile이 bounds보다 크면
 * single clipped tile, rectangular tile size와 non-zero min, zero-width bounds의 zero-extent tile,
 * invalid tile size / inverted / non-finite bounds / oversized count RangeError, Into 같은 array ref
 * 반환과 성공 시 content 교체, validation 실패 시 out 미수정, companion 새 plain array 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { boundsTile } from '../../../src/grid/bounds-tile';
import { boundsTileInto } from '../../../src/grid/bounds-tile-into';
import type { RectWritable } from '../../../src/types';

describe('boundsTileInto - bounds를 fixed tile size로 분할', () => {
  test('exact multiple bounds에서 equal tile collection을 row-major로 기록한다', () => {
    const out: RectWritable[] = [];
    const result = boundsTileInto(out, { min: { x: 0, y: 0 }, max: { x: 20, y: 20 } }, 10);
    expect(result).toBe(out);
    expect(out).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
      { x: 0, y: 10, width: 10, height: 10 },
      { x: 10, y: 10, width: 10, height: 10 },
    ]);
  });

  test('오른쪽/아래 remainder tile을 포함한다', () => {
    const out: RectWritable[] = [];
    boundsTileInto(out, { min: { x: 0, y: 0 }, max: { x: 25, y: 15 } }, 10);
    expect(out).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
      { x: 20, y: 0, width: 5, height: 10 },
      { x: 0, y: 10, width: 10, height: 5 },
      { x: 10, y: 10, width: 10, height: 5 },
      { x: 20, y: 10, width: 5, height: 5 },
    ]);
  });

  test('tile이 bounds보다 크면 single clipped tile을 반환한다', () => {
    const out: RectWritable[] = [];
    boundsTileInto(out, { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, 10);
    expect(out).toEqual([{ x: 0, y: 0, width: 5, height: 5 }]);
  });

  test('rectangular tile size와 non-zero min을 처리한다', () => {
    const out: RectWritable[] = [];
    boundsTileInto(out, { min: { x: 5, y: 5 }, max: { x: 25, y: 15 } }, { x: 10, y: 5 });
    expect(out).toEqual([
      { x: 5, y: 5, width: 10, height: 5 },
      { x: 15, y: 5, width: 10, height: 5 },
      { x: 5, y: 10, width: 10, height: 5 },
      { x: 15, y: 10, width: 10, height: 5 },
    ]);
  });

  test('tuple bounds input을 object bounds와 동일하게 처리한다', () => {
    const out: RectWritable[] = [];
    boundsTileInto(
      out,
      [
        [0, 0],
        [20, 10],
      ],
      10
    );
    expect(out).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    ]);
  });

  test('zero-width bounds는 single zero-width tile column을 반환한다', () => {
    const out: RectWritable[] = [];
    boundsTileInto(out, { min: { x: 0, y: 0 }, max: { x: 0, y: 10 } }, 10);
    expect(out).toEqual([{ x: 0, y: 0, width: 0, height: 10 }]);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'invalid tile size %s는 RangeError다',
    (tileSize) => {
      expect(() => boundsTileInto([], { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, tileSize)).toThrow(RangeError);
    }
  );

  test('rectangular tile size의 한 축만 invalid여도 RangeError다', () => {
    expect(() => boundsTileInto([], { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, { x: 10, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY])('non-finite bounds 성분 %s는 RangeError다', (bad) => {
    expect(() => boundsTileInto([], { min: { x: 0, y: bad }, max: { x: 10, y: 10 } }, 10)).toThrow(RangeError);
  });

  test('inverted bounds는 RangeError다', () => {
    expect(() => boundsTileInto([], { min: { x: 0, y: 10 }, max: { x: 10, y: 0 } }, 10)).toThrow(RangeError);
  });

  test('safe array length를 넘는 tile count는 RangeError다', () => {
    expect(() =>
      boundsTileInto([], { min: { x: 0, y: 0 }, max: { x: Number.MAX_VALUE, y: 1 } }, { x: Number.MIN_VALUE, y: 1 })
    ).toThrow(RangeError);
  });

  test('Into는 같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: RectWritable[] = [
      { x: 7, y: 7, width: 7, height: 7 },
      { x: 8, y: 8, width: 8, height: 8 },
    ];
    const result = boundsTileInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 10);
    expect(result).toBe(out);
    expect(out).toEqual([{ x: 0, y: 0, width: 10, height: 10 }]);
  });

  test('validation 실패 시 out을 수정하지 않는다', () => {
    const out: RectWritable[] = [{ x: 7, y: 7, width: 7, height: 7 }];
    expect(() => boundsTileInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 0)).toThrow(RangeError);
    expect(out).toEqual([{ x: 7, y: 7, width: 7, height: 7 }]);
  });
});

describe('boundsTile - allocating companion', () => {
  test('새 plain rect 배열을 반환한다', () => {
    expect(boundsTile({ min: { x: 0, y: 0 }, max: { x: 20, y: 10 } }, 10)).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    ]);
  });

  test('companion도 invalid tile size에서 RangeError다', () => {
    expect(() => boundsTile({ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 0)).toThrow(RangeError);
  });
});
