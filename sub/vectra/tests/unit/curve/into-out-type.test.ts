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
import type {
  BoundsWritable,
  Point,
  PointWritable,
  CenterArcWritable,
  CubicCurveWritable,
  CubicCurve,
} from '../../../src/types/flat-shapes.internal';

import { stepPathInto } from '../../../src/curve/step-path-into';
import type { CurveLookupEntry } from '../../../src/types';
import { makeCenterArc } from './arc-test-helpers';

const arc = makeCenterArc();
const arcPoint = { x: 1, y: 0 };

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

test('arcBoundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new BoundsOutput();
  const result = arcBoundsInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<BoundsOutput>();
});

test('arcClosestPointInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcClosestPointInto(out, arc, { x: 2, y: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcPointAtTInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcPointAtTInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcPointAtLengthInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcPointAtLengthInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcMiddleInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcMiddleInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcNormalAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcNormalAtInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcTangentAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = arcTangentAtInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('arcFlattenInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = arcFlattenInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('arcSampleInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = arcSampleInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('arcSplitAtInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CenterArcWritable[] = [];
  const result = arcSplitAtInto(out, arc, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CenterArcWritable[]>();
});

test('arcToCubicInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CubicCurveWritable[] = [];
  const result = arcToCubicInto(out, arc);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicCurveWritable[]>();
});

test('B-Spline은 제어점 객체 배열을 받는다', () => {
  expectTypeOf(bsplinePointAtTInto).parameter(1).toEqualTypeOf<readonly Point[]>();
});

test('bsplinePointAtTInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = bsplinePointAtTInto(out, [arcPoint], 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cardinalPointAtTInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cardinalPointAtTInto(out, [arcPoint], 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('catmullRomPointAtTInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = catmullRomPointAtTInto(out, [arcPoint], 0.5);
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

test('cubicBoundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new BoundsOutput();
  const result = cubicBoundsInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<BoundsOutput>();
});

test('cubicPointAtTInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicPointAtTInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicDerivativeAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicDerivativeAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicSecondDerivativeAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicSecondDerivativeAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicNormalAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicNormalAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('cubicTangentAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = cubicTangentAtInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticBoundsInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new BoundsOutput();
  const result = quadraticBoundsInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<BoundsOutput>();
});

test('quadraticPointAtTInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticPointAtTInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticDerivativeAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticDerivativeAtInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticNormalAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticNormalAtInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('quadraticTangentAtInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new PointOutput();
  const result = quadraticTangentAtInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointOutput>();
});

test('삼차 베지어 표본은 평평한 곡선 객체를 받는다', () => {
  expectTypeOf(cubicSampleInto).parameter(1).toEqualTypeOf<CubicCurve>();
});

test('quadraticFlattenInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticFlattenInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticHullInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticHullInto(out, quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticSampleInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticSampleInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticSpacedPointsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = quadraticSpacedPointsInto(out, quadratic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('quadraticLookupTableInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CurveLookupEntry[] = [];
  const result = quadraticLookupTableInto(out, quadratic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CurveLookupEntry[]>();
});

test('cubicFlattenInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicFlattenInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicHullInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicHullInto(out, cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicSampleInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicSampleInto(out, cubic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicSpacedPointsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicSpacedPointsInto(out, cubic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('cubicLookupTableInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: CurveLookupEntry[] = [];
  const result = cubicLookupTableInto(out, cubic, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CurveLookupEntry[]>();
});

test('cubicChainFlattenInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = cubicChainFlattenInto(out, [arcPoint, arcPoint, arcPoint, arcPoint]);
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

test('cubicPartInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CubicOutput();
  const result = cubicPartInto(out, cubic, 0.2, 0.8);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicOutput>();
});

test('quadraticPartInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new QuadraticOutput();
  const result = quadraticPartInto(out, quadratic, 0.2, 0.8);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<QuadraticOutput>();
});

test('quadraticElevateToCubicInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CubicOutput();
  const result = quadraticElevateToCubicInto(out, quadratic);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicOutput>();
});

test('cubicSplitInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new CubicOutput();
  const result = cubicSplitInto(out, new CubicOutput(), cubic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CubicOutput>();
});

test('quadraticSplitInto은 외부 클래스 출력의 참조와 반환 타입을 보존한다', () => {
  const out = new QuadraticOutput();
  const result = quadraticSplitInto(out, new QuadraticOutput(), quadratic, 0.5);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<QuadraticOutput>();
});

test('cubicToArcsInto은 고정 원소 타입으로 같은 출력 배열을 반환한다', () => {
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
