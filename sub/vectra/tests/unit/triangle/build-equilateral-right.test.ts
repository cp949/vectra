/** 삼각형 생성의 좌표 계산, 경계값과 결과 기록을 검증한다. */

import { describe, expect, test } from 'vitest';
import { buildEquilateral } from '../../../src/triangle/build-equilateral';
import { buildEquilateralInto } from '../../../src/triangle/build-equilateral-into';
import { buildRight } from '../../../src/triangle/build-right';
import { buildRightInto } from '../../../src/triangle/build-right-into';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { expectTriangle, expectXY, SQRT3, type TrianglePoints } from './builders.helpers';

describe('buildEquilateralInto', () => {
  test.each([
    ['기본 angle 0', { x: 0, y: 0 }, 2, undefined, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 1, y3: SQRT3 }],
    ['origin shift', { x: 10, y: 20 }, 2, undefined, { x1: 10, y1: 20, x2: 12, y2: 20, x3: 11, y3: 20 + SQRT3 }],
    [
      'angle = PI/2',
      { x: 0, y: 0 },
      2,
      Math.PI / 2,
      { x1: 0, y1: 0, x2: 0, y2: 2, x3: 2 * Math.cos((5 * Math.PI) / 6), y3: 2 * Math.sin((5 * Math.PI) / 6) },
    ],
    ['sideLength = 0', { x: 5, y: 7 }, 0, undefined, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 }],
    ['음수 sideLength', { x: 0, y: 0 }, -1, undefined, { x1: 0, y1: 0, x2: -1, y2: 0, x3: -0.5, y3: -SQRT3 / 2 }],
  ])('%s', (_, origin, sideLength, angle, expected) => {
    const out = createTriangle();
    expect(buildEquilateralInto(out, origin, sideLength, angle)).toBe(out);
    expectTriangle(out, expected);
  });

  test.each([
    [
      'NaN sideLength',
      Number.NaN,
      (out: TrianglePoints) => expect(Number.isNaN(out.x2) && Number.isNaN(out.x3)).toBe(true),
    ],
    [
      'Infinity sideLength',
      Number.POSITIVE_INFINITY,
      (out: TrianglePoints) => {
        expect(out.x2).toBe(Number.POSITIVE_INFINITY);
        expect(out.y3).toBe(Number.POSITIVE_INFINITY);
        expect(Number.isNaN(out.y2)).toBe(true);
      },
    ],
    [
      '-Infinity sideLength',
      Number.NEGATIVE_INFINITY,
      (out: TrianglePoints) => {
        expect(out.x2).toBe(Number.NEGATIVE_INFINITY);
        expect(out.y3).toBe(Number.NEGATIVE_INFINITY);
        expect(Number.isNaN(out.y2)).toBe(true);
      },
    ],
  ])('non-finite pass-through: %s', (_, sideLength, assert) => {
    const out = createTriangle();
    buildEquilateralInto(out, { x: 0, y: 0 }, sideLength);
    assert(out);
  });

  test('non-finite angle은 trig 결과를 그대로 기록한다', () => {
    const out = createTriangle();
    buildEquilateralInto(out, { x: 0, y: 0 }, 1, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.x2)).toBe(true);
    expect(Number.isNaN(out.y3)).toBe(true);
  });
});

describe('buildEquilateral', () => {
  test('새 TriangleWritable을 반환하고 각도 옵션을 적용한다', () => {
    expectTriangle(buildEquilateral({ x: 0, y: 0 }, 2), { x1: 0, y1: 0, x2: 2, y2: 0, x3: 1, y3: SQRT3 });
    const rotated = buildEquilateral({ x: 0, y: 0 }, 2, Math.PI / 2);
    expectXY({ x: rotated.x2, y: rotated.y2 }, 0, 2);
  });
});

describe('buildRightInto', () => {
  test.each([
    ['기본 angle 0', { x: 0, y: 0 }, 3, 4, undefined, { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 }],
    ['origin shift', { x: 10, y: 20 }, 3, 4, undefined, { x1: 10, y1: 20, x2: 13, y2: 20, x3: 10, y3: 24 }],
    ['angle = PI/2', { x: 0, y: 0 }, 3, 4, Math.PI / 2, { x1: 0, y1: 0, x2: 0, y2: 3, x3: -4, y3: 0 }],
    ['width=0', { x: 0, y: 0 }, 0, 4, undefined, { x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 4 }],
    ['height=0', { x: 0, y: 0 }, 3, 0, undefined, { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 0 }],
    ['width=0, height=0', { x: 5, y: 7 }, 0, 0, undefined, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 }],
    ['음수 width/height', { x: 0, y: 0 }, -1, -1, undefined, { x1: 0, y1: 0, x2: -1, y2: 0, x3: 0, y3: -1 }],
  ])('%s', (_, origin, width, height, angle, expected) => {
    const out = createTriangle();
    expect(buildRightInto(out, origin, width, height, angle)).toBe(out);
    expectTriangle(out, expected);
  });

  test('non-finite 입력은 JS 산술 결과를 따른다', () => {
    const out = createTriangle();
    buildRightInto(out, { x: 0, y: 0 }, Number.NaN, 4);
    expect(Number.isNaN(out.x2)).toBe(true);

    buildRightInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
    expect(out.x2).toBe(Number.POSITIVE_INFINITY);
    expect(out.y3).toBe(Number.NEGATIVE_INFINITY);
    expect(Number.isNaN(out.y2)).toBe(true);
    expect(Number.isNaN(out.x3)).toBe(true);

    buildRightInto(out, { x: 0, y: 0 }, 1, 1, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.x2)).toBe(true);
    expect(Number.isNaN(out.y3)).toBe(true);
  });
});

describe('buildRight', () => {
  test('새 TriangleWritable을 반환한다', () => {
    expect(buildRight({ x: 0, y: 0 }, 3, 4)).toEqual({ x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 });
  });
});
