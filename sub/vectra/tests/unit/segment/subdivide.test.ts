/**
 * segment subdivide collection helper unit test.
 *
 * `count` 기준 균등 N분할 collection helper의 clear/push/aliasing/edge-case 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { subdivide } from '../../../src/segment/subdivide';
import { subdivideInto } from '../../../src/segment/subdivide-into';
import type { SegmentLike, SegmentWritable } from '../../../src/types';

const toPlain = (segments: SegmentWritable[]) =>
  segments.map((s) => ({ a: { x: s.a.x, y: s.a.y }, b: { x: s.b.x, y: s.b.y } }));

describe('segment subdivide - subdivideInto', () => {
  test('기본 count 2로 segment를 두 등분하고 out을 반환한다', () => {
    const out: SegmentWritable[] = [];

    const result = subdivideInto(out, { a: { x: 0, y: 0 }, b: { x: 8, y: 0 } });

    expect(result).toBe(out);
    expect(toPlain(out)).toEqual([
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      { a: { x: 4, y: 0 }, b: { x: 8, y: 0 } },
    ]);
  });

  test('count 4로 [0,0] -> [8,0]을 4개 segment로 나눈다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { a: { x: 0, y: 0 }, b: { x: 8, y: 0 } }, { count: 4 });

    expect(toPlain(out)).toEqual([
      { a: { x: 0, y: 0 }, b: { x: 2, y: 0 } },
      { a: { x: 2, y: 0 }, b: { x: 4, y: 0 } },
      { a: { x: 4, y: 0 }, b: { x: 6, y: 0 } },
      { a: { x: 6, y: 0 }, b: { x: 8, y: 0 } },
    ]);
  });

  test('인접 sub-segment의 공유점은 같은 좌표값을 갖는다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { a: { x: 0, y: 0 }, b: { x: 9, y: 3 } }, { count: 3 });

    expect(out[0].b).toEqual(out[1].a);
    expect(out[1].b).toEqual(out[2].a);
  });

  test('tuple segment input을 읽어 분할한다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(
      out,
      [
        [0, 0],
        [10, 0],
      ],
      { count: 2 }
    );

    expect(toPlain(out)).toEqual([
      { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } },
      { a: { x: 5, y: 0 }, b: { x: 10, y: 0 } },
    ]);
  });

  test('count 1은 원본 segment 1개 복제와 같다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }, { count: 1 });

    expect(toPlain(out)).toEqual([{ a: { x: 1, y: 2 }, b: { x: 5, y: 6 } }]);
  });

  test('zero-length segment는 count개 zero-length segment를 만든다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { a: { x: 3, y: 7 }, b: { x: 3, y: 7 } }, { count: 3 });

    expect(toPlain(out)).toEqual([
      { a: { x: 3, y: 7 }, b: { x: 3, y: 7 } },
      { a: { x: 3, y: 7 }, b: { x: 3, y: 7 } },
      { a: { x: 3, y: 7 }, b: { x: 3, y: 7 } },
    ]);
  });

  test('호출 시작 시 기존 output array를 clear한다', () => {
    const out: SegmentWritable[] = [
      { a: { x: 99, y: 99 }, b: { x: 99, y: 99 } },
      { a: { x: 99, y: 99 }, b: { x: 99, y: 99 } },
      { a: { x: 99, y: 99 }, b: { x: 99, y: 99 } },
    ];

    subdivideInto(out, { a: { x: 0, y: 0 }, b: { x: 8, y: 0 } }, { count: 2 });

    expect(out).toHaveLength(2);
    expect(toPlain(out)).toEqual([
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      { a: { x: 4, y: 0 }, b: { x: 8, y: 0 } },
    ]);
  });

  test('output array가 source endpoint object를 alias해도 clear 전 snapshot 결과를 보존한다', () => {
    const sharedA = { x: 0, y: 0 };
    const sharedB = { x: 8, y: 0 };
    const segment: SegmentWritable = { a: sharedA, b: sharedB };
    const out: SegmentWritable[] = [{ a: sharedA, b: sharedB }];

    subdivideInto(out, segment, { count: 2 });

    expect(toPlain(out)).toEqual([
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      { a: { x: 4, y: 0 }, b: { x: 8, y: 0 } },
    ]);
  });

  test('endpoint a 좌표가 NaN이면 arithmetic 결과를 그대로 기록한다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 8 } }, { count: 2 });

    expect(out[0].a).toEqual({ x: Number.NaN, y: 0 });
    expect(out[0].b).toEqual({ x: Number.NaN, y: 4 });
    expect(out[1].a).toEqual({ x: Number.NaN, y: 4 });
    expect(out[1].b).toEqual({ x: 4, y: 8 });
  });

  test('endpoint b 좌표가 ±Infinity면 시작/끝점은 정확히 보존하고 내부는 arithmetic 결과를 기록한다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(
      out,
      { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY } },
      { count: 2 }
    );

    expect(out[0].a).toEqual({ x: 0, y: 0 });
    expect(out[0].b).toEqual({ x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expect(out[1].a).toEqual({ x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expect(out[1].b).toEqual({ x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'count=%s이면 RangeError로 실패한다',
    (count) => {
      expect(() => subdivideInto([], { a: { x: 0, y: 0 }, b: { x: 8, y: 0 } }, { count })).toThrow(RangeError);
    }
  );
});

describe('segment subdivide - subdivide', () => {
  test('새 plain segment array를 반환한다', () => {
    const result = subdivide({ a: { x: 0, y: 0 }, b: { x: 8, y: 0 } }, { count: 2 });

    expect(toPlain(result)).toEqual([
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      { a: { x: 4, y: 0 }, b: { x: 8, y: 0 } },
    ]);
  });

  test('기본 count 2를 사용한다', () => {
    const result = subdivide({ a: { x: 0, y: 0 }, b: { x: 8, y: 0 } });

    expect(result).toHaveLength(2);
  });

  test('두 번 호출하면 서로 다른 array와 object를 반환한다', () => {
    const segment: SegmentLike = { a: { x: 0, y: 0 }, b: { x: 8, y: 0 } };

    const first = subdivide(segment, { count: 2 });
    const second = subdivide(segment, { count: 2 });

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0].a).not.toBe(second[0].a);
  });

  test('subdivideInto와 같은 좌표 결과를 반환한다', () => {
    const out: SegmentWritable[] = [];
    subdivideInto(out, { a: { x: 1, y: 2 }, b: { x: 7, y: 10 } }, { count: 3 });

    const result = subdivide({ a: { x: 1, y: 2 }, b: { x: 7, y: 10 } }, { count: 3 });

    expect(toPlain(result)).toEqual(toPlain(out));
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'count=%s이면 RangeError로 실패한다',
    (count) => {
      expect(() => subdivide({ a: { x: 0, y: 0 }, b: { x: 8, y: 0 } }, { count })).toThrow(RangeError);
    }
  );
});
