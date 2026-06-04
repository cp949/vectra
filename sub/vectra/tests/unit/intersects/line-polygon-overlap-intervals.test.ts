/**
 * line-family × polygon collinear overlap interval 단위 테스트.
 *
 * S11-RM-025: segment/ray/infinite-line × polygon collinear overlap 구간을
 * rich interval detail collection으로 노출하는 helper의 interval 추출, range clipping,
 * ordering, empty/degenerate 처리, tuple 입력, Into clear/return을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { infiniteLinePolygonOverlapIntervals } from '../../../src/intersects/infinite-line-polygon-overlap-intervals';
import { infiniteLinePolygonOverlapIntervalsInto } from '../../../src/intersects/infinite-line-polygon-overlap-intervals-into';
import { rayPolygonOverlapIntervals } from '../../../src/intersects/ray-polygon-overlap-intervals';
import { rayPolygonOverlapIntervalsInto } from '../../../src/intersects/ray-polygon-overlap-intervals-into';
import { segmentPolygonIntersections } from '../../../src/intersects/segment-polygon-intersections';
import { segmentPolygonOverlapIntervals } from '../../../src/intersects/segment-polygon-overlap-intervals';
import { segmentPolygonOverlapIntervalsInto } from '../../../src/intersects/segment-polygon-overlap-intervals-into';
import type {
  InfiniteLineLike,
  LinePolygonOverlapIntervalDetail,
  PolygonLike,
  RayLike,
  SegmentLike,
  XYInput,
} from '../../../src/types';

const p = (x: number, y: number): XYInput => ({ x, y });
const segment = (ax: number, ay: number, bx: number, by: number): SegmentLike => ({ a: p(ax, ay), b: p(bx, by) });
const ray = (ox: number, oy: number, dx: number, dy: number): RayLike => ({ origin: p(ox, oy), direction: p(dx, dy) });
const infiniteLine = (ox: number, oy: number, dx: number, dy: number): InfiniteLineLike => ({
  origin: p(ox, oy),
  direction: p(dx, dy),
});
const polygon = (...points: XYInput[]): PolygonLike => ({ points });

// 단위 사각형 (0,0)-(4,0)-(4,4)-(0,4): edge index 0=bottom, 1=right, 2=top, 3=left
const square = polygon(p(0, 0), p(4, 0), p(4, 4), p(0, 4));

function intervalSpans(intervals: LinePolygonOverlapIntervalDetail[]): Array<[[number, number], [number, number]]> {
  return intervals.map((iv) => [
    [iv.start.x, iv.start.y],
    [iv.end.x, iv.end.y],
  ]);
}

describe('segmentPolygonOverlapIntervals', () => {
  test('segment이 polygon edge와 collinear overlap하면 interval 1개를 반환한다', () => {
    const intervals = segmentPolygonOverlapIntervals(segment(-1, 0, 5, 0), square);
    expect(intervals).toHaveLength(1);
    const iv = intervals[0];
    expect(iv.kind).toBe('overlap');
    expect([iv.start.x, iv.start.y]).toEqual([0, 0]);
    expect([iv.end.x, iv.end.y]).toEqual([4, 0]);
    expect(iv.edgeIndex).toBe(0);
    expect(iv.tLineStart).toBeCloseTo(1 / 6, 12);
    expect(iv.tLineEnd).toBeCloseTo(5 / 6, 12);
    expect(iv.tLineStart).toBeLessThanOrEqual(iv.tLineEnd);
    expect(iv.tEdgeStart).toBeCloseTo(0, 12);
    expect(iv.tEdgeEnd).toBeCloseTo(1, 12);
  });

  test('segment range 밖 overlap은 clipping된다', () => {
    const intervals = segmentPolygonOverlapIntervals(segment(-1, 0, 2, 0), square);
    expect(intervalSpans(intervals)).toEqual([
      [
        [0, 0],
        [2, 0],
      ],
    ]);
  });

  test('큰 direction segment도 실제 좌표 길이 기준으로 overlap interval을 반환한다', () => {
    const intervals = segmentPolygonOverlapIntervals(segment(0, 0, 1e200, 0), square);
    expect(intervalSpans(intervals)).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
    ]);
    expect(intervals[0].tLineEnd).toBeGreaterThan(0);
    expect(intervals[0].tLineEnd).toBeLessThan(1e-190);
  });

  test('큰 polygon edge에서도 edge parameter를 보존한다', () => {
    const hugeEdgePolygon = polygon(p(0, 0), p(1e200, 0), p(1e200, 4), p(0, 4));
    const intervals = segmentPolygonOverlapIntervals(segment(0, 0, 4, 0), hugeEdgePolygon);
    expect(intervalSpans(intervals)).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
    ]);
    expect(intervals[0].tEdgeStart).toBe(0);
    expect(intervals[0].tEdgeEnd).toBeGreaterThan(0);
    expect(intervals[0].tEdgeEnd).toBeLessThan(1e-190);
  });

  test('transversal crossing은 빈 배열이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(2, -1, 2, 5), square)).toEqual([]);
  });

  test('vertex touch는 빈 배열이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(2, 2, 6, 6), square)).toEqual([]);
  });

  test('polygon 내부 containment-only segment는 빈 배열이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(1, 1, 3, 3), square)).toEqual([]);
  });

  test('한 점으로 수렴하는 overlap은 빈 배열이다', () => {
    // segment endpoint가 edge 시작점에 닿기만 함(collinear지만 길이 0)
    expect(segmentPolygonOverlapIntervals(segment(-2, 0, 0, 0), square)).toEqual([]);
  });

  test('empty polygon(points.length < 3)은 빈 배열이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(-1, 0, 5, 0), polygon(p(0, 0), p(4, 0)))).toEqual([]);
  });

  test('zero-length segment는 빈 배열이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(2, 0, 2, 0), square)).toEqual([]);
  });

  test('tuple segment/polygon 입력을 지원한다', () => {
    const tupleSegment: SegmentLike = [
      [-1, 0],
      [5, 0],
    ];
    const tuplePolygon: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4],
      ],
    };
    const intervals = segmentPolygonOverlapIntervals(tupleSegment, tuplePolygon);
    expect(intervalSpans(intervals)).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
    ]);
  });

  test('기존 endpoint collection도 큰 direction collinear overlap 끝점 2건을 유지한다', () => {
    const hits = segmentPolygonIntersections(segment(0, 0, 1e200, 0), square);
    expect(hits).toHaveLength(2);
    expect(hits.map((hit) => [hit.point.x, hit.point.y])).toEqual([
      [0, 0],
      [4, 0],
    ]);
  });

  test('Into는 기존 out을 clear하고 같은 array reference를 반환한다', () => {
    const out: LinePolygonOverlapIntervalDetail[] = [
      {
        kind: 'overlap',
        start: { x: 9, y: 9 },
        end: { x: 9, y: 9 },
        tLineStart: 0,
        tLineEnd: 0,
        tEdgeStart: 0,
        tEdgeEnd: 0,
        edgeIndex: 7,
      },
    ];
    const result = segmentPolygonOverlapIntervalsInto(out, segment(-1, 0, 5, 0), square);
    expect(result).toBe(out);
    expect(out).toHaveLength(1);
    expect([out[0].start.x, out[0].end.x]).toEqual([0, 4]);
  });
});

describe('rayPolygonOverlapIntervals', () => {
  test('ray 앞쪽 overlap만 반환한다', () => {
    const intervals = rayPolygonOverlapIntervals(ray(-1, 0, 1, 0), square);
    expect(intervalSpans(intervals)).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
    ]);
    expect(intervals[0].tLineStart).toBeGreaterThanOrEqual(0);
  });

  test('ray 뒤쪽 overlap은 빈 배열이다', () => {
    // origin (5,0)에서 -x 방향이면 edge는 ray 앞쪽이지만, +x 방향이면 edge가 뒤쪽이라 비어 있다
    expect(rayPolygonOverlapIntervals(ray(5, 0, 1, 0), square)).toEqual([]);
  });

  test('origin이 edge 중간에 있고 forward range가 일부만 겹치면 origin부터 edge end까지 반환한다', () => {
    const intervals = rayPolygonOverlapIntervals(ray(2, 0, 1, 0), square);
    expect(intervalSpans(intervals)).toEqual([
      [
        [2, 0],
        [4, 0],
      ],
    ]);
    expect(intervals[0].tLineStart).toBeCloseTo(0, 12);
  });
});

describe('infiniteLinePolygonOverlapIntervals', () => {
  // y=0 위에 두 개의 collinear bottom edge를 가진 polygon
  const notched = polygon(p(0, 0), p(4, 0), p(4, 2), p(6, 2), p(6, 0), p(10, 0), p(10, 4), p(0, 4));

  test('양방향 edge overlap을 tLineStart 오름차순으로 반환한다', () => {
    const intervals = infiniteLinePolygonOverlapIntervals(infiniteLine(5, 0, 1, 0), notched);
    expect(intervalSpans(intervals)).toEqual([
      [
        [0, 0],
        [4, 0],
      ],
      [
        [6, 0],
        [10, 0],
      ],
    ]);
    expect(intervals[0].tLineStart).toBeLessThan(intervals[1].tLineStart);
    expect(intervals[0].tLineStart).toBeCloseTo(-5, 12);
    expect(intervals[1].tLineEnd).toBeCloseTo(5, 12);
  });

  test('edge direction이 line과 반대면 tEdgeStart > tEdgeEnd다', () => {
    // square top edge(index 2)는 (4,4)→(0,4)로 +x line과 방향이 반대다.
    // tEdge는 edge 순서가 아니라 line parameter start/end 순서를 따른다.
    const intervals = infiniteLinePolygonOverlapIntervals(infiniteLine(5, 4, 1, 0), square);
    expect(intervals).toHaveLength(1);
    const iv = intervals[0];
    expect(iv.edgeIndex).toBe(2);
    expect([iv.start.x, iv.start.y]).toEqual([0, 4]);
    expect([iv.end.x, iv.end.y]).toEqual([4, 4]);
    expect(iv.tEdgeStart).toBeCloseTo(1, 12);
    expect(iv.tEdgeEnd).toBeCloseTo(0, 12);
  });

  test('companion은 새 array와 새 nested point object를 반환한다', () => {
    const first = infiniteLinePolygonOverlapIntervals(infiniteLine(5, 0, 1, 0), notched);
    const second = infiniteLinePolygonOverlapIntervals(infiniteLine(5, 0, 1, 0), notched);
    expect(first).not.toBe(second);
    expect(first[0].start).not.toBe(second[0].start);
    expect(first[0].end).not.toBe(first[0].start);
  });

  test('Into는 out을 clear하고 같은 reference를 반환한다', () => {
    const out: LinePolygonOverlapIntervalDetail[] = [];
    const result = infiniteLinePolygonOverlapIntervalsInto(out, infiniteLine(5, 0, 1, 0), notched);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
  });

  test('ray Into도 out을 clear하고 같은 reference를 반환한다', () => {
    const out: LinePolygonOverlapIntervalDetail[] = [];
    const result = rayPolygonOverlapIntervalsInto(out, ray(-1, 0, 1, 0), square);
    expect(result).toBe(out);
    expect(out).toHaveLength(1);
  });
});

describe('non-finite / degenerate pass-through', () => {
  // 회귀 기준 collinear overlap(NaN/Infinity가 없으면 interval 1건)
  test('baseline: 정상 입력은 interval 1건이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(-1, 0, 5, 0), square)).toHaveLength(1);
  });

  test('non-finite direction은 빈 배열이다', () => {
    expect(segmentPolygonOverlapIntervals(segment(0, 0, Number.NaN, 0), square)).toEqual([]);
    expect(rayPolygonOverlapIntervals(ray(-1, 0, Number.NaN, 0), square)).toEqual([]);
    expect(infiniteLinePolygonOverlapIntervals(infiniteLine(-1, 0, Number.POSITIVE_INFINITY, 0), square)).toEqual([]);
  });

  test('non-finite origin은 빈 배열이다', () => {
    expect(rayPolygonOverlapIntervals(ray(Number.NaN, 0, 1, 0), square)).toEqual([]);
    expect(infiniteLinePolygonOverlapIntervals(infiniteLine(Number.NEGATIVE_INFINITY, 0, 1, 0), square)).toEqual([]);
  });

  test('non-finite vertex가 놓인 edge는 skip되어 빈 배열이다', () => {
    // 첫 edge((0,0)→(Infinity,0))는 y=0 line 위에 놓이지만 non-finite vertex 때문에 cross가 NaN이 되어
    // collinear 판정에 도달하기 전 finite guard에서 skip된다. 나머지 edge는 non-parallel이라 interval이 없다.
    const broken = polygon(p(0, 0), p(Number.POSITIVE_INFINITY, 0), p(2, 4));
    expect(infiniteLinePolygonOverlapIntervals(infiniteLine(-1, 0, 1, 0), broken)).toEqual([]);
  });

  test('zero-length ray/infinite-line direction은 빈 배열이다', () => {
    expect(rayPolygonOverlapIntervals(ray(0, 0, 0, 0), square)).toEqual([]);
    expect(infiniteLinePolygonOverlapIntervals(infiniteLine(0, 0, 0, 0), square)).toEqual([]);
  });
});
