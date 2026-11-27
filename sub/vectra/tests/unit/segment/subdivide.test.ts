/**
 * segment subdivide collection helper unit test.
 *
 * `count` 기준 균등 N분할 collection helper의 clear/push/aliasing/edge-case 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { subdivide } from '../../../src/segment/subdivide';
import { subdivideInto } from '../../../src/segment/subdivide-into';
import type { SegmentSubdivideOptions } from '../../../src/types';
import type { Segment, SegmentWritable } from '../../../src/types/flat-shapes.internal';

describe('segment subdivide - subdivideInto', () => {
  test('옵션을 생략하면 선분을 두 등분하고 out을 반환한다', () => {
    const out: SegmentWritable[] = [];

    const result = subdivideInto(out, { x1: 0, y1: 0, x2: 8, y2: 0 });

    expect(result).toBe(out);
    expect(out).toEqual([
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x1: 4, y1: 0, x2: 8, y2: 0 },
    ]);
  });

  test('count 4로 (0, 0) → (8, 0) 선분을 4개로 나눈다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { x1: 0, y1: 0, x2: 8, y2: 0 }, { count: 4 });

    expect(out).toEqual([
      { x1: 0, y1: 0, x2: 2, y2: 0 },
      { x1: 2, y1: 0, x2: 4, y2: 0 },
      { x1: 4, y1: 0, x2: 6, y2: 0 },
      { x1: 6, y1: 0, x2: 8, y2: 0 },
    ]);
  });

  test('인접 sub-segment의 공유점은 같은 좌표값을 갖는다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { x1: 0, y1: 0, x2: 9, y2: 3 }, { count: 3 });

    expect(out[0].x2).toBe(out[1].x1);
    expect(out[0].y2).toBe(out[1].y1);
    expect(out[1].x2).toBe(out[2].x1);
    expect(out[1].y2).toBe(out[2].y1);
  });

  test('count 1은 원본 segment 1개 복제와 같다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { x1: 1, y1: 2, x2: 5, y2: 6 }, { count: 1 });

    expect(out).toEqual([{ x1: 1, y1: 2, x2: 5, y2: 6 }]);
  });

  test('zero-length segment는 count개 zero-length segment를 만든다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { x1: 3, y1: 7, x2: 3, y2: 7 }, { count: 3 });

    expect(out).toEqual([
      { x1: 3, y1: 7, x2: 3, y2: 7 },
      { x1: 3, y1: 7, x2: 3, y2: 7 },
      { x1: 3, y1: 7, x2: 3, y2: 7 },
    ]);
  });

  test('호출 시작 시 기존 output array를 clear한다', () => {
    const out: SegmentWritable[] = [
      { x1: 99, y1: 99, x2: 99, y2: 99 },
      { x1: 99, y1: 99, x2: 99, y2: 99 },
      { x1: 99, y1: 99, x2: 99, y2: 99 },
    ];

    subdivideInto(out, { x1: 0, y1: 0, x2: 8, y2: 0 }, { count: 2 });

    expect(out).toHaveLength(2);
    expect(out).toEqual([
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x1: 4, y1: 0, x2: 8, y2: 0 },
    ]);
  });

  test('출력 배열에 입력 선분이 있어도 분할 결과를 기록한다', () => {
    const segment = { x1: 0, y1: 0, x2: 8, y2: 0 };
    const out: SegmentWritable[] = [segment];

    subdivideInto(out, segment, { count: 2 });

    expect(out).toEqual([
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x1: 4, y1: 0, x2: 8, y2: 0 },
    ]);
  });

  test('시작점 좌표가 NaN이면 arithmetic 결과를 그대로 기록한다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { x1: Number.NaN, y1: 0, x2: 4, y2: 8 }, { count: 2 });

    expect(out[0]).toEqual({ x1: Number.NaN, y1: 0, x2: Number.NaN, y2: 4 });
    expect(out[1]).toEqual({ x1: Number.NaN, y1: 4, x2: 4, y2: 8 });
  });

  test('끝점 좌표가 ±Infinity면 시작/끝점은 정확히 보존하고 내부는 arithmetic 결과를 기록한다', () => {
    const out: SegmentWritable[] = [];

    subdivideInto(out, { x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: Number.NEGATIVE_INFINITY }, { count: 2 });

    expect(out[0]).toEqual({ x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: Number.NEGATIVE_INFINITY });
    expect(out[1]).toEqual({
      x1: Number.POSITIVE_INFINITY,
      y1: Number.NEGATIVE_INFINITY,
      x2: Number.POSITIVE_INFINITY,
      y2: Number.NEGATIVE_INFINITY,
    });
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'count=%s이면 RangeError로 실패한다',
    (count) => {
      expect(() => subdivideInto([], { x1: 0, y1: 0, x2: 8, y2: 0 }, { count })).toThrow(RangeError);
    }
  );

  test('옵션 객체에 count가 없으면 기본값을 쓰지 않고 RangeError로 실패한다', () => {
    const options = {} as SegmentSubdivideOptions;

    expect(() => subdivideInto([], { x1: 0, y1: 0, x2: 8, y2: 0 }, options)).toThrow(RangeError);
  });
});

describe('segment subdivide - subdivide', () => {
  test('새 plain segment array를 반환한다', () => {
    const result = subdivide({ x1: 0, y1: 0, x2: 8, y2: 0 }, { count: 2 });

    expect(result).toEqual([
      { x1: 0, y1: 0, x2: 4, y2: 0 },
      { x1: 4, y1: 0, x2: 8, y2: 0 },
    ]);
  });

  test('옵션을 생략하면 두 등분한다', () => {
    const result = subdivide({ x1: 0, y1: 0, x2: 8, y2: 0 });

    expect(result).toHaveLength(2);
  });

  test('두 번 호출하면 서로 다른 array와 object를 반환한다', () => {
    const segment: Segment = { x1: 0, y1: 0, x2: 8, y2: 0 };

    const first = subdivide(segment, { count: 2 });
    const second = subdivide(segment, { count: 2 });

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
  });

  test('subdivideInto와 같은 좌표 결과를 반환한다', () => {
    const out: SegmentWritable[] = [];
    subdivideInto(out, { x1: 1, y1: 2, x2: 7, y2: 10 }, { count: 3 });

    const result = subdivide({ x1: 1, y1: 2, x2: 7, y2: 10 }, { count: 3 });

    expect(result).toEqual(out);
  });

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'count=%s이면 RangeError로 실패한다',
    (count) => {
      expect(() => subdivide({ x1: 0, y1: 0, x2: 8, y2: 0 }, { count })).toThrow(RangeError);
    }
  );
});
