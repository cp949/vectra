import { describe, expectTypeOf, test } from 'vitest';
import type {
  CriticallyDampedOptions as RootCriticallyDampedOptions,
  SpringLerpOptions as RootSpringLerpOptions,
  SpringMotionResult as RootSpringMotionResult,
} from '../../src/index';
import type { CriticallyDampedOptions, SpringLerpOptions, SpringMotionResult } from '../../src/interpolation/types';
import type {
  AreaOverlapDetail,
  BoundsLike,
  BoundsObjectLike,
  BoundsTuple,
  BoundsWritable,
  CapsuleLike,
  CapsuleObjectLike,
  CapsuleTuple,
  CapsuleWritable,
  CardinalTangentOptions,
  CircleLike,
  CircleObjectLike,
  CircleTuple,
  CircleWritable,
  LinePolygonOverlapIntervalDetail,
  MatrixLike,
  MatrixObjectLike,
  MatrixTuple,
  MatrixWritable,
  OverlapIntervalDetail,
  PointRelationDetail,
  PolygonLike,
  PolygonObjectLike,
  PolygonWritable,
  PolylineLike,
  PolylineObjectLike,
  PolylineWritable,
  RectLike,
  RectObjectLike,
  RectTuple,
  RelationDetailKind,
  SampleTableOptions,
  SegmentLike,
  SegmentObjectLike,
  SegmentSegmentDetail,
  SegmentWritable,
  TwoPointRelationDetail,
  XYInput,
  XYObjectWritable,
  XYTupleWritable,
  XYWritable,
} from '../../src/types';

