/** 선분의 이동 및 회전과 시작점·각도·길이에 따른 생성을 검증한다. */
import { describe, expect, test } from 'vitest';
import { fromAngleInto } from '../../../src/segment/from-angle-into';
import { rotateAroundInto } from '../../../src/segment/rotate-around-into';
import { translateInto } from '../../../src/segment/translate-into';
import { expectCloseXY } from './lifecycle-measurement-test-helpers';

describe('segment 변환 - translateInto/rotateAroundInto', () => {
  test('두 끝점에 이동량을 더한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };
    const line = { x1: 1, y1: 2, x2: 3, y2: 4 };
    expect(translateInto(out, line, { x: 10, y: 20 })).toBe(out);
    expect(out).toEqual({ x1: 11, y1: 22, x2: 13, y2: 24 });
  });

  test('translateInto는 out === line 형태의 self-aliasing도 안전하다', () => {
    const seg = { x1: 1, y1: 2, x2: 3, y2: 4 };

    const result = translateInto(seg, seg, { x: 5, y: 5 });

    expect(result).toBe(seg);
    expect(seg).toEqual({ x1: 6, y1: 7, x2: 8, y2: 9 });
  });

  test('원점 기준 CCW 90도 회전 시 (1,0)→(0,1)로 이동한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };

    const result = rotateAroundInto(out, { x1: 0, y1: 0, x2: 1, y2: 0 }, { x: 0, y: 0 }, Math.PI / 2);

    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(0);
    expect(out.y1).toBeCloseTo(0);
    expect(out.x2).toBeCloseTo(0);
    expect(out.y2).toBeCloseTo(1);
  });

  test('rotateAroundInto는 out === line 형태의 self-aliasing도 안전하다', () => {
    const seg = { x1: 1, y1: 0, x2: 2, y2: 0 };

    const result = rotateAroundInto(seg, seg, { x: 0, y: 0 }, Math.PI / 2);

    expect(result).toBe(seg);
    expect(seg.x1).toBeCloseTo(0);
    expect(seg.y1).toBeCloseTo(1);
    expect(seg.x2).toBeCloseTo(0);
    expect(seg.y2).toBeCloseTo(2);
  });
});

describe('segment 생성 - fromAngleInto', () => {
  test.each([
    {
      name: 'angle=0, length=5이면 b = (origin.x + 5, origin.y)이다',
      origin: { x: 1, y: 2 },
      angle: 0,
      length: 5,
      expectedA: { x: 1, y: 2 },
      expectedB: { x: 6, y: 2 },
      checkReturn: true,
    },
    {
      name: 'angle=π/2, length=3이면 b = (origin.x, origin.y + 3)이다',
      origin: { x: 0, y: 0 },
      angle: Math.PI / 2,
      length: 3,
      expectedA: { x: 0, y: 0 },
      expectedB: { x: 0, y: 3 },
      checkReturn: false,
    },
    {
      name: 'length=0이면 a와 b가 동일한 zero-length segment을 생성한다',
      origin: { x: 3, y: 4 },
      angle: Math.PI / 4,
      length: 0,
      expectedA: { x: 3, y: 4 },
      expectedB: { x: 3, y: 4 },
      checkReturn: false,
    },
  ])('$name', ({ origin, angle, length, expectedA, expectedB, checkReturn }) => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };

    const result = fromAngleInto(out, origin, angle, length);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expect({ x: out.x1, y: out.y1 }).toEqual(expectedA);
    expectCloseXY({ x: out.x2, y: out.y2 }, expectedB);
  });

  test('out을 반환한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };

    const result = fromAngleInto(out, { x: 0, y: 0 }, 0, 1);

    expect(result).toBe(out);
  });
});
