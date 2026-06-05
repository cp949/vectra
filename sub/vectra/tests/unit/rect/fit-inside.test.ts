/**
 * rect.fitInside — fitInsideInto의 companion. 새 plain RectWritable을 반환한다.
 *
 * 검증: 새 object 반환, fitInsideInto와 결과 일치, input mutation 없음.
 */
import { describe, expect, test } from 'vitest';
import { fitInside } from '../../../src/rect/fit-inside';
import { fitInsideInto } from '../../../src/rect/fit-inside-into';

describe('rect - fitInside (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const target = { x: 0, y: 0, width: 200, height: 100 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    const result = fitInside(target, container);
    expect(result).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  test('fitInsideInto와 동일한 결과를 반환한다 - contain 기본 케이스', () => {
    const target = { x: 0, y: 0, width: 200, height: 100 };
    const container = { x: 10, y: 20, width: 100, height: 100 };
    const expected = fitInsideInto({ x: 0, y: 0, width: 0, height: 0 }, target, container);
    expect(fitInside(target, container)).toEqual(expected);
  });

  test('fitInsideInto와 동일한 결과를 반환한다 - empty target', () => {
    const target = { x: 0, y: 0, width: 0, height: 100 };
    const container = { x: 5, y: 6, width: 10, height: 20 };
    const expected = fitInsideInto({ x: 0, y: 0, width: 0, height: 0 }, target, container);
    expect(fitInside(target, container)).toEqual(expected);
  });

  test('input rect를 mutate하지 않는다', () => {
    const target = { x: 1, y: 2, width: 200, height: 100 };
    const container = { x: 10, y: 20, width: 100, height: 100 };
    fitInside(target, container);
    expect(target).toEqual({ x: 1, y: 2, width: 200, height: 100 });
    expect(container).toEqual({ x: 10, y: 20, width: 100, height: 100 });
  });

  test('호출마다 새 object를 반환한다', () => {
    const target = { x: 0, y: 0, width: 200, height: 100 };
    const container = { x: 0, y: 0, width: 100, height: 100 };
    const a = fitInside(target, container);
    const b = fitInside(target, container);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