describe('structural public types', () => {
  test('accepts object and tuple coordinate inputs', () => {
    expectTypeOf<{ readonly x: number; readonly y: number }>().toMatchTypeOf<XYInput>();
    expectTypeOf<readonly [number, number]>().toMatchTypeOf<XYInput>();
  });

  test('XYObjectWritable는 x, y field object를 허용한다', () => {
    expectTypeOf<{ x: number; y: number }>().toMatchTypeOf<XYObjectWritable>();
    expectTypeOf<{ x: number; y: number }>().toMatchTypeOf<XYWritable>();
  });

  test('XYTupleWritable는 mutable tuple을 허용한다', () => {
    expectTypeOf<[number, number]>().toMatchTypeOf<XYTupleWritable>();
    expectTypeOf<[number, number]>().toMatchTypeOf<XYWritable>();
  });

  test('readonly tuple은 XYTupleWritable에 할당되지 않는다', () => {
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<XYTupleWritable>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<XYWritable>();
  });

  test('number[] 배열은 XYTupleWritable에 할당되지 않는다', () => {
    expectTypeOf<number[]>().not.toMatchTypeOf<XYTupleWritable>();
  });

  test('shape writable은 generic 좌표 storage로 mutable tuple을 허용한다', () => {
    expectTypeOf<[number, number]>().toMatchTypeOf<SegmentWritable<XYTupleWritable>['a']>();
    expectTypeOf<[number, number]>().toMatchTypeOf<BoundsWritable<XYTupleWritable>['min']>();
    expectTypeOf<[number, number]>().toMatchTypeOf<CircleWritable<XYTupleWritable>['center']>();
    expectTypeOf<[number, number]>().toMatchTypeOf<PolylineWritable<XYTupleWritable>['points'][number]>();
    expectTypeOf<[number, number]>().toMatchTypeOf<PolygonWritable<XYTupleWritable>['points'][number]>();
  });

  test('readonly tuple은 shape writable 내부 좌표 필드에 할당되지 않는다', () => {
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<SegmentWritable<XYWritable>['a']>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<BoundsWritable<XYWritable>['min']>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<CircleWritable<XYWritable>['center']>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<PolylineWritable<XYWritable>['points'][number]>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<PolygonWritable<XYWritable>['points'][number]>();
  });

  test('defines MVP writable and shape inputs', () => {
    expectTypeOf<{ readonly a: XYInput; readonly b: XYInput }>().toMatchTypeOf<SegmentObjectLike>();
    expectTypeOf<{ readonly a: XYInput; readonly b: XYInput }>().toMatchTypeOf<SegmentLike>();
    expectTypeOf<readonly [XYInput, XYInput]>().toMatchTypeOf<SegmentLike>();
    expectTypeOf<{ readonly min: XYInput; readonly max: XYInput }>().toMatchTypeOf<BoundsObjectLike>();
    expectTypeOf<readonly [XYInput, XYInput]>().toMatchTypeOf<BoundsTuple>();
    expectTypeOf<readonly [XYInput, XYInput]>().toMatchTypeOf<BoundsLike>();
    expectTypeOf<readonly [XYInput, XYInput, number]>().toMatchTypeOf<CapsuleTuple>();
    expectTypeOf<{
      readonly a: XYInput;
      readonly b: XYInput;
      readonly radius: number;
    }>().toMatchTypeOf<CapsuleObjectLike>();
    expectTypeOf<readonly [XYInput, XYInput, number]>().toMatchTypeOf<CapsuleLike>();
    expectTypeOf<{ readonly a: XYInput; readonly b: XYInput; readonly radius: number }>().toMatchTypeOf<CapsuleLike>();
    expectTypeOf<{ a: [number, number]; b: [number, number]; radius: number }>().toMatchTypeOf<
      CapsuleWritable<XYTupleWritable, XYTupleWritable>
    >();
    expectTypeOf<readonly [XYInput, number]>().toMatchTypeOf<CircleTuple>();
    expectTypeOf<{ readonly center: XYInput; readonly radius: number }>().toMatchTypeOf<CircleObjectLike>();
    expectTypeOf<readonly [XYInput, number]>().toMatchTypeOf<CircleLike>();
    expectTypeOf<{
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
    }>().toMatchTypeOf<RectObjectLike>();
    expectTypeOf<{
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
    }>().toMatchTypeOf<RectLike>();
    expectTypeOf<readonly [number, number, number, number]>().toMatchTypeOf<RectTuple>();
    expectTypeOf<readonly [number, number, number, number]>().toMatchTypeOf<RectLike>();
    expectTypeOf<{ readonly min: XYInput; readonly max: XYInput }>().toMatchTypeOf<BoundsLike>();
    expectTypeOf<{ readonly points: readonly XYInput[] }>().toMatchTypeOf<PolylineObjectLike>();
    expectTypeOf<{ readonly points: readonly XYInput[] }>().toMatchTypeOf<PolylineLike>();
    expectTypeOf<readonly XYInput[]>().toMatchTypeOf<PolylineLike>();
    expectTypeOf<{ readonly points: readonly XYInput[] }>().toMatchTypeOf<PolygonObjectLike>();
    expectTypeOf<{ readonly points: readonly XYInput[] }>().toMatchTypeOf<PolygonLike>();
    expectTypeOf<readonly XYInput[]>().toMatchTypeOf<PolygonLike>();
    expectTypeOf<{ readonly center: XYInput; readonly radius: number }>().toMatchTypeOf<CircleLike>();
    expectTypeOf<readonly [XYInput, XYInput]>().not.toMatchTypeOf<RectLike>();
    expectTypeOf<readonly [XYInput, number]>().not.toMatchTypeOf<BoundsLike>();
    expectTypeOf<readonly [XYInput, XYInput]>().not.toMatchTypeOf<CapsuleLike>();
    expectTypeOf<readonly [XYInput, number]>().not.toMatchTypeOf<CapsuleLike>();
    expectTypeOf<readonly [XYInput, XYInput]>().not.toMatchTypeOf<CircleLike>();
    expectTypeOf<{
      readonly a: number;
      readonly b: number;
      readonly c: number;
      readonly d: number;
      readonly tx: number;
      readonly ty: number;
    }>().toMatchTypeOf<MatrixObjectLike>();
    expectTypeOf<{
      readonly a: number;
      readonly b: number;
      readonly c: number;
      readonly d: number;
      readonly tx: number;
      readonly ty: number;
    }>().toMatchTypeOf<MatrixLike>();
    expectTypeOf<readonly [number, number, number, number, number, number]>().toMatchTypeOf<MatrixTuple>();
    expectTypeOf<readonly [number, number, number, number, number, number]>().toMatchTypeOf<MatrixLike>();
  });

  test('MatrixWritable은 mutable 6-component object를 허용한다', () => {
    expectTypeOf<{
      a: number;
      b: number;
      c: number;
      d: number;
      tx: number;
      ty: number;
    }>().toMatchTypeOf<MatrixWritable>();
  });

  test('CardinalTangentOptions는 선택적 tension을 허용한다', () => {
    expectTypeOf<{ tension: number }>().toMatchTypeOf<CardinalTangentOptions>();
    expectTypeOf<{ tension?: number }>().toMatchTypeOf<CardinalTangentOptions>();
  });

  test('SampleTableOptions는 선택적 interpolation과 extrapolate를 허용한다', () => {
    expectTypeOf<{ interpolation: 'linear' }>().toMatchTypeOf<SampleTableOptions>();
    expectTypeOf<{ interpolation: 'nearest' }>().toMatchTypeOf<SampleTableOptions>();
    expectTypeOf<{ extrapolate: boolean }>().toMatchTypeOf<SampleTableOptions>();
    expectTypeOf<{ interpolation?: 'linear'; extrapolate?: boolean }>().toMatchTypeOf<SampleTableOptions>();
  });
});

