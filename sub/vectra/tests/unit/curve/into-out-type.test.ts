/** 곡선 Into 함수의 평평한 도형 계약과 출력 타입 보존을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { arcBoundsInto } from '../../../src/curve/arc-bounds-into';
import { arcClosestPointInto } from '../../../src/curve/arc-closest-point-into';
import { arcPointAtTInto } from '../../../src/curve/arc-point-at-t-into';
import { arcPointAtLengthInto } from '../../../src/curve/arc-point-at-length-into';
import { arcMiddleInto } from '../../../src/curve/arc-middle-into';
import { arcNormalAtInto } from '../../../src/curve/arc-normal-at-into';
import { arcTangentAtInto } from '../../../src/curve/arc-tangent-at-into';
import { arcFlattenInto } from '../../../src/curve/arc-flatten-into';
import { arcSampleInto } from '../../../src/curve/arc-sample-into';
import { arcSplitAtInto } from '../../../src/curve/arc-split-at-into';
import { arcToCubicInto } from '../../../src/curve/arc-to-cubic-into';
import { bsplinePointAtTInto } from '../../../src/curve/bspline-point-at-t-into';
import { cardinalPointAtTInto } from '../../../src/curve/cardinal-point-at-t-into';
import { catmullRomPointAtTInto } from '../../../src/curve/catmull-rom-point-at-t-into';
import { cubicBoundsInto } from '../../../src/curve/cubic-bounds-into';
import { cubicPointAtTInto } from '../../../src/curve/cubic-point-at-t-into';
import { cubicDerivativeAtInto } from '../../../src/curve/cubic-derivative-at-into';
import { cubicSecondDerivativeAtInto } from '../../../src/curve/cubic-second-derivative-at-into';
import { cubicNormalAtInto } from '../../../src/curve/cubic-normal-at-into';
import { cubicTangentAtInto } from '../../../src/curve/cubic-tangent-at-into';
import { quadraticBoundsInto } from '../../../src/curve/quadratic-bounds-into';
import { quadraticPointAtTInto } from '../../../src/curve/quadratic-point-at-t-into';
import { quadraticDerivativeAtInto } from '../../../src/curve/quadratic-derivative-at-into';
import { quadraticNormalAtInto } from '../../../src/curve/quadratic-normal-at-into';
import { quadraticTangentAtInto } from '../../../src/curve/quadratic-tangent-at-into';
import { quadraticFlattenInto } from '../../../src/curve/quadratic-flatten-into';
import { quadraticHullInto } from '../../../src/curve/quadratic-hull-into';
import { quadraticSampleInto } from '../../../src/curve/quadratic-sample-into';
import { quadraticSpacedPointsInto } from '../../../src/curve/quadratic-spaced-points-into';
import { quadraticLookupTableInto } from '../../../src/curve/quadratic-lookup-table-into';
import { cubicFlattenInto } from '../../../src/curve/cubic-flatten-into';
import { cubicHullInto } from '../../../src/curve/cubic-hull-into';
import { cubicSampleInto } from '../../../src/curve/cubic-sample-into';
import { cubicSpacedPointsInto } from '../../../src/curve/cubic-spaced-points-into';
import { cubicLookupTableInto } from '../../../src/curve/cubic-lookup-table-into';
import { cubicChainFlattenInto } from '../../../src/curve/cubic-chain-flatten-into';
import { cubicPartInto } from '../../../src/curve/cubic-part-into';
import { quadraticPartInto } from '../../../src/curve/quadratic-part-into';
import { quadraticElevateToCubicInto } from '../../../src/curve/quadratic-elevate-to-cubic-into';
import { cubicSplitInto } from '../../../src/curve/cubic-split-into';
import { quadraticSplitInto } from '../../../src/curve/quadratic-split-into';
import { cubicToArcsInto } from '../../../src/curve/cubic-to-arcs-into';
import { cubicClosestPointInto } from '../../../src/curve/cubic-closest-point-into';
import { quadraticClosestPointInto } from '../../../src/curve/quadratic-closest-point-into';
import { curveFrenetFrameAtInto } from '../../../src/curve/curve-frenet-frame-at-into';
import { correctEndpointArcRadiiInto } from '../../../src/curve/correct-endpoint-arc-radii-into';
import { endpointArcToCenterInto } from '../../../src/curve/endpoint-arc-to-center-into';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import { cubicLineIntersectionsInto } from '../../../src/curve/cubic-line-intersections-into';
import { quadraticLineIntersectionsInto } from '../../../src/curve/quadratic-line-intersections-into';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import { bsplinePolylineInto } from '../../../src/curve/bspline-polyline-into';
import { cardinalPolylineInto } from '../../../src/curve/cardinal-polyline-into';
import { catmullRomPolylineInto } from '../../../src/curve/catmull-rom-polyline-into';
import { monotoneXPolylineInto } from '../../../src/curve/monotone-x-polyline-into';
import { monotoneYPolylineInto } from '../../../src/curve/monotone-y-polyline-into';
import { naturalSplinePolylineInto } from '../../../src/curve/natural-spline-polyline-into';
import { stepPolylineInto } from '../../../src/curve/step-polyline-into';
import { bsplinePathInto } from '../../../src/curve/bspline-path-into';
import { bumpXPathInto } from '../../../src/curve/bump-x-path-into';
import { bumpYPathInto } from '../../../src/curve/bump-y-path-into';
import { cardinalPathInto } from '../../../src/curve/cardinal-path-into';
import { catmullRomPathInto } from '../../../src/curve/catmull-rom-path-into';
import { monotoneXPathInto } from '../../../src/curve/monotone-x-path-into';
import { monotoneYPathInto } from '../../../src/curve/monotone-y-path-into';
import { naturalSplinePathInto } from '../../../src/curve/natural-spline-path-into';
import { stepBeforePathInto } from '../../../src/curve/step-before-path-into';
import { stepAfterPathInto } from '../../../src/curve/step-after-path-into';
import type {
  BoundsWritable,
  Point,
  PointWritable,
  CenterArcWritable,
  CubicCurveWritable,
  CubicCurve,
} from '../../../src/types/flat-shapes.internal';

import { stepPathInto } from '../../../src/curve/step-path-into';
import type { ArcCommand, CurveLookupEntry, IntersectionHit, PathCommand } from '../../../src/types';
import { makeCenterArc } from './arc-test-helpers';

const arc = makeCenterArc();
const point = { x: 1, y: 0 };
const controlPoints = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 3 },
];
const line = { ox: 0, oy: 0.25, dx: 1, dy: 0 };
const arcCommand: ArcCommand = { kind: 'arc', x: 1, y: 1, rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: true };

test('중심 원호 함수는 평평한 점과 경계 상자, 곡선 배열을 사용한다', () => {
  expectTypeOf(arcBoundsInto).parameter(0).toEqualTypeOf<BoundsWritable>();
  expectTypeOf(arcClosestPointInto).parameter(2).toEqualTypeOf<Point>();
  expectTypeOf(arcSampleInto).parameter(0).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(arcToCubicInto).returns.toEqualTypeOf<CubicCurveWritable[]>();
});

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class BoundsOutput {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class PointOutput {
  x = 0;
  y = 0;
  tag = 'keep';
}

test('arcBoundsInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new BoundsOutput();
  const result = arcBoundsInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<BoundsOutput>();
});

test('arcClosestPointInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcClosestPointInto(out, arc, { x: 2, y: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('pointAtTInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcPointAtTInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('pointAtLengthInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcPointAtLengthInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcMiddleInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcMiddleInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcNormalAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcNormalAtInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcTangentAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcTangentAtInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcFlattenInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = arcFlattenInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('arcSampleInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = arcSampleInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('arcSplitAtInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CenterArcWritable[] = [];
  const result = arcSplitAtInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CenterArcWritable[]>();
});

test('arcToCubicInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CubicCurveWritable[] = [];
  const result = arcToCubicInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicCurveWritable[]>();
});

test('B-Spline은 제어점 객체 배열을 받는다', () => {
  expectTypeOf(bsplinePointAtTInto).parameter(1).toEqualTypeOf<readonly Point[]>();
});

test('bsplinePointAtTInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = bsplinePointAtTInto(out, [point], 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cardinalPointAtTInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cardinalPointAtTInto(out, [point], 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('catmullRomPointAtTInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = catmullRomPointAtTInto(out, [point], 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('계단 경로는 점 객체 배열을 받는다', () => {
  expectTypeOf(stepPathInto).parameter(1).toEqualTypeOf<readonly Point[]>();
});

const cubic: CubicCurve = { kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 1, x3: 3, y3: 0 };
const quadratic = { kind: 'quadratic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 0 } as const;

test('삼차 베지어의 평가는 평평한 제어점 필드를 받는다', () => {
  expectTypeOf(cubicPointAtTInto).parameter(1).toEqualTypeOf<CubicCurve>();
});

test('cubicBoundsInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new BoundsOutput();
  const result = cubicBoundsInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<BoundsOutput>();
});

test('cubicPointAtTInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicPointAtTInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicDerivativeAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicDerivativeAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicSecondDerivativeAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicSecondDerivativeAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicNormalAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicNormalAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicTangentAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicTangentAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticBoundsInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new BoundsOutput();
  const result = quadraticBoundsInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<BoundsOutput>();
});

test('quadraticPointAtTInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticPointAtTInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticDerivativeAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticDerivativeAtInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticNormalAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticNormalAtInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticTangentAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticTangentAtInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('삼차 베지어 표본은 평평한 곡선 객체를 받는다', () => {
  expectTypeOf(cubicSampleInto).parameter(1).toEqualTypeOf<CubicCurve>();
});

test('quadraticFlattenInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticFlattenInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticHullInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticHullInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticSampleInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticSampleInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticSpacedPointsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticSpacedPointsInto(out, quadratic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticLookupTableInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CurveLookupEntry[] = [];
  const result = quadraticLookupTableInto(out, quadratic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CurveLookupEntry[]>();
});

test('cubicFlattenInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicFlattenInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicHullInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicHullInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicSampleInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicSampleInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicSpacedPointsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicSpacedPointsInto(out, cubic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicLookupTableInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CurveLookupEntry[] = [];
  const result = cubicLookupTableInto(out, cubic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CurveLookupEntry[]>();
});

test('cubicChainFlattenInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicChainFlattenInto(out, [point, point, point, point]);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('삼차 베지어의 부분 곡선은 평평한 곡선에 기록한다', () => {
  expectTypeOf(cubicPartInto).parameter(0).toEqualTypeOf<CubicCurveWritable>();
});

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class QuadraticOutput {
  readonly kind = 'quadratic';
  x0 = 0;
  y0 = 0;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class CubicOutput {
  readonly kind = 'cubic';
  x0 = 0;
  y0 = 0;
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  x3 = 0;
  y3 = 0;
  tag = 'keep';
}

test('cubicPartInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CubicOutput();
  const result = cubicPartInto(out, cubic, 0.2, 0.8);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicOutput>();
});

test('quadraticPartInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new QuadraticOutput();
  const result = quadraticPartInto(out, quadratic, 0.2, 0.8);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<QuadraticOutput>();
});

test('quadraticElevateToCubicInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CubicOutput();
  const result = quadraticElevateToCubicInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicOutput>();
});

test('cubicSplitInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CubicOutput();
  const result = cubicSplitInto(out, new CubicOutput(), cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicOutput>();
});

test('quadraticSplitInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new QuadraticOutput();
  const result = quadraticSplitInto(out, new QuadraticOutput(), quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<QuadraticOutput>();
});

test('cubicToArcsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CenterArcWritable[] = [];
  const result = cubicToArcsInto(out, { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CenterArcWritable[]>();
});

test('부분 곡선과 분할은 입력과 출력이 같은 곡선 객체여도 좌표를 보존한다', () => {
  const expectedPart = cubicPartInto(new CubicOutput(), cubic, 0.2, 0.8);
  const part = Object.assign(new CubicOutput(), cubic);
  expect(cubicPartInto(part, part, 0.2, 0.8)).toEqual(expectedPart);

  const expectedLeft = new QuadraticOutput();
  const expectedRight = new QuadraticOutput();
  quadraticSplitInto(expectedLeft, expectedRight, quadratic, 0.5);
  const left = Object.assign(new QuadraticOutput(), quadratic);
  const right = new QuadraticOutput();
  expect(quadraticSplitInto(left, right, left, 0.5)).toEqual(expectedLeft);
  expect(right).toEqual(expectedRight);
});

test('삼차 베지어 교차는 평평한 곡선 두 개를 받는다', () => {
  expectTypeOf(cubicCubicIntersectionsInto).parameter(1).toEqualTypeOf<CubicCurve>();
  expectTypeOf(cubicCubicIntersectionsInto).parameter(2).toEqualTypeOf<CubicCurve>();
});

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class FrameOutput {
  point = { x: 0, y: 0 };
  tangent = { x: 0, y: 0 };
  normal = { x: 0, y: 0 };
  curvature = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class RadiiOutput {
  rx = 0;
  ry = 0;
  tag = 'keep';
}

/** 출력의 구조적 하위 타입을 검증할 외부 객체. */
class CenterArcOutput {
  sweep = false;
  cx = 0;
  cy = 0;
  rx = 0;
  ry = 0;
  xRotation = 0;
  startAngle = 0;
  endAngle = 0;
  tag = 'keep';
}

