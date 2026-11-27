/** 선분의 복사와 반전 및 시작점, 중점, 방향 벡터, 매개변수 위치 조회를 검증한다. */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { copyInto } from '../../../src/segment/copy-into';
import { midpointInto } from '../../../src/segment/midpoint-into';
import { pointAtTInto } from '../../../src/segment/point-at-t-into';
import { reverseInto } from '../../../src/segment/reverse-into';
import { startInto } from '../../../src/segment/start-into';
import { vectorInto } from '../../../src/segment/vector-into';
import type { SegmentWritable } from '../../../src/types';
import { expectSegment, expectXY, segmentOut, xyOut } from './lifecycle-measurement-test-helpers';

describe('copyInto', () => {
  test('원본을 유지하면서 출력 선분에 두 끝점의 좌표를 복사한다', () => {
    const line = { x1: 1, y1: 2, x2: 3, y2: 4 };
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };

    expect(copyInto(out, line)).toBe(out);
    expect(out).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 });
    expect(line).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 });
  });
});

describe('segment lifecycle - reverseInto', () => {
  test.each([
    {
      name: 'endpoint 순서를 반전하여 기록하고 out을 반환한다',
      src: { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } },
      expectedA: { x: 3, y: 4 },
      expectedB: { x: 1, y: 2 },
      checkReturn: true,
    },
    {
      name: 'tuple endpoint를 가진 segment를 반전한다',
      src: { a: [5, 6] as const, b: [-3, -4] as const },
      expectedA: { x: -3, y: -4 },
      expectedB: { x: 5, y: 6 },
      checkReturn: false,
    },
  ])('$name', ({ src, expectedA, expectedB, checkReturn }) => {
    const out = segmentOut();

    const result = reverseInto(out, src);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectSegment(out, expectedA, expectedB);
  });

  test('out === segment 형태의 alias 호출도 안전하다', () => {
    const seg: SegmentWritable = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } };

    const result = reverseInto(seg, seg);

    expect(result).toBe(seg);
    expectSegment(seg, { x: 3, y: 4 }, { x: 1, y: 2 });
  });
});

describe('segment endpoint 조회 - startInto', () => {
  test.each([
    {
      name: 'startInto가 object endpoint에서 a를 읽어 out에 기록한다',
      fn: startInto,
      seg: { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } },
      expected: { x: 1, y: 2 },
      checkReturn: true,
    },
    {
      name: 'startInto가 tuple endpoint에서 a를 읽어 out에 기록한다',
      fn: startInto,
      seg: { a: [-5, -6] as const, b: [7, 8] as const },
      expected: { x: -5, y: -6 },
      checkReturn: false,
    },
  ])('$name', ({ fn, seg, expected, checkReturn }) => {
    const out = xyOut();

    const result = fn(out, seg);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectXY(out, expected);
  });

  test('startInto가 mutable tuple out에 a를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];

    const result = startInto(out, { a: { x: 3, y: 7 }, b: { x: 5, y: 9 } });

    expect(result).toBe(out);
    expect(out).toEqual([3, 7]);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('segment endpoint 조회 - vectorInto/midpointInto', () => {
  test.each([
    {
      name: 'vectorInto가 object endpoint로 b - a 벡터를 계산하여 out에 기록한다',
      fn: vectorInto,
      seg: { a: { x: 1, y: 2 }, b: { x: 4, y: 6 } },
      expected: { x: 3, y: 4 },
      checkReturn: true,
    },
    {
      name: 'vectorInto가 tuple endpoint로 b - a 벡터를 계산한다',
      fn: vectorInto,
      seg: { a: [10, 5] as const, b: [3, 1] as const },
      expected: { x: -7, y: -4 },
      checkReturn: false,
    },
    {
      name: 'vectorInto가 object와 tuple endpoint 혼합으로 b - a 벡터를 계산한다',
      fn: vectorInto,
      seg: { a: { x: 0, y: 0 }, b: [3, 4] as const },
      expected: { x: 3, y: 4 },
      checkReturn: false,
    },
    {
      name: 'midpointInto가 object endpoint로 중점을 계산하여 out에 기록한다',
      fn: midpointInto,
      seg: { a: { x: 0, y: 0 }, b: { x: 4, y: 6 } },
      expected: { x: 2, y: 3 },
      checkReturn: true,
    },
    {
      name: 'midpointInto가 tuple endpoint로 중점을 계산한다',
      fn: midpointInto,
      seg: { a: [1, 3] as const, b: [5, 7] as const },
      expected: { x: 3, y: 5 },
      checkReturn: false,
    },
    {
      name: 'midpointInto가 object와 tuple endpoint 혼합으로 중점을 계산한다',
      fn: midpointInto,
      seg: { a: { x: -2, y: -4 }, b: [2, 4] as const },
      expected: { x: 0, y: 0 },
      checkReturn: false,
    },
  ])('$name', ({ fn, seg, expected, checkReturn }) => {
    const out = xyOut();

    const result = fn(out, seg);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectXY(out, expected);
  });

  test.each([
    {
      name: 'vectorInto가 mutable tuple out에 b - a 벡터를 기록하고 tuple reference를 반환한다',
      fn: vectorInto,
      seg: { a: { x: 1, y: 2 }, b: { x: 4, y: 6 } },
      expected: [3, 4],
    },
    {
      name: 'midpointInto가 mutable tuple out에 중점을 기록하고 tuple reference를 반환한다',
      fn: midpointInto,
      seg: { a: { x: 0, y: 0 }, b: { x: 4, y: 6 } },
      expected: [2, 3],
    },
  ])('$name', ({ fn, seg, expected }) => {
    const out: [number, number] = [0, 0];

    const result = fn(out, seg);

    expect(result).toBe(out);
    expect(out).toEqual(expected);
  });
});

describe('segment endpoint 조회 - pointAtTInto', () => {
  test.each([
    {
      name: 't=0이면 segment.a를 기록한다',
      seg: { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } },
      t: 0,
      expected: { x: 1, y: 2 },
      checkReturn: true,
    },
    {
      name: 't=1이면 segment.b를 기록한다',
      seg: { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } },
      t: 1,
      expected: { x: 5, y: 6 },
      checkReturn: false,
    },
    {
      name: 't=0.5이면 중점을 기록한다',
      seg: { a: { x: 0, y: 0 }, b: { x: 4, y: 6 } },
      t: 0.5,
      expected: { x: 2, y: 3 },
      checkReturn: false,
    },
    {
      name: 't=1.5이면 segment 연장선 위 점을 기록한다 (clamp 없음)',
      seg: { a: { x: 0, y: 0 }, b: { x: 2, y: 4 } },
      t: 1.5,
      expected: { x: 3, y: 6 },
      checkReturn: false,
    },
    {
      name: 't<0이면 반대 방향 연장선 위 점을 기록한다 (clamp 없음)',
      seg: { a: { x: 0, y: 0 }, b: { x: 2, y: 4 } },
      t: -0.5,
      expected: { x: -1, y: -2 },
      checkReturn: false,
    },
    {
      name: 'tuple endpoint를 가진 segment에서도 동작한다',
      seg: { a: [0, 0] as const, b: [10, 0] as const },
      t: 0.3,
      expected: { x: 3, y: 0 },
      checkReturn: false,
    },
  ])('$name', ({ seg, t, expected, checkReturn }) => {
    const out = xyOut();

    const result = pointAtTInto(out, seg, t);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectXY(out, expected);
  });

  test('mutable tuple out에 parametric 위치를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];

    const result = pointAtTInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 0.5);

    expect(result).toBe(out);
    expect(out).toEqual([2, 0]);
  });
});
