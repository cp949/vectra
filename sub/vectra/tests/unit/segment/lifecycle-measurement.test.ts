/** 선분의 복사와 반전 및 시작점, 중점, 방향 벡터, 매개변수 위치 조회를 검증한다. */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { copyInto } from '../../../src/segment/copy-into';
import { midpointInto } from '../../../src/segment/midpoint-into';
import { pointAtTInto } from '../../../src/segment/point-at-t-into';
import { reverseInto } from '../../../src/segment/reverse-into';
import { startInto } from '../../../src/segment/start-into';
import { vectorInto } from '../../../src/segment/vector-into';
import { expectXY, xyOut } from './lifecycle-measurement-test-helpers';

describe('copyInto', () => {
  test('원본을 유지하면서 출력 선분에 두 끝점의 좌표를 복사한다', () => {
    const line = { x1: 1, y1: 2, x2: 3, y2: 4 };
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };

    expect(copyInto(out, line)).toBe(out);
    expect(out).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 });
    expect(line).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 });
  });
});

describe('reverseInto', () => {
  test('출력 선분에 끝점 순서를 바꿔 기록한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const line = { x1: 1, y1: 2, x2: 3, y2: 4 };
    expect(reverseInto(out, line)).toBe(out);
    expect(out).toEqual({ x1: 3, y1: 4, x2: 1, y2: 2 });
    expect(line).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 });
  });

  test('입력 선분을 출력으로 사용해도 두 끝점을 바꾼다', () => {
    const line = { x1: 1, y1: 2, x2: 3, y2: 4 };
    expect(reverseInto(line, line)).toBe(line);
    expect(line).toEqual({ x1: 3, y1: 4, x2: 1, y2: 2 });
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

describe('segment endpoint 조회 - vectorInto', () => {
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
  ])('$name', ({ fn, seg, expected }) => {
    const out: [number, number] = [0, 0];

    const result = fn(out, seg);

    expect(result).toBe(out);
    expect(out).toEqual(expected);
  });
});

describe('midpointInto', () => {
  test('두 끝점의 평균을 출력 점에 기록한다', () => {
    const out = { x: 0, y: 0 };

    expect(midpointInto(out, { x1: 0, y1: 0, x2: 4, y2: 6 })).toBe(out);
    expect(out).toEqual({ x: 2, y: 3 });
  });
});

describe('segment endpoint 조회 - pointAtTInto', () => {
  test.each([
    {
      name: 't=0이면 시작점을 기록한다',
      seg: { x1: 1, y1: 2, x2: 5, y2: 6 },
      t: 0,
      expected: { x: 1, y: 2 },
      checkReturn: true,
    },
    {
      name: 't=1이면 끝점을 기록한다',
      seg: { x1: 1, y1: 2, x2: 5, y2: 6 },
      t: 1,
      expected: { x: 5, y: 6 },
      checkReturn: false,
    },
    {
      name: 't=0.5이면 중점을 기록한다',
      seg: { x1: 0, y1: 0, x2: 4, y2: 6 },
      t: 0.5,
      expected: { x: 2, y: 3 },
      checkReturn: false,
    },
    {
      name: 't=1.5이면 segment 연장선 위 점을 기록한다 (clamp 없음)',
      seg: { x1: 0, y1: 0, x2: 2, y2: 4 },
      t: 1.5,
      expected: { x: 3, y: 6 },
      checkReturn: false,
    },
    {
      name: 't<0이면 반대 방향 연장선 위 점을 기록한다 (clamp 없음)',
      seg: { x1: 0, y1: 0, x2: 2, y2: 4 },
      t: -0.5,
      expected: { x: -1, y: -2 },
      checkReturn: false,
    },
  ])('$name', ({ seg, t, expected, checkReturn }) => {
    const out = { x: 0, y: 0 };

    const result = pointAtTInto(out, seg, t);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expect(out).toEqual(expected);
  });
});
