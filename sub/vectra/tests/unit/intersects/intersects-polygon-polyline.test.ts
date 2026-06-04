import { describe, expect, test } from 'vitest';
import { intersectsPolygonInfiniteLine } from '../../../src/intersects/intersects-polygon-infinite-line';
import { intersectsPolygonPolyline } from '../../../src/intersects/intersects-polygon-polyline';
import { intersectsPolygonRay } from '../../../src/intersects/intersects-polygon-ray';
import { intersectsPolygonSegment } from '../../../src/intersects/intersects-polygon-segment';
import { intersectsPolylineInfiniteLine } from '../../../src/intersects/intersects-polyline-infinite-line';
import { intersectsPolylineRay } from '../../../src/intersects/intersects-polyline-ray';
import { intersectsPolylineSegment } from '../../../src/intersects/intersects-polyline-segment';
import type { PolygonLike, PolylineLike, XYInput } from '../../../src/types';

type SegmentLike = Parameters<typeof intersectsPolylineSegment>[1];
type RayLike = Parameters<typeof intersectsPolylineRay>[1];
type InfiniteLineLike = Parameters<typeof intersectsPolylineInfiniteLine>[1];

type RelationCase<Subject, Target> = {
  name: string;
  subject: Subject;
  target: Target;
  expected: boolean;
};

const p = (x: number, y: number): XYInput => ({ x, y });
const segment = (ax: number, ay: number, bx: number, by: number): SegmentLike => ({
  a: p(ax, ay),
  b: p(bx, by),
});
const ray = (ox: number, oy: number, dx: number, dy: number): RayLike => ({
  origin: p(ox, oy),
  direction: p(dx, dy),
});
const infiniteLine = (ox: number, oy: number, dx: number, dy: number): InfiniteLineLike => ({
  origin: p(ox, oy),
  direction: p(dx, dy),
});
const polyline = (...points: XYInput[]): PolylineLike => ({ points });
const polygon = (...points: XYInput[]): PolygonLike => ({ points });

const polylineArray = (...points: XYInput[]): PolylineLike => points;
const polygonArray = (...points: XYInput[]): PolygonLike => points;

const square = polygon(p(0, 0), p(4, 0), p(4, 4), p(0, 4));
const squareArray = polygonArray(p(0, 0), p(4, 0), p(4, 4), p(0, 4));
const wideSquare = polygon(p(0, 0), p(6, 0), p(6, 6), p(0, 6));
const shortPolygon = polygon(p(0, 0), p(1, 1));

const polylineSegmentCases: RelationCase<PolylineLike, SegmentLike>[] = [
  {
    name: 'segment이 polyline segment 하나를 가로지르면 true를 반환한다',
    subject: polyline(p(2, 0), p(2, 2)),
    target: segment(0, 1, 4, 1),
    expected: true,
  },
  {
    name: 'segment이 polyline 옆을 지나쳐 교차하지 않으면 false를 반환한다',
    subject: polyline(p(0, 0), p(1, 0), p(1, 1)),
    target: segment(5, 0, 5, 2),
    expected: false,
  },
  {
    name: 'segment이 polyline vertex를 정확히 touch하면 true를 반환한다',
    subject: polyline(p(0, 1), p(1, 1), p(3, 1)),
    target: segment(1, 0, 1, 2),
    expected: true,
  },
  {
    name: 'segment이 polyline segment와 collinear overlap하면 true를 반환한다',
    subject: polyline(p(1, 0), p(2, 0)),
    target: segment(0, 0, 3, 0),
    expected: true,
  },
  {
    name: 'empty polyline은 false를 반환한다',
    subject: polyline(),
    target: segment(0, 0, 1, 1),
    expected: false,
  },
  {
    name: 'single-point polyline은 segment가 없으므로 false를 반환한다',
    subject: polyline(p(0.5, 0.5)),
    target: segment(0, 0, 1, 1),
    expected: false,
  },
  {
    name: 'repeated-point zero-length segment와 segment이 그 점을 지나면 true를 반환한다',
    subject: polyline(p(1, 1), p(1, 1)),
    target: segment(0, 1, 2, 1),
    expected: true,
  },
  {
    name: 'PolylineLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: polylineArray(p(2, 0), p(2, 2)),
    target: segment(0, 1, 4, 1),
    expected: true,
  },
  {
    name: 'polyline은 마지막→첫 edge가 없으므로 그 edge와 교차해도 false를 반환한다',
    subject: polyline(p(0, 0), p(2, 1), p(4, 0)),
    target: segment(0, 0.5, 0, 1.5),
    expected: false,
  },
];