describe('interpolation deterministic simulation types', () => {
  test('SpringMotionResult는 value/velocity number field를 가진다', () => {
    expectTypeOf<{ value: number; velocity: number }>().toMatchTypeOf<SpringMotionResult>();
  });

  test('CriticallyDampedOptions는 선택적 angularFrequency를 허용한다', () => {
    expectTypeOf<{ angularFrequency: number }>().toMatchTypeOf<CriticallyDampedOptions>();
    expectTypeOf<{ angularFrequency?: number }>().toMatchTypeOf<CriticallyDampedOptions>();
    expectTypeOf<Record<string, never>>().toMatchTypeOf<CriticallyDampedOptions>();
  });

  test('SpringLerpOptions는 선택적 angularFrequency와 dampingRatio를 허용한다', () => {
    expectTypeOf<{ angularFrequency: number; dampingRatio: number }>().toMatchTypeOf<SpringLerpOptions>();
    expectTypeOf<{ dampingRatio?: number }>().toMatchTypeOf<SpringLerpOptions>();
    expectTypeOf<Record<string, never>>().toMatchTypeOf<SpringLerpOptions>();
  });

  test('root entry에서 interpolation motion type을 노출한다', () => {
    expectTypeOf<RootSpringMotionResult>().toEqualTypeOf<SpringMotionResult>();
    expectTypeOf<RootCriticallyDampedOptions>().toEqualTypeOf<CriticallyDampedOptions>();
    expectTypeOf<RootSpringLerpOptions>().toEqualTypeOf<SpringLerpOptions>();
  });
});

describe('relation detail result types', () => {
  test('RelationDetailKind는 모든 relation detail discriminant를 포함한다', () => {
    expectTypeOf<'none'>().toMatchTypeOf<RelationDetailKind>();
    expectTypeOf<'point'>().toMatchTypeOf<RelationDetailKind>();
    expectTypeOf<'overlap'>().toMatchTypeOf<RelationDetailKind>();
    expectTypeOf<'two-point'>().toMatchTypeOf<RelationDetailKind>();
    expectTypeOf<'touch'>().toMatchTypeOf<RelationDetailKind>();
    expectTypeOf<'contains'>().toMatchTypeOf<RelationDetailKind>();
  });

  test('PointRelationDetail은 point 좌표와 두 parameter를 가진다', () => {
    expectTypeOf<{
      kind: 'point';
      point: XYObjectWritable;
      tA: number;
      tB: number;
    }>().toMatchTypeOf<PointRelationDetail>();
  });

  test('OverlapIntervalDetail은 start/end 좌표와 readonly tuple parameter interval을 가진다', () => {
    expectTypeOf<{
      kind: 'overlap';
      start: XYObjectWritable;
      end: XYObjectWritable;
      tA: readonly [number, number];
      tB: readonly [number, number];
    }>().toMatchTypeOf<OverlapIntervalDetail>();
  });

  test('SegmentSegmentDetail은 none/point/overlap 분기를 허용한다', () => {
    expectTypeOf<{ kind: 'none' }>().toMatchTypeOf<SegmentSegmentDetail>();
    expectTypeOf<PointRelationDetail>().toMatchTypeOf<SegmentSegmentDetail>();
    expectTypeOf<OverlapIntervalDetail>().toMatchTypeOf<SegmentSegmentDetail>();
  });

  test('TwoPointRelationDetail은 두 점 tuple을 가진다', () => {
    expectTypeOf<{
      kind: 'two-point';
      points: readonly [XYObjectWritable, XYObjectWritable];
    }>().toMatchTypeOf<TwoPointRelationDetail>();
  });

  test('AreaOverlapDetail은 none/touch/overlap/contains 분기를 허용한다', () => {
    expectTypeOf<{ kind: 'none' }>().toMatchTypeOf<AreaOverlapDetail>();
    expectTypeOf<{ kind: 'touch'; points: readonly XYObjectWritable[] }>().toMatchTypeOf<AreaOverlapDetail>();
    expectTypeOf<{ kind: 'overlap' }>().toMatchTypeOf<AreaOverlapDetail>();
    expectTypeOf<{ kind: 'contains' }>().toMatchTypeOf<AreaOverlapDetail>();
  });

  test('LinePolygonOverlapIntervalDetail은 구간 끝점/line·edge parameter/edgeIndex를 가진다', () => {
    expectTypeOf<{
      kind: 'overlap';
      start: XYObjectWritable;
      end: XYObjectWritable;
      tLineStart: number;
      tLineEnd: number;
      tEdgeStart: number;
      tEdgeEnd: number;
      edgeIndex: number;
    }>().toMatchTypeOf<LinePolygonOverlapIntervalDetail>();
  });
});
