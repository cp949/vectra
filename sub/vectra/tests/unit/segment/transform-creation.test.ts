import { describe, expect, test } from 'vitest';
import { fromAngleInto } from '../../../src/segment/from-angle-into';
import { rotateAroundInto } from '../../../src/segment/rotate-around-into';
import { translateInto } from '../../../src/segment/translate-into';
import type { SegmentWritable } from '../../../src/types';
import { expectCloseXY, expectSegment, expectXY, segmentOut } from './lifecycle-measurement-test-helpers';

describe('segment 변환 - translateInto/rotateAroundInto', () => {
  test.each([
    {
      name: 'object endpoint와 object offset으로 평행이동한다',
      seg: { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } },
      offset: { x: 10, y: 20 },
      expectedA: { x: 11, y: 22 },
      expectedB: { x: 13, y: 24 },
      checkReturn: true,
    },
    {
      name: 'tuple endpoint와 object offset으로 평행이동한다',
      seg: { a: [0, 0] as const, b: [5, 5] as const },
      offset: { x: -1, y: -2 },
      expectedA: { x: -1, y: -2 },
      expectedB: { x: 4, y: 3 },
      checkReturn: false,
    },
  ])('$name', ({ seg, offset, expectedA, expectedB, checkReturn }) => {
    const out = segmentOut();

    const result = translateInto(out, seg, offset);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectSegment(out, expectedA, expectedB);
  });

  test('translateInto은 out === line 형태의 self-aliasing도 안전하다', () => {
    const seg: SegmentWritable = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } };

    const result = translateInto(seg, seg, { x: 5, y: 5 });

    expect(result).toBe(seg);
    expectSegment(seg, { x: 6, y: 7 }, { x: 8, y: 9 });
  });

  test('원점 기준 CCW 90도 회전 시 (1,0)→(0,1)로 이동한다', () => {
    const out = segmentOut();

    const result = rotateAroundInto(out, { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } }, { x: 0, y: 0 }, Math.PI / 2);

    expect(result).toBe(out);
    expectCloseXY(out.a, { x: 0, y: 0 });
    expectCloseXY(out.b, { x: 0, y: 1 });
  });

  test('rotateAroundInto은 out === line 형태의 self-aliasing도 안전하다', () => {
    const seg: SegmentWritable = { a: { x: 1, y: 0 }, b: { x: 2, y: 0 } };

    const result = rotateAroundInto(seg, seg, { x: 0, y: 0 }, Math.PI / 2);

    expect(result).toBe(seg);
    expectCloseXY(seg.a, { x: 0, y: 1 });
    expectCloseXY(seg.b, { x: 0, y: 2 });
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
    const out = segmentOut();

    const result = fromAngleInto(out, origin, angle, length);

    if (checkReturn) {
      expect(result).toBe(out);
    }
    expectXY(out.a, expectedA);
    expectCloseXY(out.b, expectedB);
  });

  test('out을 반환한다', () => {
    const out = segmentOut();

    const result = fromAngleInto(out, { x: 0, y: 0 }, 0, 1);

    expect(result).toBe(out);
  });
});
