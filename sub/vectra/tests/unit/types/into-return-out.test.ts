/**
 * 배열을 채우는 curve·intersects Into의 반환값 테스트.
 *
 * 대상 함수:
 *  - curve : *IntersectionsInto 6종, bspline·cardinal·catmullRom PolylineInto
 *  - intersects : line·segment·ray × quadratic·cubic 교차 6종, curve facade 교차 4종
 *
 * 고정하는 계약:
 *  - 반환값은 입력 out과 같은 참조다 (ADR 0006).
 *  - 교차가 없거나 입력이 비어 일찍 끝나는 분기도 out을 반환한다.
 *  - 반환 타입은 out 배열 타입이다 (`void`가 아니다).
 *
 * polygon 교차 Into가 배열을 반환하는 규칙과 맞춘다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { bsplinePolylineInto } from '../../../src/curve/bspline-polyline-into';
import { cardinalPolylineInto } from '../../../src/curve/cardinal-polyline-into';
import { catmullRomPolylineInto } from '../../../src/curve/catmull-rom-polyline-into';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { cubicLineIntersectionsInto } from '../../../src/curve/cubic-line-intersections-into';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticLineIntersectionsInto } from '../../../src/curve/quadratic-line-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import { curveCurveIntersectionsInto } from '../../../src/intersects/curve-curve-intersections-into';
import { curveSelfIntersectionsInto } from '../../../src/intersects/curve-self-intersections-into';
import { infiniteLineCubicIntersectionsInto } from '../../../src/intersects/infinite-line-cubic-intersections-into';
import { infiniteLineQuadraticIntersectionsInto } from '../../../src/intersects/infinite-line-quadratic-intersections-into';
import { lineCurveIntersectionsInto } from '../../../src/intersects/line-curve-intersections-into';
import { rayCubicIntersectionsInto } from '../../../src/intersects/ray-cubic-intersections-into';
import { rayQuadraticIntersectionsInto } from '../../../src/intersects/ray-quadratic-intersections-into';
import { segmentCubicIntersectionsInto } from '../../../src/intersects/segment-cubic-intersections-into';
import { segmentCurveIntersectionsInto } from '../../../src/intersects/segment-curve-intersections-into';
import { segmentQuadraticIntersectionsInto } from '../../../src/intersects/segment-quadratic-intersections-into';
import type { CurveIntersectionHit, CurveLike, IntersectionHit, XYObjectWritable } from '../../../src/types';

// y = 0.5 직선은 이 곡선들을 가로지른다. y = 10 직선은 만나지 않는다.
const crossing = { origin: [0, 0.5], direction: [1, 0] } as const;
const missing = { origin: [0, 10], direction: [1, 0] } as const;
const degenerate = { origin: [0, 0.5], direction: [0, 0] } as const;
const segment = { a: [-1, 0.5], b: [3, 0.5] } as const;
const ray = { origin: [-1, 0.5], direction: [1, 0] } as const;

const quad: CurveLike = { kind: 'quadratic', p0: [0, 0], p1: [1, 2], p2: [2, 0] };
const cubic: CurveLike = { kind: 'cubic', p0: [0, 0], p1: [1, 2], p2: [2, 2], p3: [3, 0] };
const loop: CurveLike = { kind: 'cubic', p0: [0, 0], p1: [3, 3], p2: [-1, 3], p3: [2, 0] };

type HitCase = [name: string, call: (out: IntersectionHit[]) => IntersectionHit[]];
type FacadeCase = [name: string, call: (out: CurveIntersectionHit[]) => CurveIntersectionHit[]];
type PolylineCase = [name: string, call: (out: XYObjectWritable[]) => XYObjectWritable[]];

const controlPoints = [
  [0, 0],
  [1, 2],
  [2, 2],
  [3, 0],
  [4, 2],
] as const;

describe('curve·intersects 교차 Into는 out을 반환한다', () => {
  const hitCases: HitCase[] = [
    ['quadraticLine 교차', (out) => quadraticLineIntersectionsInto(out, [0, 0], [1, 2], [2, 0], crossing)],
    ['quadraticLine 교차 없음', (out) => quadraticLineIntersectionsInto(out, [0, 0], [1, 2], [2, 0], missing)],
    ['quadraticLine zero direction', (out) => quadraticLineIntersectionsInto(out, [0, 0], [1, 2], [2, 0], degenerate)],
    ['cubicLine 교차', (out) => cubicLineIntersectionsInto(out, [0, 0], [1, 2], [2, 2], [3, 0], crossing)],
    ['cubicLine zero direction', (out) => cubicLineIntersectionsInto(out, [0, 0], [1, 2], [2, 2], [3, 0], degenerate)],
    [
      'quadraticQuadratic',
      (out) => quadraticQuadraticIntersectionsInto(out, [0, 0], [1, 2], [2, 0], [0, 1], [1, -1], [2, 1]),
    ],
    [
      'quadraticCubic',
      (out) => quadraticCubicIntersectionsInto(out, [0, 0], [1, 2], [2, 0], [0, 1], [1, -1], [2, 2], [3, 0]),
    ],
    [
      'cubicCubic',
      (out) => cubicCubicIntersectionsInto(out, [0, 0], [1, 2], [2, 2], [3, 0], [0, 1], [1, -1], [2, 3], [3, 1]),
    ],
    ['cubicSelf', (out) => cubicSelfIntersectionsInto(out, [0, 0], [3, 3], [-1, 3], [2, 0])],
    ['infiniteLineQuadratic', (out) => infiniteLineQuadraticIntersectionsInto(out, crossing, [0, 0], [1, 2], [2, 0])],
    ['infiniteLineCubic', (out) => infiniteLineCubicIntersectionsInto(out, crossing, [0, 0], [1, 2], [2, 2], [3, 0])],
    ['segmentQuadratic', (out) => segmentQuadraticIntersectionsInto(out, segment, [0, 0], [1, 2], [2, 0])],
    ['segmentCubic', (out) => segmentCubicIntersectionsInto(out, segment, [0, 0], [1, 2], [2, 2], [3, 0])],
    ['rayQuadratic', (out) => rayQuadraticIntersectionsInto(out, ray, [0, 0], [1, 2], [2, 0])],
    ['rayCubic', (out) => rayCubicIntersectionsInto(out, ray, [0, 0], [1, 2], [2, 2], [3, 0])],
  ];

  test.each(hitCases)('%s', (_name, call) => {
    const out: IntersectionHit[] = [];
    const result = call(out);
    expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
    expect(result).toBe(out);
  });

  test('교차 있는 호출은 반환한 배열에 hit가 들어 있다', () => {
    const out: IntersectionHit[] = [];
    expect(quadraticLineIntersectionsInto(out, [0, 0], [1, 2], [2, 0], crossing)).toHaveLength(2);
  });

  test('교차 없는 호출은 이전 내용을 비운 out을 반환한다', () => {
    const out: IntersectionHit[] = [{ point: { x: 9, y: 9 }, kind: 'cross', tA: 0, tB: 0 }];
    expect(quadraticLineIntersectionsInto(out, [0, 0], [1, 2], [2, 0], missing)).toHaveLength(0);
    expect(out).toHaveLength(0);
  });
});

describe('curve facade 교차 Into는 out을 반환한다', () => {
  const facadeCases: FacadeCase[] = [
    ['curveCurve', (out) => curveCurveIntersectionsInto(out, quad, cubic)],
    ['curveSelf', (out) => curveSelfIntersectionsInto(out, loop)],
    ['lineCurve', (out) => lineCurveIntersectionsInto(out, crossing, quad)],
    ['segmentCurve', (out) => segmentCurveIntersectionsInto(out, segment, quad)],
  ];

  test.each(facadeCases)('%s', (_name, call) => {
    const out: CurveIntersectionHit[] = [];
    const result = call(out);
    expectTypeOf(result).toEqualTypeOf<CurveIntersectionHit[]>();
    expect(result).toBe(out);
  });
});

describe('spline polyline Into는 out을 반환한다', () => {
  const polylineCases: PolylineCase[] = [
    ['bspline', (out) => bsplinePolylineInto(out, controlPoints, 4)],
    ['cardinal', (out) => cardinalPolylineInto(out, controlPoints, 4)],
    ['catmullRom', (out) => catmullRomPolylineInto(out, controlPoints, 4)],
  ];

  test.each(polylineCases)('%s', (_name, call) => {
    const out: XYObjectWritable[] = [];
    const result = call(out);
    expectTypeOf(result).toEqualTypeOf<XYObjectWritable[]>();
    expect(result).toBe(out);
    expect(result.length).toBeGreaterThan(0);
  });

  test.each([
    ['bspline', bsplinePolylineInto],
    ['cardinal', cardinalPolylineInto],
    ['catmullRom', catmullRomPolylineInto],
  ] as const)('%s steps가 0이면 비운 out을 반환한다', (_name, into) => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = into(out, controlPoints, 0);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });

  test.each([
    ['bspline', bsplinePolylineInto],
    ['cardinal', cardinalPolylineInto],
    ['catmullRom', catmullRomPolylineInto],
  ] as const)('%s control point가 부족하면 비운 out을 반환한다', (_name, into) => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = into(out, [[0, 0]], 4);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });
});
