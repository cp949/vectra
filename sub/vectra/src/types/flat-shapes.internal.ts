/** ADR 0010의 도형 입력과 출력 타입을 모은다. */

import type { CenterArcLike } from './arc.internal';
import type { HexOrientation } from './hex-grid.internal';

export type { CenterArcWritable } from './arc.internal';

export type CenterArc = CenterArcLike;

export interface PointWritable {
  x: number;
  y: number;
}

export type Point = Readonly<PointWritable>;

export interface CircleWritable {
  cx: number;
  cy: number;
  r: number;
}

export type Circle = Readonly<CircleWritable>;

export interface EllipseWritable {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export type Ellipse = Readonly<EllipseWritable>;

/** rotation은 radian 단위다. */
export interface RotatedEllipseWritable {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation: number;
}

export type RotatedEllipse = Readonly<RotatedEllipseWritable>;

export interface SegmentWritable {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type Segment = Readonly<SegmentWritable>;

export interface CapsuleWritable {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r: number;
}

export type Capsule = Readonly<CapsuleWritable>;

export interface TriangleWritable {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

export type Triangle = Readonly<TriangleWritable>;

/** 원점에서 방향 벡터 쪽으로 뻗는다. */
export interface RayWritable {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
}

export type Ray = Readonly<RayWritable>;

/** 원점에서 방향 벡터 양쪽으로 뻗는다. */
export interface InfiniteLineWritable {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
}

export type InfiniteLine = Readonly<InfiniteLineWritable>;

export interface BoundsWritable {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type Bounds = Readonly<BoundsWritable>;

export interface RectWritable {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Rect = Readonly<RectWritable>;

/** angle은 radian 단위다. */
export interface OrientedRectWritable {
  cx: number;
  cy: number;
  width: number;
  height: number;
  angle: number;
}

export type OrientedRect = Readonly<OrientedRectWritable>;

/** 평행 이동과 회전을 나타낸다. angle은 radian 단위다. */
export interface Pose2Writable {
  px: number;
  py: number;
  angle: number;
}

export type Pose2 = Readonly<Pose2Writable>;

export interface MatrixWritable {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}

export type Matrix = Readonly<MatrixWritable>;

export interface GridCellWritable {
  col: number;
  row: number;
}

export type GridCell = Readonly<GridCellWritable>;

export interface HexAxialWritable {
  q: number;
  r: number;
}

export type HexAxial = Readonly<HexAxialWritable>;

/** q + r + s는 0이어야 한다. */
export interface HexCubeWritable {
  q: number;
  r: number;
  s: number;
}

export type HexCube = Readonly<HexCubeWritable>;

export interface HexOffsetWritable {
  col: number;
  row: number;
}

export type HexOffset = Readonly<HexOffsetWritable>;

/** cell 크기는 축마다 positive finite여야 한다. */
export interface GridSpec {
  readonly originX: number;
  readonly originY: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
}

/** size는 positive finite여야 한다. */
export interface HexLayout {
  readonly originX: number;
  readonly originY: number;
  readonly size: number;
  readonly orientation: HexOrientation;
}

export interface QuadraticCurveWritable {
  kind: 'quadratic';
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CubicCurveWritable {
  kind: 'cubic';
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

export type QuadraticCurve = Readonly<QuadraticCurveWritable>;
export type CubicCurve = Readonly<CubicCurveWritable>;
export type Curve = QuadraticCurve | CubicCurve;
export type CurveWritable = QuadraticCurveWritable | CubicCurveWritable;

/** 닫힌 ring의 좌표를 x, y 순으로 번갈아 저장한다. */
export type Polygon = readonly number[];
export type PolygonWritable = number[];

export type Polyline = readonly Point[];
export type PolylineWritable = PointWritable[];
