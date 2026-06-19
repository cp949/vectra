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
 * `point`는 `XYObjectWritable` 형식의 새 plain object로 curve 위 점 좌표를 담는다.
 * `t`는 curve-local parameter `[0, 1]`,
 * `distance`는 query까지의 Euclidean distance, `distanceSquared`는 그 제곱이다.
 *
 * `distance`는 `Math.sqrt(distanceSquared)`로 계산한다. oversized finite 좌표로
 * `distanceSquared`가 `Infinity`가 되면 `distance`도 `Infinity`다.
 */
export interface CurveLocationResult {
  /** curve 위 closest point 좌표 */
  point: XYObjectWritable;

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
 * `point`/`tangent`/`normal`은 object 또는 tuple writable point storage이고, `curvature`는 scalar다.
 */
export interface CurveFrenetFrameWritable {
  /** curve 위 evaluation point storage */
  point: XYWritable;

  /** unit tangent vector storage. zero derivative이면 zero vector */
  tangent: XYWritable;

  /** unit normal vector storage. zero derivative이면 zero vector */
  normal: XYWritable;

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
  point: XYObjectWritable;

  /** unit tangent vector. zero derivative이면 zero vector */
  tangent: XYObjectWritable;

  /** unit normal vector. zero derivative이면 zero vector */
  normal: XYObjectWritable;

  /** signed curvature. degenerate(zero derivative)이면 `0` */
  curvature: number;
}

/**
 * point-list curve 계산에 필요한 4-point neighborhood 결과 shape.
 *
 * `controlPoints`가 반환하는 읽기용 형태다. 기본 point 표현은 `XYObjectWritable`(`{ x, y }`)이다.
 */
export interface CurveControlPoints<P = XYObjectWritable> {
  /** 직전 이웃 점. open edge에서 없으면 `current` */
  previous: P;

  /** current point index가 가리키는 점 */
  current: P;

  /** 다음 이웃 점. open edge에서 없으면 `current` */
  next: P;

  /** 다다음 이웃 점. open edge에서 없으면 `next` */
  nextNext: P;
}

/**
 * `controlPointsInto`가 4-point neighborhood를 기록하는 writable output shape.
 *
 * 네 field는 각각 object 또는 tuple writable point storage다.
 */
export interface CurveControlPointsWritable<P extends XYWritable = XYWritable> {
  /** 직전 이웃 점 storage */
  previous: P;

  /** current point storage */
  current: P;

  /** 다음 이웃 점 storage */
  next: P;

  /** 다다음 이웃 점 storage */
  nextNext: P;
}
