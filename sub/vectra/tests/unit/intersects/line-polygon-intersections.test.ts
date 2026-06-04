import { describe, expect, test } from 'vitest';
import { closestRayPolygonIntersection } from '../../../src/intersects/closest-ray-polygon-intersection';
import { closestRayPolygonIntersectionInto } from '../../../src/intersects/closest-ray-polygon-intersection-into';
import { closestSegmentPolygonIntersection } from '../../../src/intersects/closest-segment-polygon-intersection';
import { closestSegmentPolygonIntersectionInto } from '../../../src/intersects/closest-segment-polygon-intersection-into';
import { infiniteLinePolygonIntersections } from '../../../src/intersects/infinite-line-polygon-intersections';
import { infiniteLinePolygonIntersectionsInto } from '../../../src/intersects/infinite-line-polygon-intersections-into';
import { rayPolygonIntersections } from '../../../src/intersects/ray-polygon-intersections';
import { rayPolygonIntersectionsInto } from '../../../src/intersects/ray-polygon-intersections-into';
import { segmentPolygonIntersections } from '../../../src/intersects/segment-polygon-intersections';
import { segmentPolygonIntersectionsInto } from '../../../src/intersects/segment-polygon-intersections-into';
import type {
  InfiniteLineLike,
  LinePolygonIntersectionHit,
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
const wideSquare = polygon(p(0, 0), p(6, 0), p(6, 6), p(0, 6));

function points(hits: LinePolygonIntersectionHit[]): Array<[number, number]> {
  return hits.map((h) => [h.point.x, h.point.y]);
}

describe('segmentPolygonIntersections', () => {
  test('segment이 사각형을 가로지르면 tLine 오름차순 2개 hit을 반환한다', () => {
    const hits = segmentPolygonIntersections(segment(2, -1, 2, 5), square);
    expect(points(hits)).toEqual([
      [2, 0],
      [2, 4],
    ]);
    expect(hits.map((h) => h.kind)).toEqual(['cross', 'cross']);
    expect(hits[0].tLine).toBeLessThan(hits[1].tLine);
    expect(hits[0].edgeIndex).toBe(0);
    expect(hits[1].edgeIndex).toBe(2);
  });

  test('segment endpoint가 edge 위에서 끝나면 1개 hit을 반환한다', () => {
    const hits = segmentPolygonIntersections(segment(2, -1, 2, 0), square);
    expect(points(hits)).toEqual([[2, 0]]);
    expect(hits[0].tLine).toBeCloseTo(1, 12);
  });

  test('polygon vertex를 지나는 hit은 인접 edge 중복 없이 1개만 반환한다', () => {
    const hits = segmentPolygonIntersections(segment(2, 2, 6, 6), square);
    expect(points(hits)).toEqual([[4, 4]]);
    expect(hits[0].kind).toBe('touch');
  });

  test('polygon edge와 collinear overlap이면 overlap 구간 양 끝점을 반환한다', () => {
    const hits = segmentPolygonIntersections(segment(-1, 0, 5, 0), square);
    expect(points(hits)).toEqual([
      [0, 0],
      [4, 0],
    ]);
    expect(hits.map((h) => h.kind)).toEqual(['overlap', 'overlap']);
  });

  test('segment이 polygon 내부에 완전히 포함되면 빈 배열이다', () => {
    expect(segmentPolygonIntersections(segment(1, 1, 3, 3), square)).toEqual([]);
  });

  test('empty polygon(points.length < 3)은 빈 배열이다', () => {
    expect(segmentPolygonIntersections(segment(2, -1, 2, 5), polygon(p(0, 0), p(4, 0)))).toEqual([]);
  });

  test('degenerate segment direction(zero-length)은 빈 배열이다', () => {
    expect(segmentPolygonIntersections(segment(2, 2, 2, 2), square)).toEqual([]);
  });

  test('Into는 기존 out 내용을 clear하고 같은 array reference를 반환한다', () => {
    const out: LinePolygonIntersectionHit[] = [
      { point: { x: 9, y: 9 }, kind: 'cross', tLine: 0, tEdge: 0, edgeIndex: 0 },
    ];
    const result = segmentPolygonIntersectionsInto(out, segment(2, -1, 2, 5), square);
    expect(result).toBe(out);
    expect(points(out)).toEqual([
      [2, 0],
      [2, 4],
    ]);
  });

  test('companion은 새 array를 반환한다', () => {
    const a = segmentPolygonIntersections(segment(2, -1, 2, 5), square);
    const b = segmentPolygonIntersections(segment(2, -1, 2, 5), square);
    expect(a).not.toBe(b);
    expect(points(a)).toEqual(points(b));
  });

  test('object/tuple input을 모두 통과시킨다', () => {
    const tupleSegment: SegmentLike = [
      [2, -1],
      [2, 5],
    ];
    const tuplePolygon: PolygonLike = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ];
    expect(points(segmentPolygonIntersections(tupleSegment, tuplePolygon))).toEqual([
      [2, 0],
      [2, 4],
    ]);
  });
});