const polylineRayCases: RelationCase<PolylineLike, RayLike>[] = [
  {
    name: 'ray 방향으로 polyline segment와 교차하면 true를 반환한다',
    subject: polyline(p(2, 0), p(2, 2)),
    target: ray(0, 1, 1, 0),
    expected: true,
  },
  {
    name: 'ray 역방향에만 polyline이 있으면 false를 반환한다',
    subject: polyline(p(2, 0), p(2, 2)),
    target: ray(5, 1, 1, 0),
    expected: false,
  },
  {
    name: 'empty polyline은 false를 반환한다',
    subject: polyline(),
    target: ray(0, 0, 1, 0),
    expected: false,
  },
  {
    name: 'ray가 polyline vertex를 정확히 touch하면 true를 반환한다',
    subject: polyline(p(2, 0), p(2, 1), p(4, 1)),
    target: ray(0, 1, 1, 0),
    expected: true,
  },
  {
    name: 'ray가 polyline segment와 collinear overlap하면 true를 반환한다',
    subject: polyline(p(2, 0), p(4, 0)),
    target: ray(0, 0, 1, 0),
    expected: true,
  },
  {
    name: 'single-point polyline은 false를 반환한다',
    subject: polyline(p(1, 0)),
    target: ray(0, 0, 1, 0),
    expected: false,
  },
  {
    name: 'PolylineLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: polylineArray(p(2, 0), p(2, 2)),
    target: ray(0, 1, 1, 0),
    expected: true,
  },
];

const polylineInfiniteLineCases: RelationCase<PolylineLike, InfiniteLineLike>[] = [
  {
    name: 'infinite-line이 polyline segment를 가로지르면 true를 반환한다',
    subject: polyline(p(2, 0), p(2, 2)),
    target: infiniteLine(0, 1, 1, 0),
    expected: true,
  },
  {
    name: 'infinite-line이 polyline과 평행하고 떨어져 있으면 false를 반환한다',
    subject: polyline(p(0, 0), p(3, 0)),
    target: infiniteLine(0, 5, 1, 0),
    expected: false,
  },
  {
    name: 'infinite-line이 polyline vertex를 touch하면 true를 반환한다',
    subject: polyline(p(0, 0), p(2, 1)),
    target: infiniteLine(0, 1, 1, 0),
    expected: true,
  },
  {
    name: 'infinite-line이 polyline segment와 collinear overlap하면 true를 반환한다',
    subject: polyline(p(1, 0), p(3, 0)),
    target: infiniteLine(0, 0, 1, 0),
    expected: true,
  },
  {
    name: 'empty polyline은 false를 반환한다',
    subject: polyline(),
    target: infiniteLine(0, 0, 1, 0),
    expected: false,
  },
  {
    name: 'single-point polyline은 false를 반환한다',
    subject: polyline(p(1, 0)),
    target: infiniteLine(0, 0, 1, 0),
    expected: false,
  },
  {
    name: 'PolylineLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: polylineArray(p(2, 0), p(2, 2)),
    target: infiniteLine(0, 1, 1, 0),
    expected: true,
  },
];

const polygonSegmentCases: RelationCase<PolygonLike, SegmentLike>[] = [
  {
    name: 'segment이 polygon edge를 가로지르면 true를 반환한다',
    subject: square,
    target: segment(2, -1, 2, 2),
    expected: true,
  },
  {
    name: 'segment이 polygon 내부에 완전히 포함되면 true를 반환한다',
    subject: wideSquare,
    target: segment(1, 1, 5, 5),
    expected: true,
  },
  {
    name: 'segment이 polygon 바깥을 완전히 지나가면 false를 반환한다',
    subject: polygon(p(0, 0), p(2, 0), p(2, 2), p(0, 2)),
    target: segment(5, 0, 5, 2),
    expected: false,
  },
  {
    name: 'segment이 polygon vertex를 touch하면 true를 반환한다',
    subject: square,
    target: segment(4, 2, 6, 2),
    expected: true,
  },
  {
    name: 'empty polygon(points.length < 3)은 false를 반환한다',
    subject: polygon(p(0, 0), p(1, 0)),
    target: segment(0, 0, 1, 1),
    expected: false,
  },
  {
    name: 'zero-area polygon(collinear points)은 edge check에서 deterministic 결과를 반환한다',
    subject: polygon(p(0, 0), p(1, 0), p(2, 0)),
    target: segment(1, -1, 1, 1),
    expected: true,
  },
  {
    name: 'PolygonLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: squareArray,
    target: segment(2, -1, 2, 2),
    expected: true,
  },
];

const polygonRayCases: RelationCase<PolygonLike, RayLike>[] = [
  {
    name: 'ray origin이 polygon 내부에 있으면 true를 반환한다',
    subject: wideSquare,
    target: ray(3, 3, 1, 0),
    expected: true,
  },
  {
    name: 'ray 역방향에만 polygon이 있으면 false를 반환한다',
    subject: polygon(p(0, 0), p(2, 0), p(2, 2), p(0, 2)),
    target: ray(5, 1, 1, 0),
    expected: false,
  },
  {
    name: 'empty polygon은 false를 반환한다',
    subject: shortPolygon,
    target: ray(0, 0, 1, 0),
    expected: false,
  },
  {
    name: 'ray가 polygon boundary를 touch하면 true를 반환한다',
    subject: square,
    target: ray(-2, 2, 1, 0),
    expected: true,
  },
  {
    name: 'PolygonLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: polygonArray(p(0, 0), p(6, 0), p(6, 6), p(0, 6)),
    target: ray(3, 3, 1, 0),
    expected: true,
  },
];

