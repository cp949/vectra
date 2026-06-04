import { describe, expect, test } from 'vitest';
import { intersection } from '../../../src/bounds/intersection';
import { toRect } from '../../../src/bounds/to-rect';
import { union } from '../../../src/bounds/union';

describe('bounds allocating companions', () => {
  test('union은 plain bounds를 반환한다', () => {
    const result = union({ min: { x: 0, y: 1 }, max: { x: 4, y: 5 } }, { min: { x: 2, y: 0 }, max: { x: 6, y: 5 } });
    expect(result).toEqual({ min: { x: 0, y: 0 }, max: { x: 6, y: 5 } });
  });

  test('intersection은 양수-area 겹침에서 plain bounds를 반환한다', () => {
    const result = intersection(
      { min: { x: 0, y: 0 }, max: { x: 5, y: 5 } },
      { min: { x: 3, y: 2 }, max: { x: 8, y: 7 } }
    );
    expect(result).toEqual({ min: { x: 3, y: 2 }, max: { x: 5, y: 5 } });
  });

  test('intersection은 edge touch에서 undefined를 반환한다', () => {
    expect(
      intersection({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, { min: { x: 5, y: 0 }, max: { x: 8, y: 5 } })
    ).toBeUndefined();
  });

  test('toRect는 plain rect를 반환한다', () => {
    const result = toRect({ min: { x: -2, y: 3 }, max: { x: 5, y: 9 } });
    expect(result).toEqual({ x: -2, y: 3, width: 7, height: 6 });
  });
});
