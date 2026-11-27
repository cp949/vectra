/** 선분 분할의 경계, 비유한 좌표와 입력·출력 공유를 검증한다. */
import { describe, expect, test } from 'vitest';
import { split } from '../../../src/segment/split';
import { splitInto } from '../../../src/segment/split-into';
import type { SegmentSplitWritable } from '../../../src/types';

/** 분할 결과를 받을 선분 두 개를 만든다. */
const splitOut = (): SegmentSplitWritable => ({
  left: { x1: 0, y1: 0, x2: 0, y2: 0 },
  right: { x1: 0, y1: 0, x2: 0, y2: 0 },
});

describe('segment split - splitInto', () => {
  test('t=0.25에서 left a->p, right p->b로 분할하고 out을 반환한다', () => {
    const out = splitOut();

    const result = splitInto(out, { x1: 0, y1: 0, x2: 4, y2: 8 }, 0.25);

    expect(result).toBe(out);
    expect(out.left).toEqual({ x1: 0, y1: 0, x2: 1, y2: 2 });
    expect(out.right).toEqual({ x1: 1, y1: 2, x2: 4, y2: 8 });
  });

  test('t=0 경계에서 left를 zero-length로, right를 원본으로 만든다', () => {
    const out = splitOut();

    splitInto(out, { x1: 1, y1: 2, x2: 5, y2: 6 }, 0);

    expect(out.left).toEqual({ x1: 1, y1: 2, x2: 1, y2: 2 });
    expect(out.right).toEqual({ x1: 1, y1: 2, x2: 5, y2: 6 });
  });

  test('t=1 경계에서 left를 원본으로, right를 zero-length로 만든다', () => {
    const out = splitOut();

    splitInto(out, { x1: 1, y1: 2, x2: 5, y2: 6 }, 1);

    expect(out.left).toEqual({ x1: 1, y1: 2, x2: 5, y2: 6 });
    expect(out.right).toEqual({ x1: 5, y1: 6, x2: 5, y2: 6 });
  });

  test('t<0이면 0으로 clamp해 left를 zero-length로, right를 원본으로 만든다', () => {
    const out = splitOut();

    splitInto(out, { x1: 1, y1: 2, x2: 5, y2: 6 }, -0.5);

    expect(out.left).toEqual({ x1: 1, y1: 2, x2: 1, y2: 2 });
    expect(out.right).toEqual({ x1: 1, y1: 2, x2: 5, y2: 6 });
  });

  test('t>1이면 1로 clamp해 left를 원본으로, right를 zero-length로 만든다', () => {
    const out = splitOut();

    splitInto(out, { x1: 1, y1: 2, x2: 5, y2: 6 }, 1.5);

    expect(out.left).toEqual({ x1: 1, y1: 2, x2: 5, y2: 6 });
    expect(out.right).toEqual({ x1: 5, y1: 6, x2: 5, y2: 6 });
  });

  test('zero-length segment를 두 zero-length segment로 분할한다', () => {
    const out = splitOut();

    splitInto(out, { x1: 3, y1: 7, x2: 3, y2: 7 }, 0.5);

    expect(out.left).toEqual({ x1: 3, y1: 7, x2: 3, y2: 7 });
    expect(out.right).toEqual({ x1: 3, y1: 7, x2: 3, y2: 7 });
  });

  test('endpoint a 좌표가 NaN이면 arithmetic 결과를 그대로 기록한다', () => {
    const out = splitOut();

    splitInto(out, { x1: Number.NaN, y1: 0, x2: 4, y2: 8 }, 0.5);

    expect(out.left).toEqual({ x1: Number.NaN, y1: 0, x2: Number.NaN, y2: 4 });
    expect(out.right).toEqual({ x1: Number.NaN, y1: 4, x2: 4, y2: 8 });
  });

  test('endpoint b 좌표가 ±Infinity면 arithmetic 결과를 그대로 기록한다', () => {
    const out = splitOut();

    splitInto(out, { x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: Number.NEGATIVE_INFINITY }, 0.5);

    expect(out.left).toEqual({ x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: Number.NEGATIVE_INFINITY });
    expect(out.right).toEqual({
      x1: Number.POSITIVE_INFINITY,
      y1: Number.NEGATIVE_INFINITY,
      x2: Number.POSITIVE_INFINITY,
      y2: Number.NEGATIVE_INFINITY,
    });
  });

  test('t<=0 boundary는 non-finite b와 산술하지 않고 a와 원본 segment를 보존한다', () => {
    const out = splitOut();

    splitInto(out, { x1: 1, y1: 2, x2: Number.POSITIVE_INFINITY, y2: Number.NEGATIVE_INFINITY }, -0.5);

    expect(out.left).toEqual({ x1: 1, y1: 2, x2: 1, y2: 2 });
    expect(out.right).toEqual({ x1: 1, y1: 2, x2: Number.POSITIVE_INFINITY, y2: Number.NEGATIVE_INFINITY });
  });

  test('t>=1 boundary는 non-finite a와 산술하지 않고 원본 segment와 b를 보존한다', () => {
    const out = splitOut();

    splitInto(out, { x1: Number.POSITIVE_INFINITY, y1: Number.NEGATIVE_INFINITY, x2: 3, y2: 4 }, 1.5);

    expect(out.left).toEqual({ x1: Number.POSITIVE_INFINITY, y1: Number.NEGATIVE_INFINITY, x2: 3, y2: 4 });
    expect(out.right).toEqual({ x1: 3, y1: 4, x2: 3, y2: 4 });
  });

  test('out.left === line alias 호출도 source endpoint를 보존한다', () => {
    const seg = { x1: 0, y1: 0, x2: 4, y2: 8 };
    const out: SegmentSplitWritable = { left: seg, right: { x1: 0, y1: 0, x2: 0, y2: 0 } };

    splitInto(out, seg, 0.25);

    expect(out.left).toEqual({ x1: 0, y1: 0, x2: 1, y2: 2 });
    expect(out.right).toEqual({ x1: 1, y1: 2, x2: 4, y2: 8 });
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('t=%s이면 RangeError로 실패한다', (t) => {
    expect(() => splitInto(splitOut(), { x1: 0, y1: 0, x2: 4, y2: 8 }, t)).toThrow(RangeError);
  });
});

describe('segment split - split', () => {
  test('새 plain object를 반환한다', () => {
    const result = split({ x1: 0, y1: 0, x2: 4, y2: 8 }, 0.25);

    expect(result).toEqual({
      left: { x1: 0, y1: 0, x2: 1, y2: 2 },
      right: { x1: 1, y1: 2, x2: 4, y2: 8 },
    });
  });

  test('splitInto와 같은 좌표 결과를 반환한다', () => {
    const out = splitOut();
    splitInto(out, { x1: 1, y1: 2, x2: 7, y2: 10 }, 0.4);

    const result = split({ x1: 1, y1: 2, x2: 7, y2: 10 }, 0.4);

    expect(result).toEqual(out);
  });

  test('t가 non-finite이면 RangeError로 실패한다', () => {
    expect(() => split({ x1: 0, y1: 0, x2: 4, y2: 8 }, Number.NaN)).toThrow(RangeError);
  });
});
