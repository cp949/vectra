/** 삼각형 생성의 좌표 계산, 경계값과 결과 기록을 검증한다. */

import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { fromSegmentApex } from '../../../src/triangle/from-segment-apex';
import { fromSegmentApexInto } from '../../../src/triangle/from-segment-apex-into';
import { fromSegmentHeight } from '../../../src/triangle/from-segment-height';
import { fromSegmentHeightInto } from '../../../src/triangle/from-segment-height-into';
import { expectTriangle, expectXY, SENTINEL, setTriangle } from './builders.helpers';

describe('fromSegmentApexInto / fromSegmentApex', () => {
  test.each([
    [
      'object segment와 object apex',
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x: 2, y: 3 },
      { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 },
    ],
    ['zero-length base', { x1: 1, y1: 1, x2: 1, y2: 1 }, { x: 5, y: 5 }, { x1: 1, y1: 1, x2: 1, y2: 1, x3: 5, y3: 5 }],
  ])('%s', (_, base, apex, expected) => {
    const out = createTriangle();
    expect(fromSegmentApexInto(out, base, apex)).toBe(out);
    expect(out).toEqual(expected);
  });

  test('non-finite 좌표는 그대로 기록된다', () => {
    const out = createTriangle();
    fromSegmentApexInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, { x: Number.NaN, y: 0 });
    expect(Number.isNaN(out.x3)).toBe(true);

    fromSegmentApexInto(
      out,
      { x1: Number.POSITIVE_INFINITY, y1: 0, x2: 4, y2: Number.NEGATIVE_INFINITY },
      { x: 0, y: 0 }
    );
    expect(out.x1).toBe(Number.POSITIVE_INFINITY);
    expect(out.y2).toBe(Number.NEGATIVE_INFINITY);
  });

  test('allocating companion은 새 TriangleWritable을 반환한다', () => {
    expect(fromSegmentApex({ x1: 0, y1: 0, x2: 4, y2: 0 }, { x: 2, y: 3 })).toEqual({
      x1: 0,
      y1: 0,
      x2: 4,
      y2: 0,
      x3: 2,
      y3: 3,
    });
  });
});

describe('fromSegmentHeightInto / fromSegmentHeight', () => {
  test.each([
    ['기본 left side', { x1: 0, y1: 0, x2: 4, y2: 0 }, 3, undefined, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 }],
    [
      "side: 'right'",
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      3,
      { side: 'right' as const },
      { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: -3 },
    ],
    ['negative height', { x1: 0, y1: 0, x2: 4, y2: 0 }, -3, undefined, { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: -3 }],
    [
      '수직 base와 left side',
      { x1: 0, y1: 0, x2: 0, y2: 4 },
      3,
      undefined,
      { x1: 0, y1: 0, x2: 0, y2: 4, x3: -3, y3: 2 },
    ],
  ])('%s', (_, base, height, options, expected) => {
    const out = createTriangle();
    expect(fromSegmentHeightInto(out, base, height, options)).toBe(out);
    expectTriangle(out, expected);
  });

  test.each([
    ['zero-length base', { x1: 5, y1: 5, x2: 5, y2: 5 }],
    ['NaN base 좌표', { x1: Number.NaN, y1: 0, x2: 4, y2: 0 }],
    ['Infinity base 좌표', { x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: 0 }],
    ['-Infinity base 좌표', { x1: 0, y1: Number.NEGATIVE_INFINITY, x2: 4, y2: 0 }],
  ])('%s: false를 반환하고 out을 수정하지 않는다', (_, base) => {
    const out = createTriangle();
    setTriangle(out);
    expect(fromSegmentHeightInto(out, base, 3)).toBe(false);
    expect(out).toEqual(SENTINEL);
  });

  test('non-finite height는 성공 분기에서 그대로 기록된다', () => {
    const out = createTriangle();
    expect(fromSegmentHeightInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, Number.NaN)).toBe(out);
    expectXY({ x: out.x1, y: out.y1 }, 0, 0);
    expectXY({ x: out.x2, y: out.y2 }, 4, 0);
    expect(Number.isNaN(out.x3) && Number.isNaN(out.y3)).toBe(true);

    expect(fromSegmentHeightInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, Number.POSITIVE_INFINITY)).toBe(out);
    expect(Number.isNaN(out.x3)).toBe(true);
    expect(out.y3).toBe(Number.POSITIVE_INFINITY);
  });

  test('isosceles와 allocating companion 계약을 지킨다', () => {
    const out = createTriangle();
    fromSegmentHeightInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, 3);
    expect(Math.hypot(out.x3 - out.x1, out.y3 - out.y1)).toBeCloseTo(Math.hypot(out.x3 - out.x2, out.y3 - out.y2), 12);

    expect(fromSegmentHeight({ x1: 0, y1: 0, x2: 4, y2: 0 }, 3)).toEqual({ x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 });
    expect(fromSegmentHeight({ x1: 0, y1: 0, x2: 4, y2: 0 }, 3, { side: 'right' })).toEqual({
      x1: 0,
      y1: 0,
      x2: 4,
      y2: 0,
      x3: 2,
      y3: -3,
    });
  });

  test.each([
    ['zero-length base', { x1: 5, y1: 5, x2: 5, y2: 5 }],
    ['NaN base 좌표', { x1: Number.NaN, y1: 0, x2: 4, y2: 0 }],
    ['Infinity base 좌표', { x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: 0 }],
  ])('%s는 undefined를 반환한다', (_, base) => {
    expect(fromSegmentHeight(base, 3)).toBeUndefined();
  });
});
