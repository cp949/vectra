/**
 * polygon collection companion unit test.
 *
 * 각 companion이 대응 *-into 함수와 동등한 결과를 반환하는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { reversePoints } from '../../../src/polygon/reverse-points';
import { reversePointsInto } from '../../../src/polygon/reverse-points-into';
import { transformPoints } from '../../../src/polygon/transform-points';
import { transformPointsInto } from '../../../src/polygon/transform-points-into';
import { translatePoints } from '../../../src/polygon/translate-points';
import { translatePointsInto } from '../../../src/polygon/translate-points-into';

const POINTS = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 0, y: 10 },
];
const MATRIX = { a: 1, b: 0, c: 0, d: 1, tx: 2, ty: 3 };

describe('polygon.translatePoints — 새 배열 반환', () => {
  test('translatePointsInto 결과와 deep equal이다', () => {
    expect(translatePoints(POINTS, { x: 2, y: 3 })).toEqual(translatePointsInto([], POINTS, { x: 2, y: 3 }));
  });

  test('translatePointsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = translatePointsInto([], out, { x: 2, y: 3 });

    expect(translatePointsInto(out, out, { x: 2, y: 3 })).toEqual(expected);
  });
});

describe('polygon.transformPoints — 새 배열 반환', () => {
  test('transformPointsInto 결과와 deep equal이다', () => {
    expect(transformPoints(POINTS, MATRIX)).toEqual(transformPointsInto([], POINTS, MATRIX));
  });

  test('transformPointsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = transformPointsInto([], out, MATRIX);

    expect(transformPointsInto(out, out, MATRIX)).toEqual(expected);
  });
});

describe('polygon.reversePoints — 새 배열 반환', () => {
  test('reversePointsInto 결과와 deep equal이다', () => {
    expect(reversePoints(POINTS)).toEqual(reversePointsInto([], POINTS));
  });

  test('reversePointsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = reversePointsInto([], out);

    expect(reversePointsInto(out, out)).toEqual(expected);
  });
});
