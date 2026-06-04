import { describe, expect, test } from 'vitest';
import { angle } from '../../../src/segment/angle';
import { bounds } from '../../../src/segment/bounds';
import { boundsInto } from '../../../src/segment/bounds-into';
import { isZeroLength } from '../../../src/segment/is-zero-length';
import { length } from '../../../src/segment/length';
import { lengthSq } from '../../../src/segment/length-sq';
import { normalInto } from '../../../src/segment/normal-into';
import type { BoundsWritable, XYWritable } from '../../../src/types';
import { boundsOut, expectCloseXY, expectXY, xyOut } from './lifecycle-measurement-test-helpers';

describe('segment 측정 - length/lengthSq', () => {
  test.each([
    {
      name: '3-4-5 segment의 length를 반환한다',
      fn: length,
      seg: { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } },
      expected: 5,
    },
    {
      name: '음수 좌표를 포함한 segment의 length를 반환한다',
      fn: length,
      seg: { a: { x: 1, y: 1 }, b: { x: -2, y: 5 } },
      expected: 5,
    },
    {
      name: 'zero-length segment의 length는 0이다',
      fn: length,
      seg: { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } },
      expected: 0,
    },
    {
      name: 'tuple endpoint를 가진 segment의 length를 반환한다',
      fn: length,
      seg: { a: [0, 0] as const, b: [3, 4] as const },
      expected: 5,
    },
    {
      name: 'tuple segment shorthand의 length를 반환한다',
      fn: length,
      seg: [
        [0, 0],
        [3, 4],
      ] as const,
      expected: 5,
    },
    {
      name: '3-4-5 segment의 lengthSq는 25이다',
      fn: lengthSq,
      seg: { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } },
      expected: 25,
    },
    {
      name: 'zero-length segment의 lengthSq는 0이다',
      fn: lengthSq,
      seg: { a: { x: 5, y: 5 }, b: { x: 5, y: 5 } },
      expected: 0,
    },
    {
      name: 'tuple endpoint를 가진 segment의 lengthSq를 반환한다',
      fn: lengthSq,
      seg: { a: [0, 0] as const, b: [3, 4] as const },
      expected: 25,
    },
    {
      name: 'tuple segment shorthand의 lengthSq를 반환한다',
      fn: lengthSq,
      seg: [
        [0, 0],
        [3, 4],
      ] as const,
      expected: 25,
    },
    {
      name: 'object와 tuple endpoint 혼합 segment의 lengthSq를 반환한다',
      fn: lengthSq,
      seg: { a: { x: 1, y: 0 }, b: [4, 4] as const },
      expected: 25,
    },
  ])('$name', ({ fn, seg, expected }) => {
    expect(fn(seg)).toBe(expected);
  });
});

describe('segment 측정 - isZeroLength/angle', () => {
  test.each([
    {
      name: 'zero-length segment는 기본 epsilon으로 true를 반환한다',
      seg: { a: { x: 1, y: 2 }, b: { x: 1, y: 2 } },
      epsilon: undefined,
      expected: true,
    },
    {
      name: '명확히 non-zero segment는 기본 epsilon으로 false를 반환한다',
      seg: { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } },
      epsilon: undefined,
      expected: false,
    },
    {
      name: '매우 짧은 segment가 명시 epsilon 안에 있으면 true를 반환한다',
      seg: { a: { x: 0, y: 0 }, b: { x: 0.0001, y: 0 } },
      epsilon: 1e-4,
      expected: true,
    },
    {
      name: '매우 짧은 segment가 명시 epsilon 밖에 있으면 false를 반환한다',
      seg: { a: { x: 0, y: 0 }, b: { x: 0.001, y: 0 } },
      epsilon: 1e-4,
      expected: false,
    },
    {
      name: 'tuple endpoint를 가진 zero-length segment를 판정한다',
      seg: { a: [2, 3] as const, b: [2, 3] as const },
      epsilon: undefined,
      expected: true,
    },
  ])('$name', ({ seg, epsilon, expected }) => {
    expect(isZeroLength(seg, epsilon)).toBe(expected);
  });

  test.each([
    {
      name: '수평 방향 (1, 0) segment의 angle은 0이다',
      seg: { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } },
      expected: 0,
      close: false,
    },
    {
      name: '수직 방향 (0, 1) segment의 angle은 π/2이다',
      seg: { a: { x: 0, y: 0 }, b: { x: 0, y: 1 } },
      expected: Math.PI / 2,
      close: true,
    },
    {
      name: '대각선 (1, 1) segment의 angle은 π/4이다',
      seg: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } },
      expected: Math.PI / 4,
      close: true,
    },
    {
      name: '음수 방향 (-1, 0) segment의 angle은 π이다',
      seg: { a: { x: 0, y: 0 }, b: { x: -1, y: 0 } },
      expected: Math.PI,
      close: true,
    },
    {
      name: 'zero-length segment의 angle은 0이다',
      seg: { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } },
      expected: 0,
      close: false,
    },
    {
      name: 'tuple endpoint를 가진 segment의 angle을 계산한다',
      seg: { a: [0, 0] as const, b: [1, 0] as const },
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
      seg: { a: { x: 1, y: 2 }, b: { x: 4, y: 6 } },
      min: { x: 1, y: 2 },
      max: { x: 4, y: 6 },
      checkReturn: true,
    },
    {
      name: '역방향 segment에서 min/max가 올바르게 교환된다',
      seg: { a: { x: 5, y: 8 }, b: { x: 1, y: 3 } },
      min: { x: 1, y: 3 },
      max: { x: 5, y: 8 },
      checkReturn: false,
    },
    {
      name: 'zero-length segment의 bounds는 min === max === a이다',
      seg: { a: { x: 3, y: 7 }, b: { x: 3, y: 7 } },
      min: { x: 3, y: 7 },
      max: { x: 3, y: 7 },
      checkReturn: false,
    },
  ])('$name', ({ seg, min, max, checkReturn }) => {
    const out = boundsOut();

    const result = boundsInto(out, seg);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectXY(out.min, min);
    expectXY(out.max, max);
  });

  test('mutable tuple out에 bounds를 기록하고 out을 반환한다', () => {
    const min: [number, number] = [0, 0];
    const max: [number, number] = [0, 0];
    const out: BoundsWritable<[number, number], [number, number]> = { min, max };

    const result = boundsInto(out, { a: { x: 2, y: 3 }, b: { x: 5, y: 1 } });

    expect(result).toBe(out);
    expect(min).toEqual([2, 1]);
    expect(max).toEqual([5, 3]);
  });
});

describe('segment 측정 - bounds (companion)', () => {
  test('boundsInto와 같은 extent를 새 object로 반환한다', () => {
    const result = bounds({ a: { x: 5, y: 8 }, b: { x: 1, y: 3 } });

    expectXY(result.min, { x: 1, y: 3 });
    expectXY(result.max, { x: 5, y: 8 });
  });

  test('zero-length segment는 점으로 수렴한 bounds를 반환한다', () => {
    const result = bounds({ a: { x: 3, y: 7 }, b: { x: 3, y: 7 } });

    expectXY(result.min, { x: 3, y: 7 });
    expectXY(result.max, { x: 3, y: 7 });
  });

  test('호출마다 새 object를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 2, y: 4 } };

    const first = bounds(seg);
    const second = bounds(seg);

    expect(first).not.toBe(second);
    expect(first.min).not.toBe(second.min);
  });
});
