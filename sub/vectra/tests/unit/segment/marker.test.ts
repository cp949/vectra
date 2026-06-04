import { describe, expect, test } from 'vitest';
import { marker } from '../../../src/segment/marker';
import { markerInto } from '../../../src/segment/marker-into';
import type { SegmentLike, XYObjectWritable } from '../../../src/types';

const SEG: SegmentLike = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };

describe('segment markerInto - arrow', () => {
  test('기본 options는 end arrow chevron 3점을 반환한다 (tip은 b)', () => {
    const out: XYObjectWritable[] = [];
    const result = markerInto(out, SEG);
    expect(result).toBe(out);
    expect(out).toHaveLength(3);
    // tip은 index 1, endpoint b
    expect(out[1]).toEqual({ x: 10, y: 0 });
    // 기본 length 10 → base (0,0), 기본 width 8 → barb ±4
    expect(out[0]).toEqual({ x: 0, y: 4 });
    expect(out[2]).toEqual({ x: 0, y: -4 });
  });

  test('at: "start"는 시작점 기준으로 방향을 반대로 적용한다 (tip은 a)', () => {
    const out: XYObjectWritable[] = [];
    markerInto(out, SEG, { at: 'start', length: 2, width: 2 });
    expect(out).toHaveLength(3);
    expect(out[1]).toEqual({ x: 0, y: 0 });
    // tip a에서 -x로 향하므로 barb base는 +x(2,0), 좌우 ±1
    expect(out[0]).toEqual({ x: 2, y: -1 });
    expect(out[2]).toEqual({ x: 2, y: 1 });
  });

  test('at: "both"는 start/end marker points를 모두 반환한다', () => {
    const out: XYObjectWritable[] = [];
    markerInto(out, SEG, { at: 'both', length: 2, width: 2 });
    expect(out).toHaveLength(6);
    // start marker tip은 index 1 = a
    expect(out[1]).toEqual({ x: 0, y: 0 });
    // end marker tip은 index 4 = b
    expect(out[4]).toEqual({ x: 10, y: 0 });
  });
});

describe('segment markerInto - tick', () => {
  test('type: "tick"은 endpoint 중심 perpendicular 2점을 반환한다', () => {
    const out: XYObjectWritable[] = [];
    markerInto(out, SEG, { type: 'tick', at: 'end', length: 4 });
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 2 });
    expect(out[1]).toEqual({ x: 10, y: -2 });
  });

  test('tick at: "start"는 a 중심 perpendicular 2점을 반환한다', () => {
    const out: XYObjectWritable[] = [];
    markerInto(out, SEG, { type: 'tick', at: 'start', length: 4 });
    expect(out).toHaveLength(2);
    // tick은 endpoint 중심 대칭이라 normal 부호와 무관하게 a±(0,2)
    expect(out[0]).toEqual({ x: 0, y: -2 });
    expect(out[1]).toEqual({ x: 0, y: 2 });
  });

  test('tick at: "both"는 a/b 각각 perpendicular 2점씩 4점을 반환한다', () => {
    const out: XYObjectWritable[] = [];
    markerInto(out, SEG, { type: 'tick', at: 'both', length: 4 });
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: -2 });
    expect(out[1]).toEqual({ x: 0, y: 2 });
    expect(out[2]).toEqual({ x: 10, y: 2 });
    expect(out[3]).toEqual({ x: 10, y: -2 });
  });
});

describe('segment markerInto - output 계약', () => {
  test('받은 outPoints 자체를 반환하고 기존 내용을 clear한다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
      { x: 66, y: 66 },
    ];
    const result = markerInto(out, SEG, { type: 'tick', at: 'end', length: 4 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 10, y: 2 });
  });

  test('tuple segment input을 plain point output으로 반환한다', () => {
    const out: XYObjectWritable[] = [];
    markerInto(
      out,
      [
        [0, 0],
        [10, 0],
      ],
      { type: 'tick', at: 'end', length: 4 }
    );
    expect(out).toEqual([
      { x: 10, y: 2 },
      { x: 10, y: -2 },
    ]);
  });

  test('zero-length segment는 빈 array를 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = markerInto(out, { a: { x: 5, y: 5 }, b: { x: 5, y: 5 } });
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('non-finite 좌표(NaN/±Infinity) segment는 빈 array를 반환한다', () => {
    // 방향이 정의되지 않으므로 crop helper와 같은 정책으로 marker를 만들지 않는다.
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    expect(markerInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 10, y: 0 } })).toHaveLength(0);
    expect(markerInto(out, { a: { x: 0, y: 0 }, b: { x: Number.POSITIVE_INFINITY, y: 0 } })).toHaveLength(0);
    expect(markerInto(out, { a: { x: 0, y: Number.NEGATIVE_INFINITY }, b: { x: 10, y: 0 } })).toHaveLength(0);
  });

  test('출력된 point는 새 object다', () => {
    const out: XYObjectWritable[] = [];
    markerInto(out, SEG);
    const dup = markerInto([], SEG);
    expect(out[0]).not.toBe(dup[0]);
  });
});

describe('segment markerInto - invalid option', () => {
  test('invalid type는 RangeError를 던지고 output을 수정하지 않는다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    expect(() => markerInto(out, SEG, { type: 'dot' as unknown as 'arrow' })).toThrow(RangeError);
    expect(out).toEqual([{ x: 1, y: 1 }]);
  });

  test('invalid at은 RangeError를 던지고 output을 수정하지 않는다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    expect(() => markerInto(out, SEG, { at: 'middle' as unknown as 'end' })).toThrow(RangeError);
    expect(out).toEqual([{ x: 1, y: 1 }]);
  });

  test('invalid length는 RangeError를 던진다', () => {
    expect(() => markerInto([], SEG, { length: 0 })).toThrow(RangeError);
    expect(() => markerInto([], SEG, { length: -1 })).toThrow(RangeError);
    expect(() => markerInto([], SEG, { length: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => markerInto([], SEG, { length: Number.NaN })).toThrow(RangeError);
  });

  test('invalid width는 RangeError를 던진다', () => {
    expect(() => markerInto([], SEG, { width: 0 })).toThrow(RangeError);
    expect(() => markerInto([], SEG, { width: -2 })).toThrow(RangeError);
    expect(() => markerInto([], SEG, { width: Number.NaN })).toThrow(RangeError);
  });
});

describe('segment marker companion', () => {
  test('새 array를 반환한다', () => {
    const result = marker(SEG, { type: 'tick', at: 'end', length: 4 });
    expect(result).toEqual([
      { x: 10, y: 2 },
      { x: 10, y: -2 },
    ]);
  });

  test('zero-length segment는 빈 array를 반환한다', () => {
    expect(marker({ a: { x: 5, y: 5 }, b: { x: 5, y: 5 } })).toEqual([]);
  });
});
