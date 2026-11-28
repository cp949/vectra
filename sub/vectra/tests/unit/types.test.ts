/** 공개 시뮬레이션과 교차 관계 결과의 타입 계약을 확인한다. */

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
  PointWritable,
  RelationDetailKind,
  SegmentSegmentDetail,
  TwoPointRelationDetail,
} from '../../src/types';

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
      point: PointWritable;
      tA: number;
      tB: number;
    }>().toMatchTypeOf<PointRelationDetail>();
  });

  test('OverlapIntervalDetail은 start/end 좌표와 readonly tuple parameter interval을 가진다', () => {
    expectTypeOf<{
      kind: 'overlap';
      start: PointWritable;
      end: PointWritable;
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
      points: readonly [PointWritable, PointWritable];
    }>().toMatchTypeOf<TwoPointRelationDetail>();
  });

  test('AreaOverlapDetail은 none/touch/overlap/contains 분기를 허용한다', () => {
    expectTypeOf<{ kind: 'none' }>().toMatchTypeOf<AreaOverlapDetail>();
    expectTypeOf<{ kind: 'touch'; points: readonly PointWritable[] }>().toMatchTypeOf<AreaOverlapDetail>();
    expectTypeOf<{ kind: 'overlap' }>().toMatchTypeOf<AreaOverlapDetail>();
    expectTypeOf<{ kind: 'contains' }>().toMatchTypeOf<AreaOverlapDetail>();
  });

  test('LinePolygonOverlapIntervalDetail은 구간 끝점/line·edge parameter/edgeIndex를 가진다', () => {
    expectTypeOf<{
      kind: 'overlap';
      start: PointWritable;
      end: PointWritable;
      tLineStart: number;
      tLineEnd: number;
      tEdgeStart: number;
      tEdgeEnd: number;
      edgeIndex: number;
    }>().toMatchTypeOf<LinePolygonOverlapIntervalDetail>();
  });
});