const polygonInfiniteLineCases: RelationCase<PolygonLike, InfiniteLineLike>[] = [
  {
    name: 'infinite-line이 polygon을 가로지르면 true를 반환한다',
    subject: square,
    target: infiniteLine(0, 2, 1, 0),
    expected: true,
  },
  {
    name: 'infinite-line이 polygon과 평행하고 바깥에 있으면 false를 반환한다',
    subject: polygon(p(0, 0), p(2, 0), p(2, 2), p(0, 2)),
    target: infiniteLine(0, 5, 1, 0),
    expected: false,
  },
  {
    name: 'infinite-line이 polygon vertex를 touch하면 true를 반환한다',
    subject: polygon(p(0, 0), p(4, 0), p(2, 4)),
    target: infiniteLine(0, 0, 1, 0),
    expected: true,
  },
  {
    name: 'empty polygon은 false를 반환한다',
    subject: shortPolygon,
    target: infiniteLine(0, 0, 1, 0),
    expected: false,
  },
  {
    name: 'PolygonLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: squareArray,
    target: infiniteLine(0, 2, 1, 0),
    expected: true,
  },
];

const polygonPolylineCases: RelationCase<PolygonLike, PolylineLike>[] = [
  {
    name: 'polyline segment가 polygon edge를 가로지르면 true를 반환한다',
    subject: square,
    target: polyline(p(2, -1), p(2, 2)),
    expected: true,
  },
  {
    name: 'polyline이 polygon vertex를 touch하면 true를 반환한다',
    subject: square,
    target: polyline(p(4, 4), p(6, 6)),
    expected: true,
  },
  {
    name: 'polyline이 polygon boundary를 touch하면 true를 반환한다',
    subject: square,
    target: polyline(p(4, 2), p(6, 2)),
    expected: true,
  },
  {
    name: 'polyline 전체가 polygon 내부에 있으면 true를 반환한다',
    subject: square,
    target: polyline(p(1, 1), p(3, 1), p(3, 3)),
    expected: true,
  },
  {
    name: 'polyline 전체가 polygon 바깥에 있으면 false를 반환한다',
    subject: square,
    target: polyline(p(5, 0), p(7, 2)),
    expected: false,
  },
  {
    name: 'polyline segment가 polygon edge와 collinear overlap하면 true를 반환한다',
    subject: square,
    target: polyline(p(1, 0), p(3, 0)),
    expected: true,
  },
  {
    name: '두 endpoint가 polygon 바깥이지만 segment가 polygon edge와 collinear overlap하면 true를 반환한다',
    subject: polygon(p(2, 0), p(8, 0), p(8, 4), p(2, 4)),
    target: polyline(p(0, 0), p(10, 0)),
    expected: true,
  },
  {
    name: 'empty polygon(points.length < 3)은 false를 반환한다',
    subject: shortPolygon,
    target: polyline(p(0, 0), p(1, 1)),
    expected: false,
  },
  {
    name: 'empty polyline(points.length === 0)은 false를 반환한다',
    subject: square,
    target: polyline(),
    expected: false,
  },
  {
    name: 'single-point polyline이 polygon 내부에 있으면 true를 반환한다',
    subject: square,
    target: polyline(p(2, 2)),
    expected: true,
  },
  {
    name: 'single-point polyline이 polygon 바깥에 있으면 false를 반환한다',
    subject: square,
    target: polyline(p(10, 10)),
    expected: false,
  },
  {
    name: 'PolygonLike 배열 shorthand로 입력해도 동일한 결과를 반환한다',
    subject: squareArray,
    target: polylineArray(p(2, -1), p(2, 2)),
    expected: true,
  },
];

describe('intersectsPolylineSegment', () => {
  test.each(polylineSegmentCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolylineSegment(subject, target)).toBe(expected);
  });
});

describe('intersectsPolylineRay', () => {
  test.each(polylineRayCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolylineRay(subject, target)).toBe(expected);
  });
});

describe('intersectsPolylineInfiniteLine', () => {
  test.each(polylineInfiniteLineCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolylineInfiniteLine(subject, target)).toBe(expected);
  });
});

describe('intersectsPolygonSegment', () => {
  test.each(polygonSegmentCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolygonSegment(subject, target)).toBe(expected);
  });
});

describe('intersectsPolygonRay', () => {
  test.each(polygonRayCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolygonRay(subject, target)).toBe(expected);
  });
});

describe('intersectsPolygonInfiniteLine', () => {
  test.each(polygonInfiniteLineCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolygonInfiniteLine(subject, target)).toBe(expected);
  });
});

describe('intersectsPolygonPolyline', () => {
  test.each(polygonPolylineCases)('$name', ({ subject, target, expected }) => {
    expect(intersectsPolygonPolyline(subject, target)).toBe(expected);
  });
});
