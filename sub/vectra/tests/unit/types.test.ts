import { describe, expectTypeOf, test } from 'vitest';
import type {
  CriticallyDampedOptions as RootCriticallyDampedOptions,
  SpringLerpOptions as RootSpringLerpOptions,
  SpringMotionResult as RootSpringMotionResult,
} from '../../src/index';
import type { CriticallyDampedOptions, SpringLerpOptions, SpringMotionResult } from '../../src/interpolation/types';
import type {
  AreaOverlapDetail,
  LinePolygonOverlapIntervalDetail,
  OverlapIntervalDetail,
  PointRelationDetail,
  RelationDetailKind,
  SegmentLike,
  SegmentSegmentDetail,
  SegmentWritable,
  TwoPointRelationDetail,
  XYInput,
  XYObjectWritable,
  XYTupleWritable,
  XYWritable,
} from '../../src/types';

describe('structural public types', () => {
  // 입력 union 계약: 좌표 입력은 readonly object와 readonly tuple을 모두 허용한다.
  test('XYInput은 object와 tuple 좌표 입력을 허용한다', () => {
    expectTypeOf<{ readonly x: number; readonly y: number }>().toMatchTypeOf<XYInput>();
    expectTypeOf<readonly [number, number]>().toMatchTypeOf<XYInput>();
  });

  // writable 좌표 계약: mutable object/tuple은 허용, readonly tuple은 거부한다.
  // (대표 contract — XYObjectWritable/XYTupleWritable shape별 반복은 이 한 케이스로 대표한다.)
  test('XYWritable은 mutable object/tuple을 허용하고 readonly tuple을 거부한다', () => {
    expectTypeOf<{ x: number; y: number }>().toMatchTypeOf<XYWritable>();
    expectTypeOf<[number, number]>().toMatchTypeOf<XYWritable>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<XYWritable>();
  });

  // generic storage 계약: shape writable은 좌표 storage 타입 파라미터를 그대로 전파한다.
  // (Segment를 대표로 검증 — Bounds/Circle/Polyline/Polygon 동일 패턴은 생략한다.)
  test('SegmentWritable은 generic 좌표 storage를 필드 타입으로 전파한다', () => {
    expectTypeOf<[number, number]>().toMatchTypeOf<SegmentWritable<XYTupleWritable>['a']>();
    expectTypeOf<readonly [number, number]>().not.toMatchTypeOf<SegmentWritable<XYWritable>['a']>();
  });

  // 입력 shape 계약: *Like 입력 타입은 object 형태와 tuple 형태를 모두 허용한다.
  // (Segment를 대표로 검증 — Bounds/Capsule/Circle/Rect/Polyline/Polygon/Matrix Like 군은 생략한다.)
  test('SegmentLike는 object와 tuple 입력 shape를 모두 허용한다', () => {
    expectTypeOf<{ readonly a: XYInput; readonly b: XYInput }>().toMatchTypeOf<SegmentLike>();
    expectTypeOf<readonly [XYInput, XYInput]>().toMatchTypeOf<SegmentLike>();
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