describe('rayPolygonIntersections', () => {
  test('origin이 polygon 내부면 exit hit 1개를 반환한다', () => {
    const hits = rayPolygonIntersections(ray(3, 3, 1, 0), wideSquare);
    expect(points(hits)).toEqual([[6, 3]]);
    expect(hits[0].kind).toBe('cross');
  });

  test('ray 뒤쪽에만 polygon이 있으면 빈 배열이다', () => {
    expect(rayPolygonIntersections(ray(8, 3, 1, 0), wideSquare)).toEqual([]);
  });

  test('ray가 polygon vertex를 지나면 인접 edge 중복 없이 1개만 반환한다', () => {
    const hits = rayPolygonIntersections(ray(2, 2, 1, 1), square);
    expect(points(hits)).toEqual([[4, 4]]);
    expect(hits[0].kind).toBe('touch');
  });

  test('empty polygon과 degenerate ray direction은 빈 배열이다', () => {
    expect(rayPolygonIntersections(ray(3, 3, 1, 0), polygon(p(0, 0), p(6, 0)))).toEqual([]);
    expect(rayPolygonIntersections(ray(3, 3, 0, 0), wideSquare)).toEqual([]);
  });

  test('Into는 기존 out 내용을 clear하고 같은 array reference를 반환한다', () => {
    const out: LinePolygonIntersectionHit[] = [
      { point: { x: 9, y: 9 }, kind: 'cross', tLine: 0, tEdge: 0, edgeIndex: 0 },
    ];
    const result = rayPolygonIntersectionsInto(out, ray(3, 3, 1, 0), wideSquare);
    expect(result).toBe(out);
    expect(points(out)).toEqual([[6, 3]]);
  });

  test('object/tuple input을 모두 통과시킨다', () => {
    const tupleRay: RayLike = [3, 3, 1, 0];
    const tuplePolygon: PolygonLike = [
      [0, 0],
      [6, 0],
      [6, 6],
      [0, 6],
    ];
    expect(points(rayPolygonIntersections(tupleRay, tuplePolygon))).toEqual([[6, 3]]);
  });
});

describe('infiniteLinePolygonIntersections', () => {
  test('infinite-line은 양방향 hit을 tLine 오름차순으로 반환한다', () => {
    const hits = infiniteLinePolygonIntersections(infiniteLine(2, 2, 1, 0), square);
    expect(points(hits)).toEqual([
      [0, 2],
      [4, 2],
    ]);
    expect(hits[0].tLine).toBeLessThan(0);
    expect(hits[1].tLine).toBeGreaterThan(0);
  });

  test('polygon edge와 collinear overlap이면 overlap 구간 양 끝점을 반환한다', () => {
    const hits = infiniteLinePolygonIntersections(infiniteLine(0, 0, 1, 0), square);
    expect(points(hits)).toEqual([
      [0, 0],
      [4, 0],
    ]);
    expect(hits.map((h) => h.kind)).toEqual(['overlap', 'overlap']);
  });

  test('empty polygon과 degenerate direction은 빈 배열이다', () => {
    expect(infiniteLinePolygonIntersections(infiniteLine(2, 2, 1, 0), polygon(p(0, 0), p(4, 0)))).toEqual([]);
    expect(infiniteLinePolygonIntersections(infiniteLine(2, 2, 0, 0), square)).toEqual([]);
  });

  test('Into는 기존 out 내용을 clear하고 같은 array reference를 반환한다', () => {
    const out: LinePolygonIntersectionHit[] = [
      { point: { x: 9, y: 9 }, kind: 'cross', tLine: 0, tEdge: 0, edgeIndex: 0 },
    ];
    const result = infiniteLinePolygonIntersectionsInto(out, infiniteLine(2, 2, 1, 0), square);
    expect(result).toBe(out);
    expect(points(out)).toEqual([
      [0, 2],
      [4, 2],
    ]);
  });

  test('companion은 새 array를 반환한다', () => {
    const a = infiniteLinePolygonIntersections(infiniteLine(2, 2, 1, 0), square);
    const b = infiniteLinePolygonIntersections(infiniteLine(2, 2, 1, 0), square);
    expect(a).not.toBe(b);
    expect(points(a)).toEqual(points(b));
  });

  test('object/tuple input을 모두 통과시킨다', () => {
    const tupleLine: InfiniteLineLike = [
      [2, 2],
      [1, 0],
    ];
    const tuplePolygon: PolygonLike = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ];
    expect(points(infiniteLinePolygonIntersections(tupleLine, tuplePolygon))).toEqual([
      [0, 2],
      [4, 2],
    ]);
  });
});

