/**
 * Root entry intersection/detail type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  AreaOverlapDetail,
  BoundsSweepDetail,
  CircleCircleDetail,
  CurveIntersectionHit,
  CurveIntersectionKind,
  CurveLike,
  EllipseEllipseDetail,
  LinePolygonIntersectionHit,
  LinePolygonOverlapIntervalDetail,
  MultiPointRelationDetail,
  OverlapIntervalDetail,
  PointRelationDetail,
  RelationDetailKind,
  SegmentSegmentDetail,
  TwoPointRelationDetail,
  VisibilityOptions,
  VisibilityRayHit,
} from '../../src/index';

function expectAssignable<T>(value: T): T {
  return value;
}

describe('root intersection type exposure 계약', () => {
  test('root entry가 curve intersection type을 노출한다', () => {
    expectAssignable<CurveLike>({
      kind: 'quadratic',
      p0: { x: 0, y: 0 },
      p1: { x: 50, y: 100 },
      p2: { x: 100, y: 0 },
    });
    expectAssignable<CurveLike>({
      kind: 'cubic',
      p0: { x: 0, y: 0 },
      p1: [10, 20] as const,
      p2: { x: 30, y: 40 },
      p3: { x: 100, y: 0 },
    });
    expectAssignable<CurveIntersectionKind>('cross');
    expectAssignable<CurveIntersectionKind>('touch');
    expectAssignable<CurveIntersectionHit>({
      x: 10,
      y: 20,
      kind: 'cross',
      tCurve: 0.5,
      tLine: 0.5,
    });
  });

  test('root entry가 relation detail result type을 노출한다', () => {
    expectAssignable<RelationDetailKind>('overlap');
    expectAssignable<PointRelationDetail>({ kind: 'point', point: { x: 5, y: 5 }, tA: 0.5, tB: 0.5 });
    expectAssignable<OverlapIntervalDetail>({
      kind: 'overlap',
      start: { x: 0, y: 0 },
      end: { x: 5, y: 0 },
      tA: [0, 0.5] as const,
      tB: [0, 1] as const,
    });
    expectAssignable<SegmentSegmentDetail>({ kind: 'none' });
    expectAssignable<TwoPointRelationDetail>({
      kind: 'two-point',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ] as const,
    });
    expectAssignable<AreaOverlapDetail>({ kind: 'contains' });
    expectAssignable<CircleCircleDetail>({ kind: 'none' });
    expectAssignable<CircleCircleDetail>({ kind: 'contains' });
    expectAssignable<RelationDetailKind>('multi-point');
    const multiPoint = expectAssignable<MultiPointRelationDetail>({
      kind: 'multi-point',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ] as const,
    });
    expectAssignable<EllipseEllipseDetail>({ kind: 'none' });
    expectAssignable<EllipseEllipseDetail>({ kind: 'overlap' });
    expectAssignable<EllipseEllipseDetail>(multiPoint);
  });

  test('root entry가 bounds sweep detail type을 노출한다', () => {
    expectAssignable<BoundsSweepDetail>({
      hit: false,
      time: Number.POSITIVE_INFINITY,
      normal: { x: 0, y: 0 },
      contact: { x: Number.NaN, y: Number.NaN },
      startOverlap: false,
    });
    expectAssignable<BoundsSweepDetail>({
      hit: true,
      time: 0.5,
      normal: { x: -1, y: 0 },
      contact: { x: 4, y: 2 },
      startOverlap: false,
    });
  });

  test('root entry가 line/polygon · visibility intersection type을 노출한다', () => {
    expectAssignable<LinePolygonIntersectionHit>({
      point: { x: 2, y: 0 },
      kind: 'cross',
      tLine: 0.5,
      tEdge: 0.5,
      edgeIndex: 0,
    });
    expectAssignable<LinePolygonOverlapIntervalDetail>({
      kind: 'overlap',
      start: { x: 0, y: 0 },
      end: { x: 4, y: 0 },
      tLineStart: 0,
      tLineEnd: 1,
      tEdgeStart: 0,
      tEdgeEnd: 1,
      edgeIndex: 0,
    });
    expectAssignable<VisibilityRayHit>({
      point: { x: 4, y: 4 },
      angle: Math.PI / 4,
      distance: 5,
      polygonIndex: 0,
      edgeIndex: 1,
    });
    expectAssignable<VisibilityOptions>({});
    expectAssignable<VisibilityOptions>({ epsilon: 1e-9, angleOffset: 1e-4 });
  });
});
