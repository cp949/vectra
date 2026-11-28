/** ADR 0010의 도형 입력과 출력 타입을 모은다. */

import type { HexOrientation } from './hex-grid.internal';

export type { CenterArc, CenterArcWritable } from './arc.internal';

/** 쓰기 가능한 2차원 점이다. 반복 호출에는 필드 구성과 순서가 같은 출력 객체를 쓴다. */
export interface PointWritable {
  /** x 좌표 */
  x: number;

  /** y 좌표 */
  y: number;
}

/**
 * 읽기 전용 2차원 점이다.
 *
 * 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. `Rect`처럼 추가 필드가
 * 있는 객체를 함께 넘기면 속성 접근이 느려진다.
 */
export type Point = Readonly<PointWritable>;

export interface CircleWritable {
  /** 중심의 x 좌표 */
  cx: number;

  /** 중심의 y 좌표 */
  cy: number;

  /** 반지름 */
  r: number;
}

/** 평평한 원이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Circle = Readonly<CircleWritable>;

export interface EllipseWritable {
  /** 중심의 x 좌표 */
  cx: number;

  /** 중심의 y 좌표 */
  cy: number;

  /** x축 반지름 */
  rx: number;

  /** y축 반지름 */
  ry: number;
}

/** 축에 정렬된 타원이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Ellipse = Readonly<EllipseWritable>;

/** rotation은 radian 단위다. */
export interface RotatedEllipseWritable {
  /** 중심의 x 좌표 */
  cx: number;

  /** 중심의 y 좌표 */
  cy: number;

  /** 회전 전 x축 반지름 */
  rx: number;

  /** 회전 전 y축 반지름 */
  ry: number;

  /** x축에서 잰 회전 각도. 단위는 radian이다. */
  rotation: number;
}

/** 회전한 타원이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type RotatedEllipse = Readonly<RotatedEllipseWritable>;

export interface SegmentWritable {
  /** 시작점의 x 좌표 */
  x1: number;

  /** 시작점의 y 좌표 */
  y1: number;

  /** 끝점의 x 좌표 */
  x2: number;

  /** 끝점의 y 좌표 */
  y2: number;
}

/** 두 끝점 사이의 선분이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Segment = Readonly<SegmentWritable>;

export interface CapsuleWritable {
  /** 중심 선분 시작점의 x 좌표 */
  x1: number;

  /** 중심 선분 시작점의 y 좌표 */
  y1: number;

  /** 중심 선분 끝점의 x 좌표 */
  x2: number;

  /** 중심 선분 끝점의 y 좌표 */
  y2: number;

  /** 중심 선분에서 외곽까지의 반지름 */
  r: number;
}

/** 중심 선분과 반지름으로 정의한 캡슐이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Capsule = Readonly<CapsuleWritable>;

export interface TriangleWritable {
  /** 첫 꼭짓점의 x 좌표 */
  x1: number;

  /** 첫 꼭짓점의 y 좌표 */
  y1: number;

  /** 둘째 꼭짓점의 x 좌표 */
  x2: number;

  /** 둘째 꼭짓점의 y 좌표 */
  y2: number;

  /** 셋째 꼭짓점의 x 좌표 */
  x3: number;

  /** 셋째 꼭짓점의 y 좌표 */
  y3: number;
}

/** 세 꼭짓점으로 정의한 삼각형이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Triangle = Readonly<TriangleWritable>;

/** 원점에서 방향 벡터 쪽으로 뻗는다. */
export interface RayWritable {
  /** 광선 원점의 x 좌표 */
  ox: number;

  /** 광선 원점의 y 좌표 */
  oy: number;

  /** 방향 벡터의 x 성분 */
  dx: number;

  /** 방향 벡터의 y 성분 */
  dy: number;
}

/** 한쪽으로 뻗는 광선이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Ray = Readonly<RayWritable>;

/** 원점에서 방향 벡터 양쪽으로 뻗는다. */
export interface InfiniteLineWritable {
  /** 직선 위 기준점의 x 좌표 */
  ox: number;

  /** 직선 위 기준점의 y 좌표 */
  oy: number;

  /** 방향 벡터의 x 성분 */
  dx: number;

  /** 방향 벡터의 y 성분 */
  dy: number;
}

/** 양쪽으로 뻗는 직선이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type InfiniteLine = Readonly<InfiniteLineWritable>;

export interface BoundsWritable {
  /** x축 하한 좌표 */
  minX: number;

  /** y축 하한 좌표 */
  minY: number;

  /** x축 상한 좌표 */
  maxX: number;

  /** y축 상한 좌표 */
  maxY: number;
}

/** 축별 하한과 상한으로 정의한 경계다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Bounds = Readonly<BoundsWritable>;

/** (x, y)는 왼쪽 위 꼭짓점이다. */
export interface RectWritable {
  /** 왼쪽 위 꼭짓점의 x 좌표 */
  x: number;

  /** 왼쪽 위 꼭짓점의 y 좌표 */
  y: number;

  /** x축 너비 */
  width: number;

  /** y축 높이 */
  height: number;
}

/** 축에 정렬된 사각형이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Rect = Readonly<RectWritable>;

/** angle은 radian 단위다. */
export interface OrientedRectWritable {
  /** 중심의 x 좌표 */
  cx: number;

  /** 중심의 y 좌표 */
  cy: number;

  /** 회전 전 x축 너비 */
  width: number;

  /** 회전 전 y축 높이 */
  height: number;

  /** x축에서 잰 회전 각도. 단위는 radian이다. */
  angle: number;
}

/** 중심 주위로 회전한 사각형이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type OrientedRect = Readonly<OrientedRectWritable>;

/** 평행 이동과 회전을 나타낸다. angle은 radian 단위다. */
export interface Pose2Writable {
  /** x축 평행 이동량 */
  px: number;

