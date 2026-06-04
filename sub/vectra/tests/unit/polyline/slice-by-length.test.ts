/**
 * polyline sliceByLength collection helper unit test.
 *
 * sliceByLengthInto/sliceByLength의 forward/reversed slice, clamp, interpolated endpoint,
 * 내부 vertex 포함, empty/single/repeated total length 0 fallback, tuple/object input,
 * aliasing, non-finite 좌표 전파 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { sliceByLength } from '../../../src/polyline/slice-by-length';
import { sliceByLengthInto } from '../../../src/polyline/slice-by-length-into';
import type { PolylineLike, XYObjectWritable } from '../../../src/types';

const L_SHAPE: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
};

describe('polyline sliceByLength - sliceByLengthInto', () => {
  test('받은 outPoints 자체를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    expect(sliceByLengthInto(out, L_SHAPE, 5, 15)).toBe(out);
  });

  test('forward slice는 양끝 interpolated endpoint와 내부 vertex를 포함한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, 5, 15);
    expect(out).toEqual([
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
    ]);
  });

  test('reversed range는 forward 구간을 reverse해 반환한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, 15, 5);
    expect(out).toEqual([
      { x: 10, y: 5 },
      { x: 10, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  test('clamp 후 전체 구간이면 전체 polyline point sequence를 반환한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, -5, 25);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  test('boundary와 같은 vertex arc-length는 endpoint로만 포함하고 중복하지 않는다', () => {
    // vertex (10,0)의 arc-length 10이 endpoint와 같으면 endpoint 1개로만 나타난다.
    const out = sliceByLengthInto([], L_SHAPE, 10, 15);
    expect(out).toEqual([
      { x: 10, y: 0 },
      { x: 10, y: 5 },
    ]);
  });

  test('start === end이면 endpoint 2개(같은 좌표)를 반환한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, 5, 5);
    expect(out).toEqual([
      { x: 5, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  test('start === end === 0 boundary는 첫 point 2개를 반환한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, 0, 0);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  test('start === end === totalLength boundary는 마지막 point 2개를 반환한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, 20, 20);
    expect(out).toEqual([
      { x: 10, y: 10 },
      { x: 10, y: 10 },
    ]);
  });

  test('내부 zero-length segment의 중복 vertex는 dedupe 없이 유지한다', () => {
    // (5,0) vertex가 zero-length segment로 중복돼도 내부 vertex로 그대로 push된다.
    const out = sliceByLengthInto(
      [],
      {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 0 },
          { x: 10, y: 0 },
        ],
      },
      2,
      8
    );
    expect(out).toEqual([
      { x: 2, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 0 },
      { x: 8, y: 0 },
    ]);
  });

  test('leading zero-length segment에서 target 0 endpoint는 첫 vertex 좌표를 반환한다', () => {
    // cum[1] === 0인 leading zero-length segment에서 target === 0이면 sampleAt의
    // segLen === 0 분기로 첫 vertex 좌표를 반환한다 (이 분기에 도달하는 유일한 경로).
    const out = sliceByLengthInto(
      [],
      {
        points: [
          { x: 1, y: 2 },
          { x: 1, y: 2 },
          { x: 10, y: 2 },
        ],
      },
      0,
      0
    );
    expect(out).toEqual([
      { x: 1, y: 2 },
      { x: 1, y: 2 },
    ]);
  });

  test('reversed range도 outPoints === source points aliasing에서 안전하다', () => {
    const points: XYObjectWritable[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const result = sliceByLengthInto(points, { points }, 8, 2);
    expect(result).toBe(points);
    expect(points).toEqual([
      { x: 8, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('empty polyline은 out을 clear하고 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
    ];
    const result = sliceByLengthInto(out, { points: [] }, 0, 1);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 첫 point 1개를 반환한다', () => {
    const out = sliceByLengthInto([], { points: [{ x: 3, y: 4 }] }, 0, 10);
    expect(out).toEqual([{ x: 3, y: 4 }]);
  });

  test('total length 0 repeated-point polyline은 첫 point 1개를 반환한다', () => {
    const out = sliceByLengthInto(
      [],
      {
        points: [
          { x: 2, y: 2 },
          { x: 2, y: 2 },
        ],
      },
      3,
      7
    );
    expect(out).toEqual([{ x: 2, y: 2 }]);
  });

  test('outPoints와 source points 배열이 같아도 안전하다', () => {
    const points: XYObjectWritable[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const result = sliceByLengthInto(points, { points }, 2, 8);
    expect(result).toBe(points);
    expect(points).toEqual([
      { x: 2, y: 0 },
      { x: 8, y: 0 },
    ]);
  });

  test('tuple / object mixed point input을 새 object point로 출력한다', () => {
    const out = sliceByLengthInto(
      [],
      {
        points: [[0, 0], { x: 10, y: 0 }, [10, 10]],
      },
      5,
      15
    );
    expect(out).toEqual([
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
    ]);
  });

  test('output point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 0, y: 0 };
    const out = sliceByLengthInto([], { points: [pt, { x: 10, y: 0 }] }, 0, 10);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[0]).not.toBe(pt);
  });

  test('Infinity 좌표는 sanitize 없이 non-finite를 전파한다', () => {
    const out = sliceByLengthInto(
      [],
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: Number.POSITIVE_INFINITY },
        ],
      },
      5,
      15
    );
    // 유한 첫 segment의 endpoint는 그대로 유지한다.
    expect(out[0]).toEqual({ x: 5, y: 0 });
    // Infinity segment 위 보간은 finite 검증 없이 non-finite 결과를 전파한다.
    expect(Number.isFinite(out[out.length - 1].y)).toBe(false);
  });

  test('Infinity start와 -Infinity end는 [0, totalLength]로 clamp해 reversed 전체 구간을 반환한다', () => {
    // start +Infinity → totalLength(20), end -Infinity → 0. clamp 후 start > end이므로 reversed.
    const out = sliceByLengthInto([], L_SHAPE, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
    expect(out).toEqual([
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  test('-Infinity start와 Infinity end는 forward 전체 구간을 반환한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  test('NaN start는 endpoint에 NaN component를 전파한다', () => {
    const out = sliceByLengthInto([], L_SHAPE, Number.NaN, 5);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(Number.isNaN(out[0].y)).toBe(true);
  });

  test('NaN source coordinate는 sampling 결과에 NaN을 전파한다', () => {
    const out = sliceByLengthInto(
      [],
      {
        points: [
          { x: 0, y: 0 },
          { x: Number.NaN, y: 0 },
        ],
      },
      0,
      0
    );
    // total length가 NaN이면 repeated/single fallback에 해당하지 않고 NaN을 전파한다.
    expect(out.length).toBeGreaterThanOrEqual(1);
    expect(Number.isNaN(out[out.length - 1].x)).toBe(true);
  });
});

describe('polyline sliceByLength - sliceByLength', () => {
  test('새 배열과 새 plain point를 반환한다', () => {
    expect(sliceByLength(L_SHAPE, 5, 15)).toEqual([
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    expect(sliceByLength(L_SHAPE, 5, 15)).not.toBe(sliceByLength(L_SHAPE, 5, 15));
  });

  test('clamp/reversed/degenerate 정책을 sliceByLengthInto와 동일하게 적용한다', () => {
    expect(sliceByLength(L_SHAPE, 15, 5)).toEqual([
      { x: 10, y: 5 },
      { x: 10, y: 0 },
      { x: 5, y: 0 },
    ]);
    expect(sliceByLength({ points: [] }, 0, 1)).toEqual([]);
    expect(sliceByLength({ points: [{ x: 3, y: 4 }] }, 0, 10)).toEqual([{ x: 3, y: 4 }]);
  });
});
