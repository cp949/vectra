/**
 * rect.toSquare — toSquareInto의 companion. 새 plain RectWritable을 반환한다.
 *
 * 검증: 새 object 반환, toSquareInto와 결과 일치, mode 전달, input mutation 없음.
 */
import { describe, expect, test } from 'vitest';
import { toSquare } from '../../../src/rect/to-square';
import { toSquareInto } from '../../../src/rect/to-square-into';

describe('rect - toSquare (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = toSquare({ x: 0, y: 0, width: 10, height: 4 });
    expect(result).toEqual({ x: 3, y: 0, width: 4, height: 4 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  test('default mode는 min: width > height인 rect의 짧은 변을 사용한다', () => {
    expect(toSquare({ x: 0, y: 0, width: 10, height: 4 })).toEqual({ x: 3, y: 0, width: 4, height: 4 });
  });

  test('mode "max" 인자: 긴 변을 사용한다', () => {
    expect(toSquare({ x: 0, y: 0, width: 10, height: 4 }, 'max')).toEqual({ x: 0, y: -3, width: 10, height: 10 });
  });

  test('toSquareInto와 동일한 결과 - min', () => {
    const rect = { x: 5, y: 6, width: 7, height: 3 };
    const expected = toSquareInto({ x: 0, y: 0, width: 0, height: 0 }, rect, 'min');
    expect(toSquare(rect, 'min')).toEqual(expected);
  });

  test('toSquareInto와 동일한 결과 - max', () => {
    const rect = { x: 5, y: 6, width: 7, height: 3 };
    const expected = toSquareInto({ x: 0, y: 0, width: 0, height: 0 }, rect, 'max');
    expect(toSquare(rect, 'max')).toEqual(expected);
  });

  test('toSquareInto와 동일한 결과 - empty rect', () => {
    const rect = { x: 5, y: 6, width: 0, height: 10 };
    const expected = toSquareInto({ x: 0, y: 0, width: 0, height: 0 }, rect);
    expect(toSquare(rect)).toEqual(expected);
  });

  test('input rect를 mutate하지 않는다', () => {
    const rect = { x: 1, y: 2, width: 10, height: 4 };
    toSquare(rect, 'max');
    expect(rect).toEqual({ x: 1, y: 2, width: 10, height: 4 });
  });

  test('잘못된 mode는 RangeError', () => {
    expect(() => toSquare({ x: 0, y: 0, width: 10, height: 4 }, 'bad' as 'min')).toThrow(RangeError);
  });

  test('호출마다 새 object를 반환한다', () => {
    const rect = { x: 0, y: 0, width: 10, height: 4 };
    const a = toSquare(rect);
    const b = toSquare(rect);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
