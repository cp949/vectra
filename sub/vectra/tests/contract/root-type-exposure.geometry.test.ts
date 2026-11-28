/**
 * Root entry geometry type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  BarycentricLike,
  BarycentricWritable,
  Bounds,
  BoundsWritable,
  Capsule,
  CapsuleWritable,
  Circle,
  CircleWritable,
  Ellipse,
  EllipseWritable,
  FitOptions,
  GridCell,
  GridCellWritable,
  GridSpec,
  InfiniteLine,
  InfiniteLineWritable,
  Matrix,
  MatrixDecompositionWritable,
  MatrixToPoseOptions,
  MatrixWritable,
  OrientedBoundsWritable,
  Polygon,
  PolygonWritable,
  Polyline,
  PolylineConcatOptions,
  PolylineSubdivideOptions,
  PolylineWritable,
  PoseApproxEqualsOptions,
  PoseDistanceOptions,
  PrincipalDirections,
  PrincipalDirectionsWritable,
  Ray,
  RayWritable,
  RectAlignAnchor,
  RectAlignOptions,
  RotatedEllipse,
  RotatedEllipseWritable,
  Sdf2,
  Segment,
  SegmentSplit,
  SegmentSplitWritable,
  SegmentWritable,
  Triangle,
  TriangleWritable,
} from '../../src/index';

/** 공개 타입에 값을 할당할 수 있는지 확인한다. */
function expectAssignable<T>(value: T): T {
  return value;
}

describe('root geometry type exposure 계약', () => {
  test('root entry가 circle type을 노출한다', () => {
    expectAssignable<Circle>({ cx: 0, cy: 0, r: 1 });
    expectAssignable<CircleWritable>({ cx: 0, cy: 0, r: 1 });
  });

  test('root entry가 bounds type을 노출한다', () => {
    expectAssignable<Bounds>({ minX: 0, minY: 0, maxX: 1, maxY: 1 });
    expectAssignable<BoundsWritable>({ minX: 0, minY: 0, maxX: 1, maxY: 1 });
  });

  test('root entry가 capsule type을 노출한다', () => {
    expectAssignable<Capsule>({ x1: 0, y1: 0, x2: 1, y2: 1, r: 2 });
    expectAssignable<CapsuleWritable>({ x1: 0, y1: 0, x2: 1, y2: 1, r: 2 });
  });

  test('root entry가 grid cell/spec type을 노출한다', () => {
    expectAssignable<GridCell>({ col: 1, row: 2 });
    expectAssignable<GridCellWritable>({ col: 0, row: 0 });
    expectAssignable<GridSpec>({ originX: 0, originY: 0, cellWidth: 10, cellHeight: 20 });
  });

  test('root entry가 polyline type을 노출한다', () => {
    expectAssignable<Polyline>([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
    expectAssignable<PolylineWritable>([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
    expectAssignable<PolylineSubdivideOptions>({ segmentsPerSegment: 2 });
    expectAssignable<PolylineConcatOptions>({ weldTolerance: 0.5 });
    expectAssignable<PolylineConcatOptions>({ weldTolerance: 0 });
  });

  test('root entry가 polygon type을 노출한다', () => {
    expectAssignable<Polygon>([0, 0, 1, 1]);
    expectAssignable<PolygonWritable>([0, 0, 1, 1]);
  });

  test('root entry가 segment type을 노출한다', () => {
    expectAssignable<Segment>({ x1: 0, y1: 0, x2: 1, y2: 1 });
    expectAssignable<SegmentWritable>({ x1: 0, y1: 0, x2: 1, y2: 1 });
    expectAssignable<SegmentSplitWritable>({
      left: { x1: 0, y1: 0, x2: 1, y2: 1 },
      right: { x1: 1, y1: 1, x2: 2, y2: 2 },
    });
    expectAssignable<SegmentSplit>({
      left: { x1: 0, y1: 0, x2: 1, y2: 1 },
      right: { x1: 1, y1: 1, x2: 2, y2: 2 },
    });
  });

  test('root entry가 triangle type을 노출한다', () => {
    expectAssignable<Triangle>({ x1: 0, y1: 0, x2: 1, y2: 0, x3: 0, y3: 1 });
    expectAssignable<TriangleWritable>({ x1: 0, y1: 0, x2: 1, y2: 0, x3: 0, y3: 1 });
  });

  test('root entry가 barycentric type을 노출한다', () => {
    const bary = expectAssignable<BarycentricLike>({ x: 0.25, y: 0.25, w: 0.5 });
    expectAssignable<BarycentricLike>(bary);
    const writable = expectAssignable<BarycentricWritable>({ x: 0.25, y: 0.25, w: 0.5 });
    // BarycentricWritable은 BarycentricLike에 할당 가능하다.
    expectAssignable<BarycentricLike>(writable);
  });

  test('root entry가 ellipse type을 노출한다', () => {
    expectAssignable<Ellipse>({ cx: 0, cy: 0, rx: 2, ry: 1 });
    expectAssignable<EllipseWritable>({ cx: 0, cy: 0, rx: 2, ry: 1 });
  });

  test('root entry가 rotated ellipse type을 노출한다', () => {
    expectAssignable<RotatedEllipse>({ cx: 0, cy: 0, rx: 2, ry: 1, rotation: 0 });
    expectAssignable<RotatedEllipseWritable>({ cx: 0, cy: 0, rx: 2, ry: 1, rotation: 0 });
  });

  test('root entry가 ray type을 노출한다', () => {
    expectAssignable<Ray>({ ox: 0, oy: 0, dx: 1, dy: 0 });
    expectAssignable<RayWritable>({ ox: 0, oy: 0, dx: 1, dy: 0 });
  });

  test('root entry가 rect alignment type을 노출한다', () => {
    const anchor = expectAssignable<RectAlignAnchor>('bottom-right');
    expectAssignable<RectAlignOptions>({ anchor });
    expectAssignable<RectAlignOptions>({});
  });

  test('root entry가 matrixToPose 옵션 type을 노출한다', () => {
    expectAssignable<MatrixToPoseOptions>({ epsilon: 1e-6 });
  });

  test('root entry가 poseApproxEquals 옵션 type을 노출한다', () => {
    expectAssignable<PoseApproxEqualsOptions>({ positionEpsilon: 1e-6, angleEpsilon: 1e-6 });
  });

  test('root entry가 poseDistance 옵션 type을 노출한다', () => {
    expectAssignable<PoseDistanceOptions>({ angularWeight: 2 });
  });

  test('root entry가 infinite-line type을 노출한다', () => {
    expectAssignable<InfiniteLine>({ ox: 0, oy: 0, dx: 1, dy: 0 });
    expectAssignable<InfiniteLineWritable>({ ox: 0, oy: 0, dx: 1, dy: 0 });
  });

  test('root entry가 Sdf2 callable type을 노출한다', () => {
    const field = expectAssignable<Sdf2>((_point) => 0);
    expectAssignable<Sdf2>(field);
    expectAssignable<number>(field({ x: 0, y: 0 }));
  });

  test('root entry가 fitting type을 노출한다', () => {
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
    expectAssignable<Matrix>({ a: 1, b: 0, c: 0, d: 1, tx: 2, ty: 3 });
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
  });
});
