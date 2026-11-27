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
import type {
  BoundsWritable,
  Point,
  PointWritable,
  CenterArcWritable,
  CubicCurveWritable,
} from '../../../src/types/flat-shapes.internal';

import { stepPathInto } from '../../../src/curve/step-path-into';
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
