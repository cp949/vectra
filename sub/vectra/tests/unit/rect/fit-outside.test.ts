/**
 * rect.fitOutside — fitOutsideInto의 companion. 새 plain RectWritable을 반환한다.
 *
 * 검증: 새 object 반환, fitOutsideInto와 결과 일치, input mutation 없음.
 */
import { describe, expect, test } from 'vitest';
import { fitOutside } from '../../../src/rect/fit-outside';
import { fitOutsideInto } from '../../../src/rect/fit-outside-into';

describe('rect - fitOutside (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const target = { x: 0, y: 0, width: 1, height: 2 };
    const container = { x: 0, y: 0, width: 2, height: 2 };
    const result = fitOutside(target, container);
    expect(result).toEqual({ x: 0, y: -1, width: 2, height: 4 });
  });

  test('fitOutsideInto와 동일한 결과를 반환한다 - cover 기본 케이스', () => {
    const target = { x: 0, y: 0, width: 1, height: 4 };
    const container = { x: 10, y: 20, width: 10, height: 10 };
    const expected = fitOutsideInto({ x: 0, y: 0, width: 0, height: 0 }, target, container);
    expect(fitOutside(target, container)).toEqual(expected);
  });

  test('fitOutsideInto와 동일한 결과를 반환한다 - empty container', () => {
    const target = { x: 0, y: 0, width: 100, height: 100 };
    const container = { x: 5, y: 6, width: 0, height: 20 };
    const expected = fitOutsideInto({ x: 0, y: 0, width: 0, height: 0 }, target, container);
    expect(fitOutside(target, container)).toEqual(expected);
  });

  test('input rect를 mutate하지 않는다', () => {
    const target = { x: 1, y: 2, width: 1, height: 2 };
    const container = { x: 10, y: 20, width: 2, height: 2 };
    fitOutside(target, container);
    expect(target).toEqual({ x: 1, y: 2, width: 1, height: 2 });
    expect(container).toEqual({ x: 10, y: 20, width: 2, height: 2 });
  });

  test('호출마다 새 object를 반환한다', () => {
    const target = { x: 0, y: 0, width: 1, height: 2 };
    const container = { x: 0, y: 0, width: 2, height: 2 };
    const a = fitOutside(target, container);
    const b = fitOutside(target, container);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