test('cubicClosestPointInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicClosestPointInto(out, cubic, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticClosestPointInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticClosestPointInto(out, quadratic, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('curveFrenetFrameAtInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new FrameOutput();
  const result = curveFrenetFrameAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<FrameOutput>();
});

test('correctEndpointArcRadiiInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new RadiiOutput();
  const result = correctEndpointArcRadiiInto(out, point, arcCommand);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<RadiiOutput>();
});

test('endpointArcToCenterInto는 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CenterArcOutput();
  const result = endpointArcToCenterInto(out, point, arcCommand);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CenterArcOutput>();
});

test('cubicCubicIntersectionsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: IntersectionHit[] = [];
  const result = cubicCubicIntersectionsInto(out, cubic, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
});

test('quadraticCubicIntersectionsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: IntersectionHit[] = [];
  const result = quadraticCubicIntersectionsInto(out, quadratic, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
});

test('quadraticQuadraticIntersectionsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: IntersectionHit[] = [];
  const result = quadraticQuadraticIntersectionsInto(out, quadratic, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
});

test('cubicLineIntersectionsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: IntersectionHit[] = [];
  const result = cubicLineIntersectionsInto(out, cubic, line);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
});

test('quadraticLineIntersectionsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: IntersectionHit[] = [];
  const result = quadraticLineIntersectionsInto(out, quadratic, line);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
});

test('cubicSelfIntersectionsInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: IntersectionHit[] = [];
  const result = cubicSelfIntersectionsInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<IntersectionHit[]>();
});

test('bsplinePolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = bsplinePolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cardinalPolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cardinalPolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('catmullRomPolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = catmullRomPolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('monotoneXPolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = monotoneXPolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('monotoneYPolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = monotoneYPolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('naturalSplinePolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = naturalSplinePolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('stepPolylineInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = stepPolylineInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('bsplinePathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = bsplinePathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('bumpXPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = bumpXPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('bumpYPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = bumpYPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('cardinalPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = cardinalPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('catmullRomPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = catmullRomPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('monotoneXPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = monotoneXPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('monotoneYPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = monotoneYPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('naturalSplinePathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = naturalSplinePathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('stepBeforePathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = stepBeforePathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('stepAfterPathInto는 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PathCommand[] = [];
  const result = stepAfterPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});

test('stepPathInto는 명령 배열을 그대로 반환한다', () => {
  const out: PathCommand[] = [];
  const result = stepPathInto(out, controlPoints);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
});
