/**
 * polyline subdivide collection helper unit test.
 *
 * subdivide point collection helper의 clear/push/aliasing/edge-case 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { subdivide } from '../../../src/polyline/subdivide';
import { subdivideInto } from '../../../src/polyline/subdivide-into';
import type { PolylineSubdivideOptions } from '../../../src/types';
import type { Polyline, PointWritable } from '../../../src/types/flat-shapes.internal';

const EMPTY: Polyline = [];
const TWO_PT: Polyline = [
  { x: 1, y: 2 },
  { x: 3, y: 4 },
];
const THREE_PT: Polyline = [
  { x: 0, y: 0 },
  { x: 3, y: 4 },
  { x: 6, y: 8 },
];

describe('polyline bridge/collection - subdivideInto', () => {
  test('받은 outPoints 자체를 반환한다', () => {
    const out: PointWritable[] = [];
    expect(subdivideInto(out, TWO_PT)).toBe(out);
  });

  test('빈 polyline이면 out을 clear하고 빈 배열을 반환한다', () => {
    const out: PointWritable[] = [{ x: 9, y: 9 }];
    subdivideInto(out, EMPTY);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 해당 point를 복제한다', () => {
    const out: PointWritable[] = [];
    subdivideInto(out, [{ x: 5, y: 7 }]);
    expect(out).toEqual([{ x: 5, y: 7 }]);
  });

  test('기본값 2는 각 segment에 midpoint를 추가한다', () => {
    const out: PointWritable[] = [];
    subdivideInto(out, [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  test('segmentsPerSegment 3은 1/3, 2/3 point를 추가한다', () => {
    const out: PointWritable[] = [];
    subdivideInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 3, y: 3 },
      ],
      { segmentsPerSegment: 3 }
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]);
  });

  test('segmentsPerSegment 1은 원본 point 복제와 같다', () => {
    const out: PointWritable[] = [];
    subdivideInto(out, THREE_PT, { segmentsPerSegment: 1 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 6, y: 8 },
    ]);
  });

  test('multi-segment polyline을 분할한다', () => {
    const out: PointWritable[] = [];
    subdivideInto(out, [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
    ]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ]);
  });

  test('zero-length segment도 중복 point를 생성한다', () => {
    const out: PointWritable[] = [];
    subdivideInto(out, [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    ]);
    expect(out).toEqual([
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  test('input/output 배열 aliasing에서도 좌표가 유지된다', () => {
    const sharedPoints: PointWritable[] = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ];
    subdivideInto(sharedPoints, sharedPoints);
    expect(sharedPoints).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  test.each([0, -1, 2.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'segmentsPerSegment %p는 RangeError를 던진다',
    (value) => {
      expect(() => subdivideInto([], TWO_PT, { segmentsPerSegment: value })).toThrow(RangeError);
    }
  );

  test('segmentsPerSegment가 빠진 옵션 객체는 RangeError를 던진다', () => {
    // 타입을 무시한 JS 호출자를 흉내 낸다. 빠진 필드에 기본값 2를 쓰지 않는다.
    const missing = {} as PolylineSubdivideOptions;
    expect(() => subdivideInto([], TWO_PT, missing)).toThrow(RangeError);
  });
});

describe('polyline bridge/collection - subdivide', () => {
  test('새 배열을 반환한다', () => {
    expect(
      subdivide([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
      ])
    ).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    expect(subdivide(TWO_PT)).not.toBe(subdivide(TWO_PT));
  });

  test('invalid segmentsPerSegment는 RangeError를 던진다', () => {
    expect(() => subdivide(TWO_PT, { segmentsPerSegment: 0 })).toThrow(RangeError);
  });
});

describe('polyline bridge/collection - subdivide non-finite 좌표 pass-through', () => {
  test('subdivideInto는 NaN 좌표를 그대로 전파한다', () => {
    const out = subdivideInto(
      [],
      [
        { x: Number.NaN, y: 0 },
        { x: 2, y: 0 },
      ]
    );
    // segment 시작점은 source의 NaN, midpoint는 NaN+유한 보간으로 NaN.
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(Number.isNaN(out[1].x)).toBe(true);
  });

  test('subdivideInto는 source point를 보존하고 Infinity 내부 분할점을 생성한다', () => {
    // segment 시작점은 source point를 그대로 복제한다. midpoint는 보간으로 Infinity가 된다.
    const out = subdivideInto(
      [],
      [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 0 },
      ]
    );
    expect(out).toHaveLength(3);
    expect(out[0].x).toBe(0);
    expect(out[1].x).toBe(Number.POSITIVE_INFINITY); // 0.5 * Infinity → Infinity
    expect(out[2].x).toBe(Number.POSITIVE_INFINITY); // 마지막 source point 그대로
  });

  test('subdivideInto의 시작점 Infinity는 source point로 보존된다', () => {
    // start 좌표가 Infinity면 dx = -Infinity. midpoint는 Infinity + (-Infinity)로 NaN.
    const out = subdivideInto(
      [],
      [
        { x: Number.POSITIVE_INFINITY, y: 0 },
        { x: 0, y: 0 },
      ]
    );
    expect(out).toHaveLength(3);
    expect(out[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(out[2].x).toBe(0); // 마지막 source point 그대로(유한)
  });

  test('subdivideInto segmentsPerSegment 1은 non-finite 좌표도 원본 point 복제와 같다', () => {
    const out = subdivideInto(
      [],
      [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
        { x: Number.NaN, y: 3 },
      ],
      { segmentsPerSegment: 1 }
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
      { x: Number.NaN, y: 3 },
    ]);
  });
});
