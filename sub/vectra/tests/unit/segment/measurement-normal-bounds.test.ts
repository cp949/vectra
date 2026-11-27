/** 선분의 길이, 각도, 법선과 끝점을 감싸는 경계 상자를 검증한다. */
import { describe, expect, test } from 'vitest';
import { angle } from '../../../src/segment/angle';
import { bounds } from '../../../src/segment/bounds';
import { boundsInto } from '../../../src/segment/bounds-into';
import { isZeroLength } from '../../../src/segment/is-zero-length';
import { length } from '../../../src/segment/length';
import { lengthSq } from '../../../src/segment/length-sq';
import { normalInto } from '../../../src/segment/normal-into';
import type { XYWritable } from '../../../src/types';
import { expectCloseXY, expectXY, xyOut } from './lifecycle-measurement-test-helpers';

describe('segment 측정 - length/lengthSq', () => {
  test.each([
    {
      name: '3-4-5 segment의 length를 반환한다',
      fn: length,
      seg: { x1: 0, y1: 0, x2: 3, y2: 4 },
      expected: 5,
    },
    {
      name: '음수 좌표를 포함한 segment의 length를 반환한다',
      fn: length,
      seg: { x1: 1, y1: 1, x2: -2, y2: 5 },
      expected: 5,
    },
    {
      name: 'zero-length segment의 length는 0이다',
      fn: length,
      seg: { x1: 3, y1: 4, x2: 3, y2: 4 },
      expected: 0,
    },
    {
      name: '3-4-5 segment의 lengthSq는 25이다',
      fn: lengthSq,
      seg: { x1: 0, y1: 0, x2: 3, y2: 4 },
      expected: 25,
    },
    {
      name: 'zero-length segment의 lengthSq는 0이다',
      fn: lengthSq,
      seg: { x1: 5, y1: 5, x2: 5, y2: 5 },
      expected: 0,
    },
  ])('$name', ({ fn, seg, expected }) => {
    expect(fn(seg)).toBe(expected);
  });
});

describe('segment 측정 - isZeroLength/angle', () => {
  test.each([
    {
      name: 'zero-length segment는 기본 epsilon으로 true를 반환한다',
      seg: { x1: 1, y1: 2, x2: 1, y2: 2 },
      epsilon: undefined,
      expected: true,
    },
    {
      name: '명확히 non-zero segment는 기본 epsilon으로 false를 반환한다',
      seg: { x1: 0, y1: 0, x2: 1, y2: 0 },
      epsilon: undefined,
      expected: false,
    },
    {
      name: '매우 짧은 segment가 명시 epsilon 안에 있으면 true를 반환한다',
      seg: { x1: 0, y1: 0, x2: 0.0001, y2: 0 },
      epsilon: 1e-4,
      expected: true,
    },
    {
      name: '매우 짧은 segment가 명시 epsilon 밖에 있으면 false를 반환한다',
      seg: { x1: 0, y1: 0, x2: 0.001, y2: 0 },
      epsilon: 1e-4,
      expected: false,
    },
  ])('$name', ({ seg, epsilon, expected }) => {
    expect(isZeroLength(seg, epsilon)).toBe(expected);
  });

  test.each([
    {
      name: '수평 방향 (1, 0) segment의 angle은 0이다',
      seg: { x1: 0, y1: 0, x2: 1, y2: 0 },
      expected: 0,
      close: false,
    },
    {
      name: '수직 방향 (0, 1) segment의 angle은 π/2이다',
      seg: { x1: 0, y1: 0, x2: 0, y2: 1 },
      expected: Math.PI / 2,
      close: true,
    },
    {
      name: '대각선 (1, 1) segment의 angle은 π/4이다',
      seg: { x1: 0, y1: 0, x2: 1, y2: 1 },
      expected: Math.PI / 4,
      close: true,
    },
    {
      name: '음수 방향 (-1, 0) segment의 angle은 π이다',
      seg: { x1: 0, y1: 0, x2: -1, y2: 0 },
      expected: Math.PI,
      close: true,
    },
    {
      name: 'zero-length segment의 angle은 0이다',
      seg: { x1: 3, y1: 4, x2: 3, y2: 4 },
      expected: 0,
      close: false,
    },
  ])('$name', ({ seg, expected, close }) => {
    if (close) {
      expect(angle(seg)).toBeCloseTo(expected, 10);
      return;
    }

    expect(angle(seg)).toBe(expected);
  });
});

describe('segment 법선 - normalInto', () => {
  test.each([
    {
      name: '수평 segment의 left normal은 (0, 1)이다',
      seg: { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } },
      side: undefined,
      expected: { x: 0, y: 1 },
      checkReturn: true,
    },
    {
      name: '수평 segment의 right normal은 (0, -1)이다',
      seg: { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } },
      side: 'right' as const,
      expected: { x: 0, y: -1 },
      checkReturn: false,
    },
    {
      name: '수직 segment의 left normal은 (-1, 0)이다',
      seg: { a: { x: 0, y: 0 }, b: { x: 0, y: 1 } },
      side: undefined,
      expected: { x: -1, y: 0 },
      checkReturn: false,
    },
  ])('$name', ({ seg, side, expected, checkReturn }) => {
    const out = xyOut();

    const result = normalInto(out, seg, side);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectCloseXY(out, expected);
  });

  test('zero-length segment의 normal은 (0, 0)이다', () => {
    const out: XYWritable = { x: 1, y: 1 };

    normalInto(out, { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } });

    expectXY(out, { x: 0, y: 0 });
  });

  test('mutable tuple out에 normal을 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];

    const result = normalInto(out, { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } });

    expect(result).toBe(out);
    expectCloseXY(out, { x: 0, y: 1 });
  });
});

describe('segment 측정 - boundsInto', () => {
  test.each([
    {
      name: '순방향 segment의 bounds를 계산한다',
      seg: { x1: 1, y1: 2, x2: 4, y2: 6 },
      expected: { minX: 1, minY: 2, maxX: 4, maxY: 6 },
    },
    {
      name: '역방향 segment에서 min/max가 올바르게 교환된다',
      seg: { x1: 5, y1: 8, x2: 1, y2: 3 },
      expected: { minX: 1, minY: 3, maxX: 5, maxY: 8 },
    },
    {
      name: 'zero-length segment의 bounds는 min === max === a이다',
      seg: { x1: 3, y1: 7, x2: 3, y2: 7 },
      expected: { minX: 3, minY: 7, maxX: 3, maxY: 7 },
    },
  ])('$name', ({ seg, expected }) => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const result = boundsInto(out, seg);

    expect(result).toBe(out);
    expect(out).toEqual(expected);
  });
});

describe('segment 측정 - bounds (companion)', () => {
  test('boundsInto와 같은 extent를 새 object로 반환한다', () => {
    const result = bounds({ x1: 5, y1: 8, x2: 1, y2: 3 });

    expect(result).toEqual({ minX: 1, minY: 3, maxX: 5, maxY: 8 });
  });

  test('zero-length segment는 점으로 수렴한 bounds를 반환한다', () => {
    const result = bounds({ x1: 3, y1: 7, x2: 3, y2: 7 });

    expect(result).toEqual({ minX: 3, minY: 7, maxX: 3, maxY: 7 });
  });

  test('호출마다 새 object를 반환한다', () => {
    const seg = { x1: 0, y1: 0, x2: 2, y2: 4 };

    const first = bounds(seg);
    const second = bounds(seg);

    expect(first).not.toBe(second);
  });
});
