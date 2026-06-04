/**
 * polyline collection companion unit test.
 *
 * 각 companion이 대응 *-into 함수와 동등한 결과를 반환하는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { reversePoints } from '../../../src/polyline/reverse-points';
import { reversePointsInto } from '../../../src/polyline/reverse-points-into';
import { sampleFixedCount } from '../../../src/polyline/sample-fixed-count';
import { sampleFixedCountInto } from '../../../src/polyline/sample-fixed-count-into';
import { sampleUniform } from '../../../src/polyline/sample-uniform';
import { sampleUniformInto } from '../../../src/polyline/sample-uniform-into';
import { simplify } from '../../../src/polyline/simplify';
import { simplifyInto } from '../../../src/polyline/simplify-into';
import { tangents } from '../../../src/polyline/tangents';
import { tangentsInto } from '../../../src/polyline/tangents-into';
import { transformPoints } from '../../../src/polyline/transform-points';
import { transformPointsInto } from '../../../src/polyline/transform-points-into';
import { translatePoints } from '../../../src/polyline/translate-points';
import { translatePointsInto } from '../../../src/polyline/translate-points-into';

const POINTS = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];
const MATRIX = { a: 1, b: 0, c: 0, d: 1, tx: 2, ty: 3 };

describe('polyline.translatePoints — 새 배열 반환', () => {
  test('translatePointsInto 결과와 deep equal이다', () => {
    expect(translatePoints(POINTS, { x: 2, y: 3 })).toEqual(translatePointsInto([], POINTS, { x: 2, y: 3 }));
  });

  test('translatePointsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = translatePointsInto([], out, { x: 2, y: 3 });

    expect(translatePointsInto(out, out, { x: 2, y: 3 })).toEqual(expected);
  });
});

describe('polyline.transformPoints — 새 배열 반환', () => {
  test('transformPointsInto 결과와 deep equal이다', () => {
    expect(transformPoints(POINTS, MATRIX)).toEqual(transformPointsInto([], POINTS, MATRIX));
  });

  test('transformPointsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = transformPointsInto([], out, MATRIX);

    expect(transformPointsInto(out, out, MATRIX)).toEqual(expected);
  });
});

describe('polyline.reversePoints — 새 배열 반환', () => {
  test('reversePointsInto 결과와 deep equal이다', () => {
    expect(reversePoints(POINTS)).toEqual(reversePointsInto([], POINTS));
  });

  test('reversePointsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = reversePointsInto([], out);

    expect(reversePointsInto(out, out)).toEqual(expected);
  });
});

describe('polyline.sampleUniform — 새 배열 반환', () => {
  test('sampleUniformInto 결과와 deep equal이다', () => {
    expect(sampleUniform(POINTS, 5)).toEqual(sampleUniformInto([], POINTS, 5));
  });

  test('sampleUniformInto는 입력 배열과 output 배열이 같아도 원래 point 기준 샘플을 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = sampleUniformInto([], out, 5);

    expect(sampleUniformInto(out, out, 5)).toEqual(expected);
  });
});

describe('polyline.sampleFixedCount — 새 배열 반환', () => {
  test('sampleFixedCountInto 결과와 deep equal이다', () => {
    expect(sampleFixedCount(POINTS, 4)).toEqual(sampleFixedCountInto([], POINTS, 4));
  });

  test('sampleFixedCountInto는 입력 배열과 output 배열이 같아도 원래 point 기준 샘플을 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = sampleFixedCountInto([], out, 4);

    expect(sampleFixedCountInto(out, out, 4)).toEqual(expected);
  });
});

describe('polyline.tangents — 새 배열 반환', () => {
  test('tangentsInto 결과와 deep equal이다', () => {
    expect(tangents(POINTS)).toEqual(tangentsInto([], POINTS));
  });

  test('tangentsInto는 입력 배열과 output 배열이 같아도 원래 point 기준 tangent를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = tangentsInto([], out);

    expect(tangentsInto(out, out)).toEqual(expected);
  });
});

describe('polyline.simplify — 새 배열 반환', () => {
  test('simplifyInto 결과와 deep equal이다', () => {
    expect(simplify(POINTS, 0.5)).toEqual(simplifyInto([], POINTS, 0.5));
  });

  test('simplifyInto는 입력 배열과 output 배열이 같아도 원래 point 기준 단순화 결과를 반환한다', () => {
    const out = POINTS.map((point) => ({ ...point }));
    const expected = simplifyInto([], out, 0.5);

    expect(simplifyInto(out, out, 0.5)).toEqual(expected);
  });
});