describe('closestSegmentPolygonIntersection', () => {
  test('segment collection의 첫 hit과 같은 point/metadata를 반환한다', () => {
    const first = segmentPolygonIntersections(segment(2, -1, 2, 5), square)[0];
    expect(closestSegmentPolygonIntersection(segment(2, -1, 2, 5), square)).toEqual(first);
  });

  test('overlap이 첫 hit이면 overlap 시작점을 반환한다', () => {
    const hit = closestSegmentPolygonIntersection(segment(-1, 0, 5, 0), square);
    expect(hit).toEqual({ point: { x: 0, y: 0 }, kind: 'overlap', tLine: hit?.tLine ?? 0, tEdge: 0, edgeIndex: 0 });
    expect(hit?.kind).toBe('overlap');
  });

  test('no-hit case에서 Into는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: LinePolygonIntersectionHit = { point: { x: 7, y: 7 }, kind: 'cross', tLine: 1, tEdge: 1, edgeIndex: 2 };
    // containment-only segment (polygon 내부 완전 포함)
    const ok = closestSegmentPolygonIntersectionInto(out, segment(1, 1, 3, 3), square);
    expect(ok).toBe(false);
    expect(out).toEqual({ point: { x: 7, y: 7 }, kind: 'cross', tLine: 1, tEdge: 1, edgeIndex: 2 });
  });

  test('no-hit case에서 companion은 undefined를 반환한다', () => {
    expect(closestSegmentPolygonIntersection(segment(1, 1, 3, 3), square)).toBeUndefined();
  });
});

describe('closestRayPolygonIntersection', () => {
  test('ray collection의 첫 hit과 같은 point/metadata를 반환한다', () => {
    const first = rayPolygonIntersections(ray(3, 3, 1, 0), wideSquare)[0];
    expect(closestRayPolygonIntersection(ray(3, 3, 1, 0), wideSquare)).toEqual(first);
  });

  test('no-hit case에서 Into는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: LinePolygonIntersectionHit = { point: { x: 7, y: 7 }, kind: 'cross', tLine: 1, tEdge: 1, edgeIndex: 2 };
    const ok = closestRayPolygonIntersectionInto(out, ray(8, 3, 1, 0), wideSquare);
    expect(ok).toBe(false);
    expect(out).toEqual({ point: { x: 7, y: 7 }, kind: 'cross', tLine: 1, tEdge: 1, edgeIndex: 2 });
  });

  test('no-hit case에서 companion은 undefined를 반환한다', () => {
    expect(closestRayPolygonIntersection(ray(8, 3, 1, 0), wideSquare)).toBeUndefined();
  });
});

describe('line/polygon kernel edge cases', () => {
  // edge 길이가 큰 polygon. edge-local tolerance를 normalized [0,1] param에 epsilon을 그대로 쓰면
  // tolerance가 edge 길이만큼 거리로 부풀어 polygon 밖 점이 spurious touch로 잡힌다.
  const bigBox = polygon(p(0, 0), p(1e9, 0), p(1e9, 10), p(0, 10));

  test('큰 edge에서 polygon 밖(x=-0.5)을 지나는 line은 빈 배열이다', () => {
    expect(infiniteLinePolygonIntersections(infiniteLine(-0.5, -1, 0, 1), bigBox)).toEqual([]);
  });

  test('큰 edge 내부(x=0.5) transversal 교점은 touch가 아니라 cross다', () => {
    const hits = infiniteLinePolygonIntersections(infiniteLine(0.5, -1, 0, 1), bigBox);
    expect(points(hits)).toEqual([
      [0.5, 0],
      [0.5, 10],
    ]);
    expect(hits.map((h) => h.kind)).toEqual(['cross', 'cross']);
  });

  test('NaN vertex는 가짜 NaN overlap record를 만들지 않는다', () => {
    const naNPoly = polygon(p(0, 0), p(4, 0), p(Number.NaN, 4), p(0, 4));
    const hits = segmentPolygonIntersections(segment(2, -1, 2, 5), naNPoly);
    expect(hits.every((h) => Number.isFinite(h.point.x) && Number.isFinite(h.point.y))).toBe(true);
    expect(hits.some((h) => h.kind === 'overlap')).toBe(false);
  });

  test('NaN direction은 빈 배열이다', () => {
    expect(segmentPolygonIntersections(segment(2, Number.NaN, 2, 5), square)).toEqual([]);
  });

  test('Infinity origin은 가짜 NaN record를 만들지 않는다', () => {
    expect(infiniteLinePolygonIntersections(infiniteLine(Number.POSITIVE_INFINITY, 0, 0, 1), square)).toEqual([]);
    expect(infiniteLinePolygonIntersections(infiniteLine(0, Number.POSITIVE_INFINITY, 1, 0), square)).toEqual([]);
  });
});
