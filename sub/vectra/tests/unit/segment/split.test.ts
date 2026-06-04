import { describe, expect, expectTypeOf, test } from 'vitest';
import { split } from '../../../src/segment/split';
import { splitInto } from '../../../src/segment/split-into';
import type { SegmentSplitWritable, SegmentWritable, XYTupleWritable } from '../../../src/types';
import { expectXY } from './lifecycle-measurement-test-helpers';

const splitOut = (): SegmentSplitWritable => ({
  left: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
  right: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
});

describe('segment split - splitInto', () => {
  test('t=0.25에서 left a->p, right p->b로 분할하고 out을 반환한다', () => {
    const out = splitOut();

    const result = splitInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 8 } }, 0.25);

    expect(result).toBe(out);
    expectXY(out.left.a, { x: 0, y: 0 });
    expectXY(out.left.b, { x: 1, y: 2 });
    expectXY(out.right.a, { x: 1, y: 2 });
    expectXY(out.right.b, { x: 4, y: 8 });
  });

  test('tuple segment input을 읽어 분할한다', () => {
    const out = splitOut();

    splitInto(
      out,
      [
        [0, 0],
        [10, 0],
      ],
      0.3
    );

    expectXY(out.left.a, { x: 0, y: 0 });
    expectXY(out.left.b, { x: 3, y: 0 });
    expectXY(out.right.a, { x: 3, y: 0 });
    expectXY(out.right.b, { x: 10, y: 0 });
  });

  test('mutable tuple endpoint output type을 보존한다', () => {
    const out = {
      left: { a: [0, 0] as XYTupleWritable, b: [0, 0] as XYTupleWritable },
      right: { a: [0, 0] as XYTupleWritable, b: [0, 0] as XYTupleWritable },
    };

    const result = splitInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } }, 0.5);

    expect(result).toBe(out);
    expect(out.left.a).toEqual([0, 0]);
    expect(out.left.b).toEqual([2, 0]);
    expect(out.right.a).toEqual([2, 0]);
    expect(out.right.b).toEqual([4, 0]);
    expectTypeOf(result.left.a).toEqualTypeOf<XYTupleWritable>();
  });

  test('t=0 경계에서 left를 zero-length로, right를 원본으로 만든다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }, 0);

    expectXY(out.left.a, { x: 1, y: 2 });
    expectXY(out.left.b, { x: 1, y: 2 });
    expectXY(out.right.a, { x: 1, y: 2 });
    expectXY(out.right.b, { x: 5, y: 6 });
  });

  test('t=1 경계에서 left를 원본으로, right를 zero-length로 만든다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }, 1);

    expectXY(out.left.a, { x: 1, y: 2 });
    expectXY(out.left.b, { x: 5, y: 6 });
    expectXY(out.right.a, { x: 5, y: 6 });
    expectXY(out.right.b, { x: 5, y: 6 });
  });

  test('t<0이면 0으로 clamp해 left를 zero-length로, right를 원본으로 만든다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }, -0.5);

    expectXY(out.left.a, { x: 1, y: 2 });
    expectXY(out.left.b, { x: 1, y: 2 });
    expectXY(out.right.a, { x: 1, y: 2 });
    expectXY(out.right.b, { x: 5, y: 6 });
  });

  test('t>1이면 1로 clamp해 left를 원본으로, right를 zero-length로 만든다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }, 1.5);

    expectXY(out.left.a, { x: 1, y: 2 });
    expectXY(out.left.b, { x: 5, y: 6 });
    expectXY(out.right.a, { x: 5, y: 6 });
    expectXY(out.right.b, { x: 5, y: 6 });
  });

  test('zero-length segment를 두 zero-length segment로 분할한다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 3, y: 7 }, b: { x: 3, y: 7 } }, 0.5);

    expectXY(out.left.a, { x: 3, y: 7 });
    expectXY(out.left.b, { x: 3, y: 7 });
    expectXY(out.right.a, { x: 3, y: 7 });
    expectXY(out.right.b, { x: 3, y: 7 });
  });

  test('endpoint a 좌표가 NaN이면 arithmetic 결과를 그대로 기록한다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 8 } }, 0.5);

    expectXY(out.left.a, { x: Number.NaN, y: 0 });
    expectXY(out.left.b, { x: Number.NaN, y: 4 });
    expectXY(out.right.a, { x: Number.NaN, y: 4 });
    expectXY(out.right.b, { x: 4, y: 8 });
  });

  test('endpoint b 좌표가 ±Infinity면 arithmetic 결과를 그대로 기록한다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY } }, 0.5);

    expectXY(out.left.a, { x: 0, y: 0 });
    expectXY(out.left.b, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expectXY(out.right.a, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expectXY(out.right.b, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
  });

  test('t<=0 boundary는 non-finite b와 산술하지 않고 a와 원본 segment를 보존한다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: 1, y: 2 }, b: { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY } }, -0.5);

    expectXY(out.left.a, { x: 1, y: 2 });
    expectXY(out.left.b, { x: 1, y: 2 });
    expectXY(out.right.a, { x: 1, y: 2 });
    expectXY(out.right.b, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
  });

  test('t>=1 boundary는 non-finite a와 산술하지 않고 원본 segment와 b를 보존한다', () => {
    const out = splitOut();

    splitInto(out, { a: { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY }, b: { x: 3, y: 4 } }, 1.5);

    expectXY(out.left.a, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expectXY(out.left.b, { x: 3, y: 4 });
    expectXY(out.right.a, { x: 3, y: 4 });
    expectXY(out.right.b, { x: 3, y: 4 });
  });

  test('nested endpoint alias(out.left.a === line.a, out.left.b === out.right.a)도 안전하다', () => {
    const sharedA = { x: 0, y: 0 };
    const sharedSplitPoint = { x: 0, y: 0 };
    const line: SegmentWritable = { a: sharedA, b: { x: 4, y: 8 } };
    const out: SegmentSplitWritable = {
      left: { a: sharedA, b: sharedSplitPoint },
      right: { a: sharedSplitPoint, b: { x: 0, y: 0 } },
    };

    splitInto(out, line, 0.25);

    expectXY(out.left.a, { x: 0, y: 0 });
    expectXY(out.left.b, { x: 1, y: 2 });
    expectXY(out.right.a, { x: 1, y: 2 });
    expectXY(out.right.b, { x: 4, y: 8 });
  });

  test('out.left === line alias 호출도 source endpoint를 보존한다', () => {
    const seg: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 4, y: 8 } };
    const out: SegmentSplitWritable = { left: seg, right: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } } };

    splitInto(out, seg, 0.25);

    expectXY(out.left.a, { x: 0, y: 0 });
    expectXY(out.left.b, { x: 1, y: 2 });
    expectXY(out.right.a, { x: 1, y: 2 });
    expectXY(out.right.b, { x: 4, y: 8 });
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('t=%s이면 RangeError로 실패한다', (t) => {
    expect(() => splitInto(splitOut(), { a: { x: 0, y: 0 }, b: { x: 4, y: 8 } }, t)).toThrow(RangeError);
  });
});

describe('segment split - split', () => {
  test('새 plain object를 반환한다', () => {
    const result = split({ a: { x: 0, y: 0 }, b: { x: 4, y: 8 } }, 0.25);

    expect(result).toEqual({
      left: { a: { x: 0, y: 0 }, b: { x: 1, y: 2 } },
      right: { a: { x: 1, y: 2 }, b: { x: 4, y: 8 } },
    });
  });

  test('splitInto와 같은 좌표 결과를 반환한다', () => {
    const out = splitOut();
    splitInto(out, { a: { x: 1, y: 2 }, b: { x: 7, y: 10 } }, 0.4);

    const result = split({ a: { x: 1, y: 2 }, b: { x: 7, y: 10 } }, 0.4);

    expect(result).toEqual(out);
  });

  test('t가 non-finite이면 RangeError로 실패한다', () => {
    expect(() => split({ a: { x: 0, y: 0 }, b: { x: 4, y: 8 } }, Number.NaN)).toThrow(RangeError);
  });
});
