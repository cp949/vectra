/** 삼각형 생성의 좌표 계산, 경계값과 결과 기록을 검증한다. */

import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromCenter } from '../../../src/triangle/from-center';
import { fromCenterInto } from '../../../src/triangle/from-center-into';
import { expectTriangle, SQRT3, type TrianglePoints } from './builders.helpers';

describe('fromCenterInto / fromCenter', () => {
  test.each([
    [
      'default rotation',
      { x: 0, y: 0 },
      SQRT3,
      undefined,
      { x1: 0, y1: -1, x2: SQRT3 / 2, y2: 0.5, x3: -SQRT3 / 2, y3: 0.5 },
    ],
    [
      'custom rotation 0',
      { x: 0, y: 0 },
      SQRT3,
      0,
      {
        x1: 1,
        y1: 0,
        x2: Math.cos((2 * Math.PI) / 3),
        y2: Math.sin((2 * Math.PI) / 3),
        x3: Math.cos((4 * Math.PI) / 3),
        y3: Math.sin((4 * Math.PI) / 3),
      },
    ],
    ['sideLength = 0', { x: 5, y: 7 }, 0, undefined, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 }],
    [
      '음수 sideLength',
      { x: 0, y: 0 },
      -SQRT3,
      undefined,
      { x1: 0, y1: 1, x2: -SQRT3 / 2, y2: -0.5, x3: SQRT3 / 2, y3: -0.5 },
    ],
  ])('%s', (_, center, sideLength, rotation, expected) => {
    const out = createTriangle();
    expect(fromCenterInto(out, center, sideLength, rotation)).toBe(out);
    expectTriangle(out, expected);
  });

  test('centroid와 sideLength 계약을 만족한다', () => {
    const out = createTriangle();
    fromCenterInto(out, { x: 3, y: 7 }, 5);
    expect((out.x1 + out.x2 + out.x3) / 3).toBeCloseTo(3, 12);
    expect((out.y1 + out.y2 + out.y3) / 3).toBeCloseTo(7, 12);

    fromCenterInto(out, { x: 0, y: 0 }, 6);
    expect(Math.hypot(out.x2 - out.x1, out.y2 - out.y1)).toBeCloseTo(6, 12);
    expect(Math.hypot(out.x3 - out.x2, out.y3 - out.y2)).toBeCloseTo(6, 12);
  });

  test.each([
    ['NaN sideLength', Number.NaN, (out: TrianglePoints) => expect(Number.isNaN(out.x1)).toBe(true)],
    [
      'Infinity sideLength',
      Number.POSITIVE_INFINITY,
      (out: TrianglePoints) => expect(out.y1).toBe(Number.NEGATIVE_INFINITY),
    ],
    [
      '-Infinity sideLength',
      Number.NEGATIVE_INFINITY,
      (out: TrianglePoints) => expect(out.y1).toBe(Number.POSITIVE_INFINITY),
    ],
  ])('%s는 JS 산술 결과를 따른다', (_, sideLength, assert) => {
    const out = createTriangle();
    fromCenterInto(out, { x: 0, y: 0 }, sideLength);
    assert(out);
  });

  test('유한하지 않은 회전값을 산술 결과에 반영한다', () => {
    const out = createTriangle();
    fromCenterInto(out, { x: 0, y: 0 }, 2, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.x1)).toBe(true);
    expect(Number.isNaN(out.y2)).toBe(true);
  });

  test('allocating companion은 Into 결과와 일치한다', () => {
    const expected = createTriangle();
    fromCenterInto(expected, { x: 3, y: 7 }, 5);
    expect(fromCenter({ x: 3, y: 7 }, 5)).toEqual(expected);
  });
});
