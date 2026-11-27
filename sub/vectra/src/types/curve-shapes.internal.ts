import type { PointWritable } from './flat-shapes.internal';
import type { XYObjectWritable, XYWritable } from './xy.internal';

/**
 * 세 개의 writable control point에 결과를 기록할 수 있는 structural quadratic Bezier curve output.
 *
 * `p0`은 시작점, `p1`은 제어점, `p2`는 끝점이다.
 */
export interface QuadraticCurveWritable<
  P0 extends XYWritable = XYObjectWritable,
  P1 extends XYWritable = XYObjectWritable,
  P2 extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 시작점 */
  p0: P0;

  /** 기록 가능한 제어점 */
  p1: P1;

  /** 기록 가능한 끝점 */
  p2: P2;
}

/**
 * 네 개의 writable control point에 결과를 기록할 수 있는 structural cubic Bezier curve output.
 *
 * `p0`은 시작점, `p1`은 첫 번째 제어점, `p2`는 두 번째 제어점, `p3`는 끝점이다.
 */
export interface CubicCurveWritable<
  P0 extends XYWritable = XYObjectWritable,
  P1 extends XYWritable = XYObjectWritable,
  P2 extends XYWritable = XYObjectWritable,
  P3 extends XYWritable = XYObjectWritable,
> {
  /** 기록 가능한 시작점 */
  p0: P0;

  /** 기록 가능한 첫 번째 제어점 */
  p1: P1;

  /** 기록 가능한 두 번째 제어점 */
  p2: P2;

  /** 기록 가능한 끝점 */
  p3: P3;
}

/** cubic Bezier 형태 분류 결과. */
export type CubicCurveType = 'line' | 'quadratic' | 'cusp' | 'loop' | 'serpentine';

/**
 * curve lookup table의 entry 1건.
 *
 * uniform t sample의 cumulative chord-length approximation을 담는다.
 * `length`는 exact arc length가 아니라 인접 sample 사이 chord distance 누적값이다.
 */
export interface CurveLookupEntry {
  /** sample parameter, `[0, 1]` */
  t: number;

  /** curve 시작점부터 이 sample까지 chord distance 누적값. nondecreasing */
  length: number;
}

/**
 * curve 위 closest location 결과.
 *
 * `point`는 curve 위 좌표를 담은 새 점 객체다.
 * `t`는 curve-local parameter `[0, 1]`,
 * `distance`는 query까지의 Euclidean distance, `distanceSquared`는 그 제곱이다.
 *
 * `distance`는 `Math.sqrt(distanceSquared)`로 계산한다. oversized finite 좌표로
 * `distanceSquared`가 `Infinity`가 되면 `distance`도 `Infinity`다.
 */
export interface CurveLocationResult {
  /** curve 위 closest point 좌표 */
  point: PointWritable;

  /** curve-local parameter, `[0, 1]`로 clamp된다 */
  t: number;

  /** query까지의 Euclidean distance */
  distance: number;

  /** query까지 거리의 제곱 */
  distanceSquared: number;
}

/**
 * `curveFrenetFrameAtInto`가 결과를 기록하는 writable output shape.
 *
 * `point`/`tangent`/`normal`은 점 객체이고, `curvature`는 scalar다.
 */
export interface CurveFrenetFrameWritable {
  /** curve 위 evaluation point storage */
  point: PointWritable;

  /** unit tangent vector storage. zero derivative이면 zero vector */
  tangent: PointWritable;

  /** unit normal vector storage. zero derivative이면 zero vector */
  normal: PointWritable;

  /** signed curvature. degenerate(zero derivative)이면 `0` */
  curvature: number;
}

/**
 * `curveFrenetFrameAt`이 반환하는 nested plain result object.
 *
 * `point`/`tangent`/`normal`은 새 `{ x, y }` object이고, `curvature`는 scalar다.
 */
export interface CurveFrenetFrameResult {
  /** curve 위 evaluation point */
  point: PointWritable;

  /** unit tangent vector. zero derivative이면 zero vector */
  tangent: PointWritable;

  /** unit normal vector. zero derivative이면 zero vector */
  normal: PointWritable;

  /** signed curvature. degenerate(zero derivative)이면 `0` */
  curvature: number;
}

/**
 * point-list curve 계산에 필요한 4-point neighborhood 결과 shape.
 *
 * `controlPoints`가 반환하는 읽기용 형태다. 각 점은 `{ x, y }` 객체다.
 */
export interface CurveControlPoints {
  /** 직전 이웃 점. open edge에서 없으면 `current` */
  previous: PointWritable;

  /** current point index가 가리키는 점 */
  current: PointWritable;

  /** 다음 이웃 점. open edge에서 없으면 `current` */
  next: PointWritable;

  /** 다다음 이웃 점. open edge에서 없으면 `next` */
  nextNext: PointWritable;
}

/**
 * `controlPointsInto`가 4-point neighborhood를 기록하는 writable output shape.
 *
 * 네 field는 각각 점 객체다.
 */
export interface CurveControlPointsWritable {
  /** 직전 이웃 점 storage */
  previous: PointWritable;

  /** current point storage */
  current: PointWritable;

  /** 다음 이웃 점 storage */
  next: PointWritable;

  /** 다다음 이웃 점 storage */
  nextNext: PointWritable;
}
