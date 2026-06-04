/**
 * Root entry geometry type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  BarycentricLike,
  BarycentricWritable,
  BoundsLike,
  BoundsObjectLike,
  BoundsTuple,
  CapsuleLike,
  CapsuleObjectLike,
  CapsuleTuple,
  CapsuleWritable,
  CircleLike,
  CircleObjectLike,
  CircleTuple,
  CircleWritable,
  EllipseLike,
  EllipseObjectLike,
  EllipseTuple,
  EllipseWritable,
  FitOptions,
  GridCellLike,
  GridCellObjectLike,
  GridCellTuple,
  GridCellWritable,
  GridSpecLike,
  InfiniteLineLike,
  InfiniteLineObjectLike,
  InfiniteLineTuple,
  InfiniteLineWritable,
  MatrixDecompositionWritable,
  MatrixLike,
  MatrixObjectLike,
  MatrixToPoseOptions,
  MatrixTuple,
  MatrixWritable,
  OrientedBoundsWritable,
  PolygonLike,
  PolygonObjectLike,
  PolygonWritable,
  PolylineConcatOptions,
  PolylineLike,
  PolylineObjectLike,
  PolylineSubdivideOptions,
  PolylineWritable,
  PoseApproxEqualsOptions,
  PoseDistanceOptions,
  PrincipalDirections,
  PrincipalDirectionsWritable,
  RayLike,
  RayObjectLike,
  RayTuple,
  RayWritable,
  RectAlignAnchor,
  RectAlignOptions,
  RotatedEllipseLike,
  RotatedEllipseObjectLike,
  RotatedEllipseTuple,
  RotatedEllipseWritable,
  Sdf2,
  SegmentLike,
  SegmentObjectLike,
  SegmentSplit,
  SegmentSplitWritable,
  SegmentTuple,
  SegmentWritable,
  TriangleLike,
  TriangleObjectLike,
  TriangleTuple,
  TriangleWritable,
} from '../../src/index';

function expectAssignable<T>(value: T): T {
  return value;
}

describe('root geometry type exposure 계약', () => {
  test('root entry가 circle type을 노출한다', () => {
    const circleObject = expectAssignable<CircleObjectLike>({ center: { x: 0, y: 0 }, radius: 1 });
    expectAssignable<CircleLike>(circleObject);
    expectAssignable<CircleTuple>([[0, 0] as const, 1] as const);
    expectAssignable<CircleWritable>({ center: { x: 0, y: 0 }, radius: 1 });
  });

  test('root entry가 bounds type을 노출한다', () => {
    const boundsObject = expectAssignable<BoundsObjectLike>({ min: { x: 0, y: 0 }, max: [1, 1] as const });
    expectAssignable<BoundsLike>(boundsObject);
    expectAssignable<BoundsTuple>([{ x: 0, y: 0 }, [1, 1] as const] as const);
  });

  test('root entry가 capsule type을 노출한다', () => {
    const capsuleObject = expectAssignable<CapsuleObjectLike>({
      a: { x: 0, y: 0 },
      b: [1, 1] as const,
      radius: 2,
    });
    expectAssignable<CapsuleLike>(capsuleObject);
    expectAssignable<CapsuleTuple>([{ x: 0, y: 0 }, [1, 1] as const, 2] as const);
    expectAssignable<CapsuleWritable>({ a: { x: 0, y: 0 }, b: { x: 1, y: 1 }, radius: 2 });
    expectAssignable<CapsuleWritable<[number, number], [number, number]>>({ a: [0, 0], b: [1, 1], radius: 2 });
  });

  test('root entry가 grid cell/spec type을 노출한다', () => {
    const cellObject = expectAssignable<GridCellObjectLike>({ col: 1, row: 2 });
    expectAssignable<GridCellLike>(cellObject);
    expectAssignable<GridCellTuple>([1, 2] as const);
    expectAssignable<GridCellWritable>({ col: 0, row: 0 });
    expectAssignable<GridSpecLike>({ cellSize: 10 });
    expectAssignable<GridSpecLike>({ origin: [0, 0] as const, cellSize: { x: 10, y: 20 } });
  });

  test('root entry가 polyline type을 노출한다', () => {
    const points = [{ x: 0, y: 0 }, [1, 1] as const] as const;
    const polylineObject = expectAssignable<PolylineObjectLike>({ points });
    expectAssignable<PolylineLike>(polylineObject);
    expectAssignable<PolylineLike>(points);
    expectAssignable<PolylineWritable>({ points: [{ x: 0, y: 0 }] });
    expectAssignable<PolylineSubdivideOptions>({ segmentsPerSegment: 2 });
    expectAssignable<PolylineConcatOptions>({ weldTolerance: 0.5 });
    expectAssignable<PolylineConcatOptions>({});
  });

  test('root entry가 polygon type을 노출한다', () => {
    const points = [{ x: 0, y: 0 }, [1, 1] as const] as const;
    const polygonObject = expectAssignable<PolygonObjectLike>({ points });
    expectAssignable<PolygonLike>(polygonObject);
    expectAssignable<PolygonLike>(points);
    expectAssignable<PolygonWritable>({ points: [{ x: 0, y: 0 }] });
  });

  test('root entry가 segment type을 노출한다', () => {
    const lineObject = expectAssignable<SegmentObjectLike>({ a: { x: 0, y: 0 }, b: [1, 1] as const });
    expectAssignable<SegmentLike>(lineObject);
    expectAssignable<SegmentTuple>([{ x: 0, y: 0 }, [1, 1] as const] as const);
    const lineW = expectAssignable<SegmentWritable<{ x: number; y: number }, [number, number]>>({
      a: { x: 0, y: 0 },
      b: [1, 1],
    });
    expectAssignable<SegmentSplitWritable<typeof lineW, SegmentWritable>>({
      left: lineW,
      right: { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } },
    });
    expectAssignable<SegmentSplit>({
      left: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } },
      right: { a: { x: 1, y: 1 }, b: { x: 2, y: 2 } },
    });
  });

  test('root entry가 triangle type을 노출한다', () => {
    const triangleObject = expectAssignable<TriangleObjectLike>({
      a: { x: 0, y: 0 },
      b: { x: 1, y: 0 },
      c: { x: 0, y: 1 },
    });
    expectAssignable<TriangleLike>(triangleObject);
    expectAssignable<TriangleTuple>([{ x: 0, y: 0 }, [1, 0] as const, [0, 1] as const] as const);
    expectAssignable<TriangleWritable>({
      a: { x: 0, y: 0 },
      b: { x: 1, y: 0 },
      c: { x: 0, y: 1 },
    });
  });

  test('root entry가 barycentric type을 노출한다', () => {
    const bary = expectAssignable<BarycentricLike>({ x: 0.25, y: 0.25, w: 0.5 });
    expectAssignable<BarycentricLike>(bary);
    const writable = expectAssignable<BarycentricWritable>({ x: 0.25, y: 0.25, w: 0.5 });
    // BarycentricWritable은 BarycentricLike에 할당 가능하다.
    expectAssignable<BarycentricLike>(writable);
  });

  test('root entry가 ellipse type을 노출한다', () => {
    const ellipseObject = expectAssignable<EllipseObjectLike>({
      center: { x: 0, y: 0 },
      radiusX: 2,
      radiusY: 1,
    });
    expectAssignable<EllipseLike>(ellipseObject);
    expectAssignable<EllipseTuple>([{ x: 0, y: 0 } as const, 2, 1] as const);
    expectAssignable<EllipseWritable>({ center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1 });
  });

  test('root entry가 rotated ellipse type을 노출한다', () => {
    const rotatedObject = expectAssignable<RotatedEllipseObjectLike>({
      center: { x: 0, y: 0 },
      radiusX: 2,
      radiusY: 1,
      rotation: Math.PI / 4,
    });
    expectAssignable<RotatedEllipseLike>(rotatedObject);
    expectAssignable<RotatedEllipseTuple>([{ x: 0, y: 0 } as const, 2, 1, Math.PI / 4] as const);
    expectAssignable<RotatedEllipseWritable>({ center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1, rotation: 0 });
  });

  test('root entry가 ray type을 노출한다', () => {
    const rayObject = expectAssignable<RayObjectLike>({
      origin: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
    });
    expectAssignable<RayLike>(rayObject);
    expectAssignable<RayTuple>([0, 0, 1, 0] as const);
    expectAssignable<RayWritable>({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } });
  });

  test('root entry가 rect alignment type을 노출한다', () => {
    const anchor = expectAssignable<RectAlignAnchor>('bottom-right');
    expectAssignable<RectAlignOptions>({ anchor });
    expectAssignable<RectAlignOptions>({});
  });

  test('root entry가 matrixToPose 옵션 type을 노출한다', () => {
    expectAssignable<MatrixToPoseOptions>({ epsilon: 1e-6 });
    expectAssignable<MatrixToPoseOptions>({});
  });

  test('root entry가 poseApproxEquals 옵션 type을 노출한다', () => {
    expectAssignable<PoseApproxEqualsOptions>({ positionEpsilon: 1e-6, angleEpsilon: 1e-6 });
    expectAssignable<PoseApproxEqualsOptions>({});
  });

  test('root entry가 poseDistance 옵션 type을 노출한다', () => {
    expectAssignable<PoseDistanceOptions>({ angularWeight: 2 });
    expectAssignable<PoseDistanceOptions>({});
  });

  test('root entry가 infinite-line type을 노출한다', () => {
    const lineObject = expectAssignable<InfiniteLineObjectLike>({
      origin: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
    });
    expectAssignable<InfiniteLineLike>(lineObject);
    expectAssignable<InfiniteLineTuple>([{ x: 0, y: 0 }, [1, 0] as const] as const);
    expectAssignable<InfiniteLineWritable>({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } });
  });

  test('root entry가 Sdf2 callable type을 노출한다', () => {
    const field = expectAssignable<Sdf2>((_point) => 0);
    expectAssignable<Sdf2>(field);
    expectAssignable<number>(field({ x: 0, y: 0 }));
    expectAssignable<number>(field([1, 2] as const));
  });

  test('root entry가 fitting type을 노출한다', () => {
    expectAssignable<FitOptions>({});
    expectAssignable<FitOptions>({ epsilon: 1e-9 });
    const directions = expectAssignable<PrincipalDirections>({
      primary: { x: 1, y: 0 },
      secondary: { x: 0, y: 1 },
    });
    expectAssignable<number>(directions.primary.x);
    expectAssignable<PrincipalDirectionsWritable>({
      primary: { x: 0, y: 0 },
      secondary: { x: 0, y: 0 },
    });
  });

  test('root entry가 matrix shape helper type을 노출한다', () => {
    const matrixObject = expectAssignable<MatrixObjectLike>({ a: 1, b: 0, c: 0, d: 1, tx: 2, ty: 3 });
    expectAssignable<MatrixLike>(matrixObject);
    expectAssignable<MatrixTuple>([1, 0, 0, 1, 2, 3] as const);
    expectAssignable<MatrixWritable>({ a: 1, b: 0, c: 0, d: 1, tx: 2, ty: 3 });
    expectAssignable<MatrixDecompositionWritable>({
      translation: { x: 2, y: 3 },
      scaling: { x: 1, y: 1 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    });
    expectAssignable<OrientedBoundsWritable>({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 1, y: 0 },
      bottomRight: { x: 1, y: 1 },
      bottomLeft: { x: 0, y: 1 },
    });
    expectAssignable<OrientedBoundsWritable<[number, number]>>({
      topLeft: [0, 0],
      topRight: [1, 0],
      bottomRight: [1, 1],
      bottomLeft: [0, 1],
    });
  });
});