  /** y축 평행 이동량 */
  py: number;

  /** 회전 각도. 단위는 radian이다. */
  angle: number;
}

/** 2차원 위치와 방향이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Pose2 = Readonly<Pose2Writable>;

/**
 * 2D affine 변환이다.
 *
 * x축 basis는 (a, b), y축 basis는 (c, d), 평행 이동은 (tx, ty)다.
 */
export interface MatrixWritable {
  /** 변환한 x축 단위 벡터의 x 성분 */
  a: number;

  /** 변환한 x축 단위 벡터의 y 성분 */
  b: number;

  /** 변환한 y축 단위 벡터의 x 성분 */
  c: number;

  /** 변환한 y축 단위 벡터의 y 성분 */
  d: number;

  /** x축 평행 이동량 */
  tx: number;

  /** y축 평행 이동량 */
  ty: number;
}

/** 2차원 affine 변환이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type Matrix = Readonly<MatrixWritable>;

export interface GridCellWritable {
  /** 열 인덱스 */
  col: number;

  /** 행 인덱스 */
  row: number;
}

/** 직사각 격자의 셀 인덱스다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type GridCell = Readonly<GridCellWritable>;

export interface HexAxialWritable {
  /** axial 좌표의 q축 성분 */
  q: number;

  /** axial 좌표의 r축 성분 */
  r: number;
}

/** 육각 격자의 axial 좌표다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type HexAxial = Readonly<HexAxialWritable>;

/** q + r + s는 0이어야 한다. */
export interface HexCubeWritable {
  /** cube 좌표의 q축 성분 */
  q: number;

  /** cube 좌표의 r축 성분 */
  r: number;

  /** cube 좌표의 s축 성분 */
  s: number;
}

/** 육각 격자의 cube 좌표다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type HexCube = Readonly<HexCubeWritable>;

export interface HexOffsetWritable {
  /** offset 좌표의 열 인덱스 */
  col: number;

  /** offset 좌표의 행 인덱스 */
  row: number;
}

/** 육각 격자의 offset 좌표다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type HexOffset = Readonly<HexOffsetWritable>;

/** 셀 크기는 축마다 유한한 양수다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export interface GridSpec {
  /** 격자 원점의 x 좌표 */
  readonly originX: number;

  /** 격자 원점의 y 좌표 */
  readonly originY: number;

  /** 한 셀의 x축 너비 */
  readonly cellWidth: number;

  /** 한 셀의 y축 높이 */
  readonly cellHeight: number;
}

/** size는 유한한 양수다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export interface HexLayout {
  /** 육각 셀 좌표 (0, 0)의 중심 x 좌표 */
  readonly originX: number;

  /** 육각 셀 좌표 (0, 0)의 중심 y 좌표 */
  readonly originY: number;

  /** 셀 중심에서 꼭짓점까지의 거리 */
  readonly size: number;

  /** 꼭짓점이 위를 향하는지 변이 위를 향하는지 정한다. */
  readonly orientation: HexOrientation;
}

/** 네 방향 확장량이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export interface BoundsPadding {
  /** y축 하한 쪽 확장량 */
  readonly top: number;

  /** x축 상한 쪽 확장량 */
  readonly right: number;

  /** y축 상한 쪽 확장량 */
  readonly bottom: number;

  /** x축 하한 쪽 확장량 */
  readonly left: number;
}

export interface QuadraticCurveWritable {
  /** 2차 Bézier를 구분한다. */
  kind: 'quadratic';

  /** 시작점의 x 좌표 */
  x0: number;

  /** 시작점의 y 좌표 */
  y0: number;

  /** 제어점의 x 좌표 */
  x1: number;

  /** 제어점의 y 좌표 */
  y1: number;

  /** 끝점의 x 좌표 */
  x2: number;

  /** 끝점의 y 좌표 */
  y2: number;
}

export interface CubicCurveWritable {
  /** 3차 Bézier를 구분한다. */
  kind: 'cubic';

  /** 시작점의 x 좌표 */
  x0: number;

  /** 시작점의 y 좌표 */
  y0: number;

  /** 첫 제어점의 x 좌표 */
  x1: number;

  /** 첫 제어점의 y 좌표 */
  y1: number;

  /** 둘째 제어점의 x 좌표 */
  x2: number;

  /** 둘째 제어점의 y 좌표 */
  y2: number;

  /** 끝점의 x 좌표 */
  x3: number;

  /** 끝점의 y 좌표 */
  y3: number;
}

/** 2차 Bézier 곡선이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type QuadraticCurve = Readonly<QuadraticCurveWritable>;

/** 3차 Bézier 곡선이다. 반복 호출에는 필드 구성과 순서가 같은 객체를 넘긴다. */
export type CubicCurve = Readonly<CubicCurveWritable>;

/** kind로 종류를 구분한다. 같은 종류 안에서는 필드 구성과 순서를 고정한다. */
export type Curve = QuadraticCurve | CubicCurve;
export type CurveWritable = QuadraticCurveWritable | CubicCurveWritable;

/**
 * 닫힌 ring의 좌표를 x, y 순으로 번갈아 저장한다.
 *
 * 길이는 짝수다. 홀수 길이는 검사하지 않으며 결과를 정의하지 않는다.
 */
export type Polygon = readonly number[];

/** x, y 순서로 번갈아 기록하는 다각형 출력 배열이다. */
export type PolygonWritable = number[];

/** 이어지는 점의 목록이다. 각 점의 필드 구성과 순서를 고정한다. */
export type Polyline = readonly Point[];

/** 이어지는 점을 기록하는 출력 배열이다. 각 점의 필드 구성과 순서를 고정한다. */
export type PolylineWritable = PointWritable[];
